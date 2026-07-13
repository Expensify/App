import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import {getReportPreviewAction} from '@libs/actions/IOU/MoneyRequestBuilder';
import {translate as translateForLocale} from '@libs/Localize';
import {getIsOffline} from '@libs/NetworkState';
import {getLinkedTransactionID} from '@libs/ReportActionsUtils';
import {computeReportName} from '@libs/ReportNameUtils';
import {
    generateIsEmptyReport,
    generateReportAttributes,
    hasViolations,
    hasVisibleReportFieldViolations,
    isArchivedReport,
    isOpenReport,
    isPolicyAdmin,
    isPolicyExpenseChat,
    isProcessingReport,
    isValidReport,
} from '@libs/ReportUtils';
import SidebarUtils from '@libs/SidebarUtils';

import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';
import {hasKeyTriggeredCompute} from '@userActions/OnyxDerived/utils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, PersonalDetailsList, Policy, Report, ReportAttributesDerivedValue, TransactionViolation} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';

// Per-account signature of the fields that feed a report's display name, keyed by accountID. See
// snapshotDisplayNames for which fields, and getDisplayNameForParticipant/getDisplayNameOrDefault for why.
let previousDisplayNames: Record<string, string> = {};
let previousPersonalDetails: OnyxEntry<PersonalDetailsList> | undefined;
let previousPolicies: OnyxCollection<Policy>;

// Sentinel returned by getDisplayNameChanges when we can't scope the change to specific accounts
// (first load this session) and must recompute every report's name.
const RECOMPUTE_ALL = 'all' as const;

const prepareReportKeys = (keys: string[]) => {
    return [
        ...new Set(
            keys.map((key) =>
                key
                    .replace(ONYXKEYS.COLLECTION.REPORT_METADATA, ONYXKEYS.COLLECTION.REPORT)
                    .replace(ONYXKEYS.COLLECTION.REPORT_ACTIONS, ONYXKEYS.COLLECTION.REPORT)
                    .replace(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, ONYXKEYS.COLLECTION.REPORT),
            ),
        ),
    ];
};

const hasPolicyRelevantFieldChanged = (prev: Policy | null | undefined, next: Policy | null | undefined): boolean => {
    if (!prev && !next) {
        return false;
    }
    if (!prev || !next) {
        return true;
    }
    return (
        prev.type !== next.type ||
        prev.approvalMode !== next.approvalMode ||
        prev.reimbursementChoice !== next.reimbursementChoice ||
        prev.autoReimbursementLimit !== next.autoReimbursementLimit ||
        prev.role !== next.role ||
        prev.autoReimbursement?.limit !== next.autoReimbursement?.limit
    );
};

// Signature of the fields a report's display name is derived from: displayName (primary), firstName
// (group-chat short form), and login (fallback when no name is set). A change to any of them can change a
// report name, so all three are diffed — not just displayName. See getDisplayNameForParticipant/getDisplayNameOrDefault.
const displayNameSignature = (details: PersonalDetails | null): string => JSON.stringify([details?.displayName ?? '', details?.firstName ?? '', details?.login ?? '']);

const snapshotDisplayNames = (personalDetails: PersonalDetailsList): Record<string, string> => {
    const snapshot: Record<string, string> = {};
    for (const [key, value] of Object.entries(personalDetails)) {
        snapshot[key] = displayNameSignature(value);
    }
    return snapshot;
};

// Records the personal-details snapshot that report names were last computed against. Kept as a single
// helper so the two correlated module vars can't drift out of sync.
const commitDisplayNamesBaseline = (personalDetails: OnyxEntry<PersonalDetailsList>, snapshot: Record<string, string>) => {
    previousDisplayNames = snapshot;
    previousPersonalDetails = personalDetails;
};

