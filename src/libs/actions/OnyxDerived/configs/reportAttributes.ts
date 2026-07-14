import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import {getReportPreviewAction} from '@libs/actions/IOU/MoneyRequestBuilder';
import hashCode from '@libs/hashCode';
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

// The name-related fields we saw for each account last time, so we can spot which accounts changed.
let previousDisplayNames: Record<string, string> = {};
let previousPersonalDetails: OnyxEntry<PersonalDetailsList> | undefined;

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

// Onyx write-bookkeeping keys. They flip during optimistic writes without affecting the computed
// attributes, so they are excluded from policy signatures to avoid recompute churn.
const POLICY_SIGNATURE_EXCLUDED_KEYS = new Set(['pendingAction', 'pendingFields', 'errors', 'errorFields']);

// Deterministic stringify: object keys are sorted at every level so the same policy content always
// produces the same string regardless of key insertion order after Onyx merges.
const stableStringify = (value: unknown): string => {
    if (value === null || typeof value !== 'object') {
        return JSON.stringify(value) ?? 'undefined';
    }
    if (Array.isArray(value)) {
        return `[${value.map(stableStringify).join(',')}]`;
    }
    const entries = Object.entries(value)
        .filter(([key]) => !POLICY_SIGNATURE_EXCLUDED_KEYS.has(key))
        .sort(([a], [b]) => (a < b ? -1 : 1));
    return `{${entries.map(([key, entryValue]) => `${JSON.stringify(key)}:${stableStringify(entryValue)}`).join(',')}}`;
};

// A signature of the whole policy content (minus write-bookkeeping keys), stored in the derived value
// (like `locale`) so the change-detection baseline survives app restarts. Hashing the full content
// instead of an enumerated field list means a policy field the compute reads can never silently fall
// outside change detection; over-triggering is safe because the recompute is scoped to that policy's
// reports. The serialized length rides along as a second dimension so a 32-bit hash collision alone
// cannot mask a change; a full collision would only skip one scoped recompute for one policy change.
const policyRelevantSignature = (policy: Policy | null | undefined): string | null => {
    if (!policy) {
        return null;
    }
    const serialized = stableStringify(policy);
    return `${hashCode(serialized)}.${serialized.length}`;
};

// A short string built from the fields a report name can come from: displayName and firstName.
const displayNameSignature = (details: PersonalDetails | null): string => JSON.stringify([details?.displayName ?? '', details?.firstName ?? '']);

const snapshotDisplayNames = (personalDetails: PersonalDetailsList): Record<string, string> => {
    const snapshot: Record<string, string> = {};
    for (const [key, value] of Object.entries(personalDetails)) {
        snapshot[key] = displayNameSignature(value);
    }
    return snapshot;
};

// Remembers the personal details we just used, so the next change can be compared against them.
// Updating both variables together here keeps them from getting out of sync.
const commitDisplayNamesBaseline = (personalDetails: OnyxEntry<PersonalDetailsList>, snapshot: Record<string, string>) => {
    previousDisplayNames = snapshot;
    previousPersonalDetails = personalDetails;
};

// Records the current names the first time we have them on a pass that wasn't itself a personal-details
// change. The report names already match these names, so there's nothing to recompute — we just save them
// so the next personal-details change can be compared and narrowed to the reports it actually affects.
const seedDisplayNamesBaseline = (personalDetails: OnyxEntry<PersonalDetailsList>) => {
    if (!personalDetails || previousPersonalDetails === personalDetails || Object.keys(previousDisplayNames).length > 0) {
        return;
    }
    commitDisplayNamesBaseline(personalDetails, snapshotDisplayNames(personalDetails));
};

