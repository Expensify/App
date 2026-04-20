import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {computeReportName} from '@libs/ReportNameUtils';
import {generateIsEmptyReport, generateReportAttributes, hasVisibleReportFieldViolations, isArchivedReport, isValidReport} from '@libs/ReportUtils';
import SidebarUtils from '@libs/SidebarUtils';
import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';
import {hasKeyTriggeredCompute} from '@userActions/OnyxDerived/utils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Policy, ReportAttributesDerivedValue} from '@src/types/onyx';

let previousDisplayNames: Record<string, string | undefined> = {};
let previousPersonalDetails: OnyxEntry<PersonalDetailsList> | undefined;
let previousPolicies: OnyxCollection<Policy>;

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

const checkDisplayNamesChanged = (personalDetails: OnyxEntry<PersonalDetailsList>) => {
    if (!personalDetails) {
        return false;
    }

    // Fast path: if reference hasn't changed, display names are definitely the same
    if (previousPersonalDetails === personalDetails) {
        return false;
    }

    const currentDisplayNames = Object.fromEntries(Object.entries(personalDetails).map(([key, value]) => [key, value?.displayName]));

    if (Object.keys(previousDisplayNames).length === 0) {
        previousDisplayNames = currentDisplayNames;
        previousPersonalDetails = personalDetails;
        return Object.keys(currentDisplayNames).length > 0;
    }

    const currentKeys = Object.keys(currentDisplayNames);
    const previousKeys = Object.keys(previousDisplayNames);

    const displayNamesChanged = currentKeys.length !== previousKeys.length || currentKeys.some((key) => currentDisplayNames[key] !== previousDisplayNames[key]);

    previousDisplayNames = currentDisplayNames;
    previousPersonalDetails = personalDetails;

    return displayNamesChanged;
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
        ONYXKEYS.COLLECTION.REPORT_METADATA,
        ONYXKEYS.CONCIERGE_REPORT_ID,
    ],
    compute: (
        [reports, preferredLocale, transactionViolations, reportActions, reportNameValuePairs, transactions, personalDetails, session, policies, policyTags],
        {currentValue, sourceValues},
    ) => {
        // Check if display names changed when personal details are updated
        let displayNamesChanged = false;
        if (hasKeyTriggeredCompute(ONYXKEYS.PERSONAL_DETAILS_LIST, sourceValues)) {
            displayNamesChanged = checkDisplayNamesChanged(personalDetails);

            if (!displayNamesChanged) {
                return currentValue ?? {reports: {}, locale: null};
            }
        } else if (!sourceValues) {
            previousDisplayNames = {};
            previousPersonalDetails = undefined;
        }

        // A full recompute is needed when locale changes (report names are locale-dependent) or display names change.
        // We compare preferredLocale against currentValue?.locale so that the first locale load on startup
        // (where both equal the same persisted value) does not trigger an unnecessary full recompute.
        let needsFullRecompute =
            (hasKeyTriggeredCompute(ONYXKEYS.NVP_PREFERRED_LOCALE, sourceValues) && preferredLocale !== currentValue?.locale) ||
            displayNamesChanged ||
            hasKeyTriggeredCompute(ONYXKEYS.CONCIERGE_REPORT_ID, sourceValues);

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

        const updates = [
            ...Object.keys(reportUpdates),
            ...Object.keys(reportMetadataUpdates),
            ...Object.keys(reportActionsUpdates),
            ...Object.keys(reportNameValuePairsUpdates),
            ...Array.from(reportUpdatesRelatedToReportActions),
            ...policyChangedReportKeys,
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
                    dataToIterate.push(...prepareReportKeys(transactionReportIDs));
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
                });

                const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`];
                const hasFieldViolations = hasVisibleReportFieldViolations(report, policy, session?.accountID);

                let brickRoadStatus;
                let actionBadge;
                let actionTargetReportActionID;
                const reasonAndReportAction = SidebarUtils.getReasonAndReportActionThatHasRedBrickRoad(
                    report,
                    chatReport,
                    reportActionsList,
                    hasAnyViolations || hasFieldViolations,
                    reportErrors,
                    transactions,
                    transactionViolations,
                    !!isReportArchived,
                    reports,
                );
                // if report has errors or violations, show red dot
                if (reasonAndReportAction) {
                    brickRoadStatus = CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
                    actionBadge = CONST.REPORT.ACTION_BADGE.FIX;
                    actionTargetReportActionID = reasonAndReportAction.reportAction?.reportActionID;
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
                              allPolicyTags: policyTags,
                          })
                        : '',
                    isEmpty: generateIsEmptyReport(report, isReportArchived),
                    brickRoadStatus,
                    requiresAttention,
                    actionBadge,
                    actionTargetReportActionID,
                    reportErrors,
                    oneTransactionThreadReportID,
                };

                return acc;
            },
            currentValue?.reports ? {...currentValue.reports} : {},
        );

        // Propagate errors from IOU reports to their parent chat reports.
        const chatReportIDsWithErrors = new Set<string>();
        for (const report of Object.values(reports)) {
            if (!report?.reportID) {
                continue;
            }

            // If this is an IOU report and its calculated attributes have an error,
            // then we need to mark its parent chat report.
            const attributes = reportAttributes[report.reportID];
            if (report.chatReportID && report.reportID !== report.chatReportID && attributes?.brickRoadStatus === CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR) {
                chatReportIDsWithErrors.add(report.chatReportID);
            }
        }

        // Apply the error status to the parent chat reports.
        for (const chatReportID of chatReportIDsWithErrors) {
            if (!reportAttributes[chatReportID]) {
                continue;
            }

            // Clone the entry before mutating — it may be a reference carried over from
            // currentValue.reports that wasn't recomputed in this incremental run.
            reportAttributes[chatReportID] = {
                ...reportAttributes[chatReportID],
                brickRoadStatus: CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR,
                actionBadge: CONST.REPORT.ACTION_BADGE.FIX,
            };
        }

        return {
            reports: reportAttributes,
            locale: preferredLocale ?? null,
        };
    },
});

export {hasPolicyRelevantFieldChanged};