// Seeds the display-name baseline from the current personal details without recomputing. Used on the first
// pass that has personal details but wasn't triggered by them: currentValue's names were already computed
// against these same details, so establishing the baseline here lets the *next* personal-details change be
// diffed and scoped to affected reports, instead of hitting the empty-baseline full-recompute path.
const seedDisplayNamesBaseline = (personalDetails: OnyxEntry<PersonalDetailsList>) => {
    if (!personalDetails || previousPersonalDetails === personalDetails || Object.keys(previousDisplayNames).length > 0) {
        return;
    }
    commitDisplayNamesBaseline(personalDetails, snapshotDisplayNames(personalDetails));
};

// Returns the set of accountIDs whose display-name signature changed since the last compute, or:
//   - null   → nothing changed (caller can early-return)
//   - 'all'  → no baseline to diff against yet; recompute every report
// Scoping to changed accountIDs lets the caller recompute only the reports that reference them,
// instead of every report in the store.
const getDisplayNameChanges = (personalDetails: OnyxEntry<PersonalDetailsList>): Set<number> | typeof RECOMPUTE_ALL | null => {
    if (!personalDetails) {
        return null;
    }

    // Fast path: if reference hasn't changed, display names are definitely the same
    if (previousPersonalDetails === personalDetails) {
        return null;
    }

    const hadBaseline = Object.keys(previousDisplayNames).length > 0;
    const nextSnapshot: Record<string, string> = {};
    const changedAccountIDs = new Set<number>();

    // Single pass: build the new baseline signature and diff it against the previous one at the same time.
    for (const [key, value] of Object.entries(personalDetails)) {
        const signature = displayNameSignature(value);
        nextSnapshot[key] = signature;
        if (hadBaseline && signature !== previousDisplayNames[key]) {
            changedAccountIDs.add(Number(key));
        }
    }
    // Account IDs present before but gone now also invalidate any report name that referenced them.
    if (hadBaseline) {
        for (const key of Object.keys(previousDisplayNames)) {
            if (!(key in nextSnapshot)) {
                changedAccountIDs.add(Number(key));
            }
        }
    }

    commitDisplayNamesBaseline(personalDetails, nextSnapshot);

    if (!hadBaseline) {
        return Object.keys(nextSnapshot).length > 0 ? RECOMPUTE_ALL : null;
    }
    return changedAccountIDs.size > 0 ? changedAccountIDs : null;
};

// The report-record fields whose accountIDs feed a report's display name: owner, manager, individual invoice
// receiver, and participants. This intentionally does not cover thread names derived from parent-report data
// (see computeReportNameBasedOnReportAction) — those are re-evaluated when the parent's own data changes.
const reportReferencesAccountIDs = (report: Report, accountIDs: Set<number>): boolean => {
    if (report.ownerAccountID !== undefined && accountIDs.has(report.ownerAccountID)) {
        return true;
    }
    if (report.managerID !== undefined && accountIDs.has(report.managerID)) {
        return true;
    }
    if (report.invoiceReceiver?.type === CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL && accountIDs.has(report.invoiceReceiver.accountID)) {
        return true;
    }
    for (const participantID of Object.keys(report.participants ?? {})) {
        if (accountIDs.has(Number(participantID))) {
            return true;
        }
    }
    return false;
};

// Returns the report-preview action ID of the oldest child in `reportIDs` matching `predicate`
// (oldest by preview-action creation time), or undefined when none match.
const getOldestPreviewActionID = (chatReportID: string, reportIDs: string[] | undefined, reports: OnyxCollection<Report>, predicate?: (childReport: OnyxEntry<Report>) => boolean) => {
    let oldestCreated: string | undefined;
    let targetReportActionID: string | undefined;
    for (const childReportID of reportIDs ?? []) {
        if (predicate && !predicate(reports?.[`${ONYXKEYS.COLLECTION.REPORT}${childReportID}`])) {
            continue;
        }
        const reportPreviewAction = getReportPreviewAction(chatReportID, childReportID);
        if (!reportPreviewAction) {
            continue;
        }
        if (oldestCreated === undefined || reportPreviewAction.created < oldestCreated) {
            oldestCreated = reportPreviewAction.created;
            targetReportActionID = reportPreviewAction.reportActionID;
        }
    }
    return targetReportActionID;
};

