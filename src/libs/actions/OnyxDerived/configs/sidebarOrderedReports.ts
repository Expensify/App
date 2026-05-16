import {shallowEqual} from 'fast-equals';
import {getTransactionThreadReportID} from '@libs/MergeTransactionUtils';
import {getIsOffline} from '@libs/NetworkState';
import {isOneTransactionReport} from '@libs/ReportUtils';
import SidebarUtils from '@libs/SidebarUtils';
import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';
import type {SidebarOrderedReportsDerivedValue, SidebarReportForLHN} from '@src/types/onyx/DerivedValues';

const EMPTY_VALUE: SidebarOrderedReportsDerivedValue = {reportsToDisplay: {}, orderedReportIDs: []};

const COLLATOR_OPTIONS: Intl.CollatorOptions = {usage: 'sort', sensitivity: 'variant', numeric: true, caseFirst: 'upper'};

const COLLECTION_DEP_KEYS = [
    ONYXKEYS.COLLECTION.REPORT,
    ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS,
    ONYXKEYS.COLLECTION.TRANSACTION,
    ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS,
    ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT,
    ONYXKEYS.COLLECTION.POLICY,
] as const;

function buildHasDraftMap(reportsDrafts: Record<string, string | null | undefined> | null | undefined): Record<string, boolean> {
    const result: Record<string, boolean> = {};
    if (!reportsDrafts) {
        return result;
    }
    for (const [key, value] of Object.entries(reportsDrafts)) {
        if (value) {
            result[key.replace(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT, '')] = true;
        }
    }
    return result;
}

