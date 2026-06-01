import {shallowEqual} from 'fast-equals';
import {getIsOffline} from '@libs/NetworkState';
import SidebarUtils from '@libs/SidebarUtils';
import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAttributesDerivedValue, Transaction} from '@src/types/onyx';
import type {SidebarOrderedReportsDerivedValue, SidebarReportForLHN} from '@src/types/onyx/DerivedValues';

const EMPTY_VALUE: SidebarOrderedReportsDerivedValue = {reportsToDisplay: {}, orderedReportIDs: []};

// Cache the collator across computes so we only rebuild it when the locale actually changes.
let cachedCollator: Intl.Collator | undefined;
let cachedCollatorLocale: string | undefined;

// Snapshot of the report attributes from the previous compute, used to diff which reports changed when an
// attributes-only update triggers a recompute. The attributes derived value preserves object references for
// unchanged reports, so a reference comparison cheaply identifies exactly the reports that changed.
let previousReportAttributes: ReportAttributesDerivedValue['reports'] | undefined;

// Returns the full report keys whose attributes entry changed between two attributes snapshots (added, removed, or
// a different object reference). Attributes are keyed by bare reportID, so the keys are mapped to full report keys.
function getChangedReportAttributeKeys(prev: ReportAttributesDerivedValue['reports'] | undefined, next: ReportAttributesDerivedValue['reports'] | undefined): string[] {
    if (prev === next) {
        return [];
    }
    const prevReports = prev ?? {};
    const nextReports = next ?? {};
    const changedKeys: string[] = [];
    for (const [reportID, attributes] of Object.entries(nextReports)) {
        if (prevReports[reportID] !== attributes) {
            changedKeys.push(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
        }
    }
    for (const reportID of Object.keys(prevReports)) {
        if (!(reportID in nextReports)) {
            changedKeys.push(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
        }
    }
    return changedKeys;
}

function getLocaleCompare(locale: string): (a: string, b: string) => number {
    if (!cachedCollator || cachedCollatorLocale !== locale) {
        cachedCollator = new Intl.Collator(locale, CONST.COLLATOR_OPTIONS);
        cachedCollatorLocale = locale;
    }
    const collator = cachedCollator;
    return (a, b) => collator.compare(a, b);
}

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
    key: ONYXKEYS.DERIVED.RAM_ONLY_SIDEBAR_ORDERED_REPORTS,
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
            previousReportAttributes = undefined;
            return EMPTY_VALUE;
        }

        const effectivePriorityMode = priorityMode ?? CONST.PRIORITY_MODE.DEFAULT;
        const isInFocusMode = effectivePriorityMode === CONST.PRIORITY_MODE.GSD;
        const isOffline = getIsOffline();
        const reportAttributes = reportAttributesDerived?.reports;
        const currentUserAccountID = session?.accountID ?? CONST.DEFAULT_NUMBER_ID;
        const currentUserLogin = session?.email ?? '';

        // Compute incremental updates when a collection dep changed, or when DERIVED.REPORT_ATTRIBUTES changed and we
        // can diff it against the previous snapshot. Other scalar changes (BETAS, NVP_PRIORITY_MODE, NETWORK,
        // NVP_PREFERRED_LOCALE) broadly affect which reports qualify, so they force a full recompute.
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

        // An attributes-only trigger re-evaluates exactly the reports whose attributes changed. Diff against the
        // previous snapshot before overwriting it; the first trigger (no snapshot) falls back to a full recompute.
        const attributesTriggered = !!sourceValues?.[ONYXKEYS.DERIVED.REPORT_ATTRIBUTES];
        const canDiffAttributes = attributesTriggered && previousReportAttributes !== undefined;
        const attributeReportKeys = canDiffAttributes ? getChangedReportAttributeKeys(previousReportAttributes, reportAttributes) : [];
        previousReportAttributes = reportAttributes;

        const canIncremental = !!currentValue && (hasCollectionUpdate || canDiffAttributes) && Object.keys(currentValue.reportsToDisplay).length > 0;

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
                    updatedReportsKeys.add(`${ONYXKEYS.COLLECTION.REPORT}${txn.reportID}`);
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

            if (canDiffAttributes) {
                for (const key of attributeReportKeys) {
                    updatedReportsKeys.add(key);
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

        const localeCompare = getLocaleCompare(locale ?? IntlStore.getCurrentLocale() ?? CONST.LOCALES.DEFAULT);
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