const isActionable = (childReport: OnyxEntry<Report>) => isOpenReport(childReport) || isProcessingReport(childReport);

// Open/processing and the user still needs to fix a violation on it. Violations are read directly from
// transactionViolations so this works even when owner data is absent (e.g. masked Onyx exports).
const needsViolationFix = (
    childReport: OnyxEntry<Report>,
    policies: OnyxCollection<Policy>,
    transactionViolations: OnyxCollection<TransactionViolation[]>,
    currentUserAccountID: number,
    currentUserEmail: string,
) => {
    if (!childReport || !isActionable(childReport)) {
        return false;
    }
    const childPolicy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${childReport.policyID}`];
    return hasViolations(childReport.reportID, transactionViolations, currentUserAccountID, currentUserEmail, true, undefined, childReport, childPolicy);
};

/**
 * This derived value is used to get the report attributes for the report.
 */
export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.REPORT_ATTRIBUTES,
    dependencies: [
        ONYXKEYS.COLLECTION.REPORT,
        ONYXKEYS.NVP_PREFERRED_LOCALE,
        ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS,
        ONYXKEYS.COLLECTION.REPORT_ACTIONS,
        ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS,
        ONYXKEYS.COLLECTION.TRANSACTION,
        ONYXKEYS.PERSONAL_DETAILS_LIST,
        ONYXKEYS.SESSION,
        ONYXKEYS.COLLECTION.POLICY,
        ONYXKEYS.COLLECTION.POLICY_TAGS,
        ONYXKEYS.CONCIERGE_REPORT_ID,
        ONYXKEYS.NVP_INTRO_SELECTED,
        ONYXKEYS.COLLECTION.REPORT_METADATA,
        ONYXKEYS.NETWORK,
    ],
    compute: (
        [
            reports,
            preferredLocale,
            transactionViolations,
            reportActions,
            reportNameValuePairs,
            transactions,
            personalDetails,
            session,
            policies,
            policyTags,
            conciergeReportID,
            introSelected,
        ],
        {currentValue, sourceValues},
    ) => {
        // Read the in-memory offline state directly (NETWORK is a dependency so recompute still fires when it changes).
        const isOffline = getIsOffline();
        const translate: LocalizedTranslate = (path, ...parameters) => translateForLocale(preferredLocale, path, ...parameters);
        // Check if display names changed when personal details are updated
        let displayNameChanges: Set<number> | typeof RECOMPUTE_ALL | null = null;
        if (hasKeyTriggeredCompute(ONYXKEYS.PERSONAL_DETAILS_LIST, sourceValues)) {
            displayNameChanges = getDisplayNameChanges(personalDetails);
            if (!displayNameChanges) {
                return currentValue ?? {reports: {}, locale: null};
            }
        } else if (!sourceValues) {
            previousDisplayNames = {};
            previousPersonalDetails = undefined;
        } else {
            // Establish the baseline early (before the first personal-details change) so that change can be scoped.
            seedDisplayNamesBaseline(personalDetails);
        }

        // A full recompute is needed when locale changes (report names are locale-dependent) or on the first
        // personal-details load (no baseline to diff against). A scoped display-name change does NOT force a
        // full recompute — only the reports referencing the changed accounts are recomputed (see below).
        // We compare preferredLocale against currentValue?.locale so that the first locale load on startup
        // (where both equal the same persisted value) does not trigger an unnecessary full recompute.
        let needsFullRecompute =
            (hasKeyTriggeredCompute(ONYXKEYS.NVP_PREFERRED_LOCALE, sourceValues) && preferredLocale !== currentValue?.locale) ||
            displayNameChanges === RECOMPUTE_ALL ||
            hasKeyTriggeredCompute(ONYXKEYS.CONCIERGE_REPORT_ID, sourceValues) ||
            hasKeyTriggeredCompute(ONYXKEYS.NVP_INTRO_SELECTED, sourceValues);

        // if policies are loaded first time, we need to recompute all report attributes to get correct action badge in LHN, such as Approve because it depends on policy's type (see canApproveIOU function)
        const policyChangedReportKeys: string[] = [];
        if (hasKeyTriggeredCompute(ONYXKEYS.COLLECTION.POLICY, sourceValues)) {
            if (Object.keys(previousPolicies ?? {}).length === 0 && Object.keys(policies ?? {}).length > 0) {
                needsFullRecompute = true;
            } else if (!needsFullRecompute) {
                // Policy updated — only recompute reports whose relevant fields actually changed
                const changedPolicyIDs = new Set<string>();
                for (const key of Object.keys(sourceValues?.[ONYXKEYS.COLLECTION.POLICY] ?? {})) {
                    if (hasPolicyRelevantFieldChanged(previousPolicies?.[key], policies?.[key])) {
                        changedPolicyIDs.add(key.replace(ONYXKEYS.COLLECTION.POLICY, ''));
                    }
                }
                if (changedPolicyIDs.size > 0) {
                    for (const [reportKey, report] of Object.entries(reports ?? {})) {
                        if (report?.policyID && changedPolicyIDs.has(report.policyID)) {
                            policyChangedReportKeys.push(reportKey);
                        }
                    }
                }
            }
            previousPolicies = policies;
        }

        // Use incremental updates when currentValue is already populated and no full recompute is required.
        // If currentValue has no reports (fresh install or cleared storage), fall back to a full scan.
        const useIncrementalUpdates = !!currentValue?.reports && Object.keys(currentValue.reports).length > 0 && !needsFullRecompute;

        // if we already computed the report attributes and there is no new reports data, return the current value
        if ((useIncrementalUpdates && !sourceValues) || !reports) {
            return currentValue ?? {reports: {}, locale: null};
        }

        const reportUpdates = sourceValues?.[ONYXKEYS.COLLECTION.REPORT] ?? {};
        const reportMetadataUpdates = sourceValues?.[ONYXKEYS.COLLECTION.REPORT_METADATA] ?? {};
        const reportActionsUpdates = sourceValues?.[ONYXKEYS.COLLECTION.REPORT_ACTIONS] ?? {};
        const reportNameValuePairsUpdates = sourceValues?.[ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS] ?? {};
        const transactionsUpdates = sourceValues?.[ONYXKEYS.COLLECTION.TRANSACTION];
        const transactionViolationsUpdates = sourceValues?.[ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS];
        const policyTagsUpdates = sourceValues?.[ONYXKEYS.COLLECTION.POLICY_TAGS];

        let dataToIterate = Object.keys(reports);
        // check if there are any report-related updates

        const reportUpdatesRelatedToReportActions = new Set<string>();

        for (const actions of Object.values(reportActionsUpdates)) {
            if (!actions) {
                continue;
            }

            for (const reportAction of Object.values(actions)) {
                if (reportAction?.childReportID) {
                    reportUpdatesRelatedToReportActions.add(`${ONYXKEYS.COLLECTION.REPORT}${reportAction.childReportID}`);
                }
            }
        }

        // When display names changed for a specific set of accounts, only the reports that reference one of
        // those accounts need their name recomputed — mirrors the incremental treatment of POLICY above.
        // Skipped when a full recompute is already scheduled (e.g. first personal-details load or locale change).
        // useIncrementalUpdates already implies !needsFullRecompute; when it's false we do a full scan anyway.
        const personalDetailsChangedReportKeys: string[] = [];
        if (displayNameChanges instanceof Set && useIncrementalUpdates) {
            for (const [reportKey, report] of Object.entries(reports)) {
                if (report && reportReferencesAccountIDs(report, displayNameChanges)) {
                    personalDetailsChangedReportKeys.push(reportKey);
                }
            }
        }

        const updates = [
            ...Object.keys(reportUpdates),
            ...Object.keys(reportMetadataUpdates),
            ...Object.keys(reportActionsUpdates),
            ...Object.keys(reportNameValuePairsUpdates),
            ...Array.from(reportUpdatesRelatedToReportActions),
            ...policyChangedReportKeys,
            ...personalDetailsChangedReportKeys,
        ];

        if (useIncrementalUpdates) {
            // if there are report-related updates, iterate over the updates
            if (updates.length > 0 || !!transactionsUpdates || !!transactionViolationsUpdates || !!policyTagsUpdates) {
                dataToIterate = [];
                if (updates.length > 0) {
                    dataToIterate = prepareReportKeys(updates);

                    // When an IOU report changes, we need to re-evaluate its parent chat report as well.
                    const parentChatReportIDsToUpdate = new Set<string>();
                    for (const reportKey of dataToIterate) {
                        const report = reports[reportKey];
                        if (report?.chatReportID && report.reportID !== report.chatReportID) {
                            parentChatReportIDsToUpdate.add(`${ONYXKEYS.COLLECTION.REPORT}${report.chatReportID}`);
                        }
                    }
                    if (parentChatReportIDsToUpdate.size > 0) {
                        dataToIterate.push(...Array.from(parentChatReportIDsToUpdate));
                    }
                }
                if (!!transactionsUpdates || !!transactionViolationsUpdates) {
                    let transactionReportIDs: string[] = [];
                    if (transactionsUpdates) {
                        transactionReportIDs = Object.values(transactionsUpdates).map((transaction) => `${ONYXKEYS.COLLECTION.REPORT}${transaction?.reportID}`);

                        const updatedTransactionIDs = new Set(Object.keys(transactionsUpdates).map((key) => key.replace(ONYXKEYS.COLLECTION.TRANSACTION, '')));
                        if (updatedTransactionIDs.size > 0) {
                            for (const report of Object.values(reports)) {
                                if (!report?.reportID || !report.parentReportID || !report.parentReportActionID) {
                                    continue;
                                }

                                const parentReportAction = reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.parentReportID}`]?.[report.parentReportActionID];
                                const linkedTransactionID = getLinkedTransactionID(parentReportAction);
                                if (linkedTransactionID && updatedTransactionIDs.has(linkedTransactionID)) {
                                    transactionReportIDs.push(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`);
                                }
                            }
                        }
                    }
                    // Also handle transaction violations updates by extracting transaction IDs and finding their reports
                    if (transactionViolationsUpdates) {
                        const violationTransactionIDs = Object.keys(transactionViolationsUpdates).map((key) => key.replace(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, ''));
                        const violationReportIDs = violationTransactionIDs
                            .map((transactionID) => transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]?.reportID)
                            .filter(Boolean)
                            .map((reportID) => `${ONYXKEYS.COLLECTION.REPORT}${reportID}`);

                        // Also include chat reports for expense reports that have violations
                        const chatReportIDs = violationReportIDs
                            .map((reportKey) => reports?.[reportKey]?.chatReportID)
                            .filter(Boolean)
                            .map((chatReportID) => `${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`);

                        transactionReportIDs = [...transactionReportIDs, ...violationReportIDs, ...chatReportIDs];
                    }

                    // A transaction change (e.g. a card expense going from pending to posted) can flip whether its
                    // expense report requires attention, but the to-do/GBR render on the parent workspace chat.
                    // Enqueue those parent chats too so their attributes don't stay stale after the transaction updates.
                    const transactionParentChatReportIDs = transactionReportIDs
                        .map((reportKey) => reports?.[reportKey]?.chatReportID)
                        .filter(Boolean)
                        .map((chatReportID) => `${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`);

                    dataToIterate.push(...prepareReportKeys([...transactionReportIDs, ...transactionParentChatReportIDs]));
                }
                if (policyTagsUpdates) {
                    const changedPolicyIDs = new Set(Object.keys(policyTagsUpdates).map((key) => key.replace(ONYXKEYS.COLLECTION.POLICY_TAGS, '')));
                    const affectedReportKeys = Object.values(reports)
                        .filter((report) => !!report?.policyID && changedPolicyIDs.has(report.policyID))
                        .map((report) => `${ONYXKEYS.COLLECTION.REPORT}${report?.reportID}`);
                    dataToIterate.push(...prepareReportKeys(affectedReportKeys));
                }
            } else {
                // No updates to process, return current value to prevent unnecessary computation
                return currentValue ?? {reports: {}, locale: null};
            }
        }

        const reportAttributes = dataToIterate.reduce<ReportAttributesDerivedValue['reports']>(
            (acc, key) => {
                // source value sends partial data, so we need an entire report object to do computations
                const report = reports[key];

                if (!report || !isValidReport(report)) {
                    const reportID = key.replace(ONYXKEYS.COLLECTION.REPORT, '');
                    if (acc[reportID]) {
                        delete acc[reportID];
                    }
                    return acc;
                }

                const chatReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${report.chatReportID}`];
                const reportNameValuePair = reportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`];
                const reportActionsList = reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`];
                const isReportArchived = isArchivedReport(reportNameValuePair);
                const {
                    hasAnyViolations,
                    requiresAttention,
                    reportErrors,
                    oneTransactionThreadReportID,
                    actionBadge: actionGreenBadge,
                    actionTargetReportActionID: actionGreenTargetReportActionID,
                } = generateReportAttributes({
                    report,
                    chatReport,
                    reportActions,
                    transactionViolations,
                    isReportArchived,
                    allTransactions: transactions,
                    reports,
                    policies,
                    currentUserAccountID: session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
                    currentUserLogin: session?.email ?? '',
                });

                const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`];
                const hasFieldViolations = hasVisibleReportFieldViolations(report, policy, session?.accountID);

                let brickRoadStatus;
                let actionBadge;
                let actionTargetReportActionID;
                let needsParentChatErrorPropagation = false;
                const reasonAndReportAction = SidebarUtils.getReasonAndReportActionThatHasRedBrickRoad(
                    report,
                    chatReport,
                    reportActionsList,
                    hasAnyViolations || hasFieldViolations,
                    reportErrors,
                    transactions,
                    isOffline,
                    transactionViolations,
                    !!isReportArchived,
                    reports,
                );

                // When the report is ready to submit, always show the green Submit badge
                // regardless of violations — the user can submit without fix.
                const willShowGreenSubmit = requiresAttention && actionGreenBadge === CONST.REPORT.ACTION_BADGE.SUBMIT;

                // if report has errors or violations, show red dot
                // Also skip setting ERROR when we'll show the green Submit badge — let the user submit without fix.
                if (reasonAndReportAction && !willShowGreenSubmit) {
                    needsParentChatErrorPropagation = true;

                    // RBR/Fix mirrors GBR's access rule: only show on the child when the user can't already
                    // see it on the parent workspace chat. The parent still gets ERROR/FIX through the
                    // propagation loop below, so the actionable indicator surfaces on the workspace chat row
                    // (which is where C+ wants it). Skips when the chat parent isn't accessible to the user.
                    const chatPolicy = chatReport?.policyID ? policies?.[`${ONYXKEYS.COLLECTION.POLICY}${chatReport.policyID}`] : undefined;
                    const isChildOfAccessiblePolicyExpenseChat = !!chatReport && isPolicyExpenseChat(chatReport) && (!!chatReport.isOwnPolicyExpenseChat || isPolicyAdmin(chatPolicy));
                    if (!isChildOfAccessiblePolicyExpenseChat) {
                        brickRoadStatus = CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
                        actionBadge = CONST.REPORT.ACTION_BADGE.FIX;
                        actionTargetReportActionID = reasonAndReportAction.reportAction?.reportActionID;
                    }
                }
                // if report does not have error, check if it should show green dot
                if (brickRoadStatus !== CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR && requiresAttention) {
                    brickRoadStatus = CONST.BRICK_ROAD_INDICATOR_STATUS.INFO;
                    actionBadge = actionGreenBadge;
                    actionTargetReportActionID = actionGreenTargetReportActionID;
                }

                acc[report.reportID] = {
                    reportName: report
                        ? computeReportName({
                              report,
                              reports,
                              policies,
                              transactions,
                              allReportNameValuePairs: reportNameValuePairs,
                              personalDetailsList: personalDetails,
                              reportActions,
                              currentUserAccountID: session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
                              currentUserLogin: session?.email ?? '',
                              translate,
                              allPolicyTags: policyTags,
                              conciergeReportID: conciergeReportID ?? undefined,
                              reportAttributes: currentValue?.reports,
                              isTrackIntentUser: isTrackIntentUserSelector(introSelected),
                          })
                        : '',
                    isEmpty: generateIsEmptyReport(report, isReportArchived),
                    brickRoadStatus,
                    requiresAttention,
                    actionBadge,
                    actionTargetReportActionID,
                    reportErrors,
                    oneTransactionThreadReportID,
                    needsParentChatErrorPropagation,
                };

                return acc;
            },
            currentValue?.reports ? {...currentValue.reports} : {},
        );

        // Propagate errors from IOU reports to their parent chat reports.
        const currentUserAccountID = session?.accountID ?? CONST.DEFAULT_NUMBER_ID;
        const currentUserEmail = session?.email ?? '';
        const erroredChildReportIDsByChat = new Map<string, string[]>();
        const childReportIDsByChat = new Map<string, string[]>();
        for (const report of Object.values(reports)) {
            if (!report?.reportID || !report.chatReportID || report.reportID === report.chatReportID) {
                continue;
            }

            const childReportIDs = childReportIDsByChat.get(report.chatReportID) ?? [];
            childReportIDs.push(report.reportID);
            childReportIDsByChat.set(report.chatReportID, childReportIDs);

            // If this is an IOU report and its calculated attributes have an error,
            // then we need to mark its parent chat report.
            // We read `needsParentChatErrorPropagation` rather than `brickRoadStatus` because the per-report
            // pass suppresses the child's own brickRoadStatus when the parent workspace chat is accessible —
            // we still need to propagate the error up so the parent shows the indicator.
            const attributes = reportAttributes[report.reportID];
            if (attributes?.needsParentChatErrorPropagation || attributes?.brickRoadStatus === CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR) {
                const erroredChildReportIDs = erroredChildReportIDsByChat.get(report.chatReportID) ?? [];
                erroredChildReportIDs.push(report.reportID);
                erroredChildReportIDsByChat.set(report.chatReportID, erroredChildReportIDs);
            }
        }

        // Apply the error status to the parent chat reports.
        for (const [chatReportID, erroredChildReportIDs] of erroredChildReportIDsByChat) {
            if (!reportAttributes[chatReportID]) {
                continue;
            }

            const chatAttributes = reportAttributes[chatReportID];
            let actionTargetReportActionID = chatAttributes.actionTargetReportActionID;

            actionTargetReportActionID =
                getOldestPreviewActionID(chatReportID, erroredChildReportIDs, reports, isActionable) ??
                getOldestPreviewActionID(chatReportID, childReportIDsByChat.get(chatReportID), reports, (childReport) =>
                    needsViolationFix(childReport, policies, transactionViolations, currentUserAccountID, currentUserEmail),
                ) ??
                getOldestPreviewActionID(chatReportID, erroredChildReportIDs, reports) ??
                actionTargetReportActionID;

            // Clone the entry before mutating — it may be a reference carried over from
            // currentValue.reports that wasn't recomputed in this incremental run.
            reportAttributes[chatReportID] = {
                ...chatAttributes,
                brickRoadStatus: CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR,
                actionBadge: CONST.REPORT.ACTION_BADGE.FIX,
                actionTargetReportActionID,
            };
        }

        return {
            reports: reportAttributes,
            locale: preferredLocale ?? null,
        };
    },
});

export {hasPolicyRelevantFieldChanged};