export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.SIDEBAR_ORDERED_REPORTS,
    dependencies: [
        ONYXKEYS.COLLECTION.REPORT,
        ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS,
        ONYXKEYS.COLLECTION.TRANSACTION,
        ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS,
        ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT,
        ONYXKEYS.COLLECTION.POLICY,
        ONYXKEYS.NVP_PRIORITY_MODE,
        ONYXKEYS.BETAS,
        ONYXKEYS.NETWORK,
        ONYXKEYS.NVP_PREFERRED_LOCALE,
        ONYXKEYS.DERIVED.REPORT_ATTRIBUTES,
        ONYXKEYS.SESSION,
    ],
    compute: (
        [reports, reportNameValuePairs, transactions, transactionViolations, reportsDrafts, , priorityMode, betas, , locale, reportAttributesDerived, session],
        {currentValue, sourceValues},
    ): SidebarOrderedReportsDerivedValue => {
        if (!reports || Object.keys(reports).length === 0) {
            return EMPTY_VALUE;
        }

        const effectivePriorityMode = priorityMode ?? CONST.PRIORITY_MODE.DEFAULT;
        const isInFocusMode = effectivePriorityMode === CONST.PRIORITY_MODE.GSD;
        const isOffline = getIsOffline();
        const reportAttributes = reportAttributesDerived?.reports;
        const currentUserAccountID = session?.accountID ?? CONST.DEFAULT_NUMBER_ID;
        const currentUserLogin = session?.email ?? '';

        // Compute incremental updates only when a collection dep changed AND we have a cached value.
        // Scalar/non-collection changes (BETAS, NVP_PRIORITY_MODE, NETWORK, NVP_PREFERRED_LOCALE,
        // DERIVED.REPORT_ATTRIBUTES) force a full recompute.
        const collectionUpdates = sourceValues
            ? COLLECTION_DEP_KEYS.reduce<Record<string, Record<string, unknown> | undefined>>((acc, collectionKey) => {
                  const update = sourceValues[collectionKey];
                  if (update) {
                      acc[collectionKey] = update;
                  }
                  return acc;
              }, {})
            : {};
        const hasCollectionUpdate = Object.keys(collectionUpdates).length > 0;
        const canIncremental = !!currentValue && hasCollectionUpdate && Object.keys(currentValue.reportsToDisplay).length > 0;

        let reportsToDisplay: Record<string, SidebarReportForLHN>;
        if (canIncremental && currentValue) {
            const updatedReportsKeys = new Set<string>();

            const reportUpdates = collectionUpdates[ONYXKEYS.COLLECTION.REPORT];
            if (reportUpdates) {
                for (const key of Object.keys(reportUpdates)) {
                    updatedReportsKeys.add(key);
                }
            }

            const rnvpUpdates = collectionUpdates[ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS];
            if (rnvpUpdates) {
                for (const key of Object.keys(rnvpUpdates)) {
                    updatedReportsKeys.add(key.replace(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, ONYXKEYS.COLLECTION.REPORT));
                }
            }

            const transactionUpdates = collectionUpdates[ONYXKEYS.COLLECTION.TRANSACTION];
            if (transactionUpdates) {
                for (const transaction of Object.values(transactionUpdates)) {
                    const txn = transaction as Transaction | null | undefined;
                    if (!txn?.reportID) {
                        continue;
                    }
                    const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${txn.reportID}`;
                    const reportForTxn = reports[reportKey];
                    if (isOneTransactionReport(reportForTxn)) {
                        updatedReportsKeys.add(reportKey);
                    } else {
                        const threadID = getTransactionThreadReportID(txn);
                        updatedReportsKeys.add(`${ONYXKEYS.COLLECTION.REPORT}${threadID}`);
                    }
                }
            }

            const violationUpdates = collectionUpdates[ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS];
            if (violationUpdates) {
                for (const violationKey of Object.keys(violationUpdates)) {
                    const transactionKey = violationKey.replace(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, ONYXKEYS.COLLECTION.TRANSACTION);
                    const linkedReportID = transactions?.[transactionKey]?.reportID;
                    if (linkedReportID) {
                        updatedReportsKeys.add(`${ONYXKEYS.COLLECTION.REPORT}${linkedReportID}`);
                    }
                }
            }

            const draftUpdates = collectionUpdates[ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT];
            if (draftUpdates) {
                for (const draftKey of Object.keys(draftUpdates)) {
                    updatedReportsKeys.add(draftKey.replace(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT, ONYXKEYS.COLLECTION.REPORT));
                }
            }

            const policyUpdates = collectionUpdates[ONYXKEYS.COLLECTION.POLICY];
            if (policyUpdates) {
                const updatedPolicyIDs = new Set(Object.keys(policyUpdates).map((policyKey) => policyKey.replace(ONYXKEYS.COLLECTION.POLICY, '')));
                for (const [reportKey, report] of Object.entries(reports)) {
                    if (report?.policyID && updatedPolicyIDs.has(report.policyID)) {
                        updatedReportsKeys.add(reportKey);
                    }
                }
            }

            reportsToDisplay = SidebarUtils.updateReportsToDisplayInLHN({
                displayedReports: currentValue.reportsToDisplay,
                reports,
                updatedReportsKeys: Array.from(updatedReportsKeys),
                currentReportId: undefined,
                isInFocusMode,
                betas,
                transactionViolations,
                reportNameValuePairs,
                reportAttributes,
                draftComments: reportsDrafts,
                transactions,
                isOffline,
                currentUserLogin,
                currentUserAccountID,
            });
        } else {
            reportsToDisplay = SidebarUtils.getReportsToDisplayInLHN({
                currentReportId: undefined,
                reports,
                betas,
                priorityMode: effectivePriorityMode,
                draftComments: reportsDrafts,
                transactionViolations,
                transactions,
                isOffline,
                currentUserLogin,
                currentUserAccountID,
                reportNameValuePairs,
                reportAttributes,
            });
        }

        const collator = new Intl.Collator(locale ?? IntlStore.getCurrentLocale() ?? undefined, COLLATOR_OPTIONS);
        const localeCompare = (a: string, b: string) => collator.compare(a, b);
        const hasDraftByReportID = buildHasDraftMap(reportsDrafts);

        const nextOrderedReportIDs = SidebarUtils.sortReportsToDisplayInLHN(
            reportsToDisplay,
            effectivePriorityMode,
            localeCompare,
            hasDraftByReportID,
            reportNameValuePairs,
            reportAttributes,
        );

        // Preserve referential stability when nothing meaningful changed downstream.
        const stableReportsToDisplay = currentValue && reportsToDisplay === currentValue.reportsToDisplay ? currentValue.reportsToDisplay : reportsToDisplay;
        const stableOrderedReportIDs = currentValue && shallowEqual(nextOrderedReportIDs, currentValue.orderedReportIDs) ? currentValue.orderedReportIDs : nextOrderedReportIDs;

        if (stableReportsToDisplay === currentValue?.reportsToDisplay && stableOrderedReportIDs === currentValue?.orderedReportIDs) {
            return currentValue;
        }

        return {
            reportsToDisplay: stableReportsToDisplay,
            orderedReportIDs: stableOrderedReportIDs,
        };
    },
});