// Works out which accounts had a name change since last time. Returns the set of those accountIDs, or null
// when nothing changed, or 'all' when there's no previous data to compare against yet and every report needs
// refreshing.
const getDisplayNameChanges = (personalDetails: OnyxEntry<PersonalDetailsList>): Set<number> | typeof RECOMPUTE_ALL | null => {
    if (!personalDetails) {
        return null;
    }

    if (previousPersonalDetails === personalDetails) {
        return null;
    }

    const hadBaseline = Object.keys(previousDisplayNames).length > 0;
    const nextSnapshot: Record<string, string> = {};
    const changedAccountIDs = new Set<number>();

    // Build the new snapshot and compare it against the old one in the same loop.
    for (const [key, value] of Object.entries(personalDetails)) {
        const signature = displayNameSignature(value);
        nextSnapshot[key] = signature;
        if (hadBaseline && signature !== previousDisplayNames[key]) {
            changedAccountIDs.add(Number(key));
        }
    }
    // An account that existed before but is gone now also affects any report name that used it.
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

// True when the report's name could depend on one of these accounts. We look at the accounts stored on the report itself.
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
            // Save the current names now, so the first real name change can be narrowed to the reports it affects.
            seedDisplayNamesBaseline(personalDetails);
        }

        const nextIsTrackIntentUser = isTrackIntentUserSelector(introSelected);
        // conciergeReportID and introSelected are re-delivered on every OpenApp/reconnect merge, so a full
        // recompute happens only when the value differs from the one the attributes were computed with.
        // A missing stored value (attributes written by an older app version) seeds the baseline instead.
        const storedConciergeReportID = currentValue && 'conciergeReportID' in currentValue ? (currentValue.conciergeReportID ?? null) : undefined;
        const storedIsTrackIntentUser = currentValue && 'isTrackIntentUser' in currentValue ? currentValue.isTrackIntentUser : undefined;
        const hasConciergeReportIDChanged =
            hasKeyTriggeredCompute(ONYXKEYS.CONCIERGE_REPORT_ID, sourceValues) && storedConciergeReportID !== undefined && storedConciergeReportID !== (conciergeReportID ?? null);
        const hasIsTrackIntentUserChanged =
            hasKeyTriggeredCompute(ONYXKEYS.NVP_INTRO_SELECTED, sourceValues) && storedIsTrackIntentUser !== undefined && storedIsTrackIntentUser !== nextIsTrackIntentUser;

        // A full recompute is needed when locale changes (report names are locale-dependent) or display names change.
        // We compare preferredLocale against currentValue?.locale so that the first locale load on startup
        // (where both equal the same persisted value) does not trigger an unnecessary full recompute.
        const needsFullRecompute =
            (hasKeyTriggeredCompute(ONYXKEYS.NVP_PREFERRED_LOCALE, sourceValues) && preferredLocale !== currentValue?.locale) ||
            displayNameChanges === RECOMPUTE_ALL ||
            hasConciergeReportIDChanged ||
            hasIsTrackIntentUserChanged;

        // Policy change detection compares signatures stored in the derived value, so the baseline survives
        // app restarts. Signatures advance only when the recompute they imply actually runs (or vacuously
        // has no reports to touch); otherwise the next delivery re-diffs against the old baseline.
        const storedPolicySignatures = currentValue?.policySignatures;
        const hasComputedReports = !!currentValue?.reports && Object.keys(currentValue.reports).length > 0;
        let nextPolicySignatures = storedPolicySignatures;
        // True when the signatures may persist through an early return: a pure baseline seed, or a diff
        // whose changed policies have no reports referencing them (nothing to recompute).
        let canPersistSignaturesWithoutRecompute = false;
        const policyChangedReportKeys: string[] = [];

        const buildAllPolicySignatures = () => {
            const signatures: Record<string, string> = {};
            for (const [key, policy] of Object.entries(policies ?? {})) {
                const signature = policyRelevantSignature(policy);
                if (signature !== null) {
                    signatures[key] = signature;
                }
            }
            return signatures;
        };
        const collectReportKeysForPolicies = (changedPolicyIDs: Set<string>) => {
            for (const [reportKey, report] of Object.entries(reports ?? {})) {
                if (!report) {
                    continue;
                }
                // The report's own policy — the sender workspace for an invoice.
                if (report.policyID && changedPolicyIDs.has(report.policyID)) {
                    policyChangedReportKeys.push(reportKey);
                    continue;
                }
                // An invoice follows its receiver workspace. The invoice room carries the receiver
                // on itself; a child invoice report doesn't, so we read it from its parent room
                // (chatReportID) — the same place computeReportName looks for the invoice name.
                const ownReceiverPolicyID = report.invoiceReceiver && 'policyID' in report.invoiceReceiver ? report.invoiceReceiver.policyID : undefined;
                const room = report.chatReportID ? reports?.[`${ONYXKEYS.COLLECTION.REPORT}${report.chatReportID}`] : undefined;
                const roomReceiverPolicyID = room?.invoiceReceiver && 'policyID' in room.invoiceReceiver ? room.invoiceReceiver.policyID : undefined;
                if ((ownReceiverPolicyID && changedPolicyIDs.has(ownReceiverPolicyID)) || (roomReceiverPolicyID && changedPolicyIDs.has(roomReceiverPolicyID))) {
                    policyChangedReportKeys.push(reportKey);
                }
            }
        };

        if (hasKeyTriggeredCompute(ONYXKEYS.COLLECTION.POLICY, sourceValues)) {
            if (needsFullRecompute) {
                // Every report recomputes with the current policies anyway — snapshot the full baseline.
                nextPolicySignatures = buildAllPolicySignatures();
            } else if (storedPolicySignatures) {
                const changedPolicyIDs = new Set<string>();
                const updatedSignatures = {...storedPolicySignatures};
                for (const key of Object.keys(sourceValues?.[ONYXKEYS.COLLECTION.POLICY] ?? {})) {
                    const signature = policyRelevantSignature(policies?.[key]);
                    if ((storedPolicySignatures[key] ?? null) === signature) {
                        continue;
                    }
                    changedPolicyIDs.add(key.replace(ONYXKEYS.COLLECTION.POLICY, ''));
                    if (signature === null) {
                        delete updatedSignatures[key];
                    } else {
                        updatedSignatures[key] = signature;
                    }
                }
                if (changedPolicyIDs.size > 0) {
                    nextPolicySignatures = updatedSignatures;
                    collectReportKeysForPolicies(changedPolicyIDs);
                    // Vacuously satisfied only when the reports collection is actually available —
                    // with it missing, the recompute is skipped rather than unnecessary.
                    canPersistSignaturesWithoutRecompute = !!reports && policyChangedReportKeys.length === 0;
                }
            } else if (hasComputedReports) {
                // No stored baseline but attributes exist (value written by an older app version, or computed
                // in-session before policies loaded) — we cannot tell whether these policies match the ones the
                // attributes were computed with, so recompute the delivered policies' reports like the
                // pre-signature code did, then snapshot the full baseline.
                const deliveredPolicyIDs = new Set(Object.keys(sourceValues?.[ONYXKEYS.COLLECTION.POLICY] ?? {}).map((key) => key.replace(ONYXKEYS.COLLECTION.POLICY, '')));
                collectReportKeysForPolicies(deliveredPolicyIDs);
                canPersistSignaturesWithoutRecompute = !!reports && policyChangedReportKeys.length === 0;
                if (reports) {
                    nextPolicySignatures = buildAllPolicySignatures();
                }
            } else {
                // No attributes computed yet — the pass below runs a full scan, so seeding is safe.
                nextPolicySignatures = buildAllPolicySignatures();
            }
        } else if (!storedPolicySignatures && policies && hasComputedReports) {
            // Baseline seeding on a pass that did not deliver policies: both the attributes and the policies
            // come from the same disk-hydrated state (an in-session value computed without policies is
            // impossible here — policies would have arrived as a policy trigger), so they are consistent.
            nextPolicySignatures = buildAllPolicySignatures();
            canPersistSignaturesWithoutRecompute = true;
        }

        // Baseline writes that may ride an early return: only signature snapshots that require no recompute.
        // conciergeReportID/isTrackIntentUser baselines advance exclusively in the final return, and only on
        // passes that recomputed everything with the current values — advancing them on other passes would
        // silently absorb a change and suppress the full recompute its next delivery should cause.
        const metaPatch: Partial<ReportAttributesDerivedValue> = {};
        if (canPersistSignaturesWithoutRecompute && nextPolicySignatures !== storedPolicySignatures) {
            metaPatch.policySignatures = nextPolicySignatures;
        }
        const withMetaPatch = (value: ReportAttributesDerivedValue): ReportAttributesDerivedValue => (Object.keys(metaPatch).length > 0 ? {...value, ...metaPatch} : value);

        // Use incremental updates when currentValue is already populated and no full recompute is required.
        // If currentValue has no reports (fresh install or cleared storage), fall back to a full scan.
        const useIncrementalUpdates = !!currentValue?.reports && Object.keys(currentValue.reports).length > 0 && !needsFullRecompute;

        // if we already computed the report attributes and there is no new reports data, return the current value
        if ((useIncrementalUpdates && !sourceValues) || !reports) {
            return withMetaPatch(currentValue ?? {reports: {}, locale: null});
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

        // When only some accounts changed their name, refresh just the reports that use those accounts
        // Skipped when we're already refreshing everything (first load or a
        // locale change); in that case useIncrementalUpdates is false and the full scan below handles it.
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
                return withMetaPatch(currentValue ?? {reports: {}, locale: null});
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
                              isTrackIntentUser: nextIsTrackIntentUser,
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

        // A full scan just recomputed every report with the current policies, so the baseline can be
        // snapshotted even when no policy trigger fired this pass (e.g. policies merged while computes
        // were deferred during startup, or a locale-driven full recompute).
        if (!useIncrementalUpdates && policies) {
            nextPolicySignatures = buildAllPolicySignatures();
        }

        // The stored conciergeReportID/isTrackIntentUser must always equal the values the full attribute
        // set was computed with, so they advance only when everything recomputed with the current values
        // (or on the very first write). Incremental passes keep the stored baseline — if the current value
        // drifted (e.g. a change landed while computes were deferred), the next delivery of that key still
        // compares unequal and triggers the healing full recompute.
        return {
            reports: reportAttributes,
            locale: preferredLocale ?? null,
            policySignatures: nextPolicySignatures,
            conciergeReportID: storedConciergeReportID === undefined || needsFullRecompute ? (conciergeReportID ?? null) : storedConciergeReportID,
            isTrackIntentUser: storedIsTrackIntentUser === undefined || needsFullRecompute ? nextIsTrackIntentUser : storedIsTrackIntentUser,
        };
    },
});

export {policyRelevantSignature};
