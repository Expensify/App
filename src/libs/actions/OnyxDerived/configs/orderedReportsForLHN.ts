import type {OnyxCollection} from 'react-native-onyx';
import type {PartialPolicyForSidebar, ReportsToDisplayInLHN} from '@hooks/useSidebarOrderedReports';
import Log from '@libs/Log';
import SidebarUtils from '@libs/SidebarUtils';
import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';
import {hasKeyTriggeredCompute} from '@userActions/OnyxDerived/utils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

let isFullyComputed = false;

// Cache the collator to avoid creating a new one on every compute
let cachedCollator: Intl.Collator | null = null;
let cachedLocale: string | null = null;

/**
 * Helper to create locale comparison function from a locale string (because we can't call useLocalize in this file)
 */
function createLocaleCompare(locale: string | null | undefined): (a: string, b: string) => number {
    const effectiveLocale = locale ?? CONST.LOCALES.DEFAULT;

    // Reuse cached collator if locale hasn't changed
    if (cachedCollator && cachedLocale === effectiveLocale) {
        const collator = cachedCollator;
        return (a, b) => collator.compare(a, b);
    }

    // Create and cache new collator
    cachedCollator = new Intl.Collator(effectiveLocale, CONST.COLLATOR_OPTIONS);
    cachedLocale = effectiveLocale;

    const collator = cachedCollator;
    return (a, b) => collator.compare(a, b);
}

/**
 * This derived value computes the ordered reports for the LHN (Left Hand Navigation).
 * It handles incremental updates and returns both the filtered reports and their sorted IDs.
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.ORDERED_REPORTS_FOR_LHN,
    dependencies: [
        ONYXKEYS.COLLECTION.REPORT,
        ONYXKEYS.COLLECTION.POLICY,
        ONYXKEYS.COLLECTION.TRANSACTION,
        ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS,
        ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS,
        ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT,
        ONYXKEYS.BETAS,
        ONYXKEYS.DERIVED.REPORT_ATTRIBUTES,
        ONYXKEYS.NVP_PRIORITY_MODE,
        ONYXKEYS.NVP_PREFERRED_LOCALE,
    ],
    compute: (
        [reports, policies, transactions, transactionViolations, reportNameValuePairs, reportsDrafts, betas, reportAttributesData, priorityMode, preferredLocale],
        {currentValue, sourceValues, areAllConnectionsSet},
    ) => {
        if (!areAllConnectionsSet) {
            return {
                reportsToDisplay: {},
                orderedReportIDs: [],
                currentReportID: undefined,
                locale: null,
            };
        }

        const reportAttributes = reportAttributesData?.reports;

        // Check if we need to recompute everything due to locale or beta changes
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const prevLocale = currentValue?.locale;
        const localeChanged = hasKeyTriggeredCompute(ONYXKEYS.NVP_PREFERRED_LOCALE, sourceValues) && preferredLocale !== prevLocale;
        const betasChanged = hasKeyTriggeredCompute(ONYXKEYS.BETAS, sourceValues);
        const priorityModeChanged = hasKeyTriggeredCompute(ONYXKEYS.NVP_PRIORITY_MODE, sourceValues);

        if (localeChanged || betasChanged || priorityModeChanged) {
            isFullyComputed = false;
        }

        // If we already computed and there are no updates, return current value
        if ((isFullyComputed && !sourceValues) || !reports) {
            return (
                currentValue ?? {
                    reportsToDisplay: {},
                    orderedReportIDs: [],
                    currentReportID: undefined,
                    locale: preferredLocale ?? null,
                }
            );
        }

        const reportUpdates = sourceValues?.[ONYXKEYS.COLLECTION.REPORT] ?? {};
        const reportNameValuePairsUpdates = sourceValues?.[ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS] ?? {};
        const transactionsUpdates = sourceValues?.[ONYXKEYS.COLLECTION.TRANSACTION];
        const transactionViolationsUpdates = sourceValues?.[ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS];
        const reportsDraftsUpdates = sourceValues?.[ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT] ?? {};
        const policiesUpdates = sourceValues?.[ONYXKEYS.COLLECTION.POLICY] ?? {};

        // Determine which reports need to be updated
        const reportsToUpdate = new Set<string>();

        // If locale, betas, or priority mode changed, update all reports
        if (localeChanged || betasChanged || priorityModeChanged) {
            for (const key of Object.keys(reports ?? {})) {
                reportsToUpdate.add(key);
            }
        }

        // Add directly updated reports
        if (isFullyComputed && Object.keys(reportUpdates).length > 0) {
            for (const key of Object.keys(reportUpdates)) {
                reportsToUpdate.add(key);
            }
        }

        // Add reports affected by reportNameValuePairs updates
        if (isFullyComputed && Object.keys(reportNameValuePairsUpdates).length > 0) {
            for (const key of Object.keys(reportNameValuePairsUpdates).map((reportKey) => reportKey.replace(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, ONYXKEYS.COLLECTION.REPORT))) {
                reportsToUpdate.add(key);
            }
        }

        // Add reports affected by transactions updates
        if (isFullyComputed && transactionsUpdates) {
            for (const key of Object.values(transactionsUpdates).map((transaction) => (transaction?.reportID ? `${ONYXKEYS.COLLECTION.REPORT}${transaction.reportID}` : undefined))) {
                if (key && key !== `${ONYXKEYS.COLLECTION.REPORT}`) {
                    reportsToUpdate.add(key);
                }
            }
        }

        // Add reports affected by transaction violations updates
        if (isFullyComputed && transactionViolationsUpdates) {
            for (const key of Object.keys(transactionViolationsUpdates)
                .map((violationKey) => violationKey.replace(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, ONYXKEYS.COLLECTION.TRANSACTION))
                .map((transactionKey) => (transactions?.[transactionKey]?.reportID ? `${ONYXKEYS.COLLECTION.REPORT}${transactions[transactionKey].reportID}` : undefined))) {
                if (key && key !== `${ONYXKEYS.COLLECTION.REPORT}`) {
                    reportsToUpdate.add(key);
                }
            }
        }

        // Add reports affected by draft comments updates
        if (isFullyComputed && Object.keys(reportsDraftsUpdates).length > 0) {
            for (const key of Object.keys(reportsDraftsUpdates).map((draftKey) => draftKey.replace(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT, ONYXKEYS.COLLECTION.REPORT))) {
                reportsToUpdate.add(key);
            }
        }

        // Add reports affected by policy updates
        if (isFullyComputed && Object.keys(policiesUpdates).length > 0) {
            const updatedPolicies = new Set(Object.keys(policiesUpdates).map((policyKey) => policyKey.replace(ONYXKEYS.COLLECTION.POLICY, '')));
            for (const key of Object.entries(reports ?? {})
                .filter(([, value]) => {
                    if (!value?.policyID) {
                        return false;
                    }
                    return updatedPolicies.has(value.policyID);
                })
                .map(([reportKey]) => reportKey)) {
                reportsToUpdate.add(key);
            }
        }

        const shouldDoIncrementalUpdate = reportsToUpdate.size > 0 && isFullyComputed && !!currentValue;
        let reportsToDisplay: ReportsToDisplayInLHN = {};

        if (shouldDoIncrementalUpdate) {
            // Incremental update
            reportsToDisplay = SidebarUtils.updateReportsToDisplayInLHN({
                displayedReports: currentValue.reportsToDisplay,
                reports,
                updatedReportsKeys: Array.from(reportsToUpdate),
                currentReportId: undefined,
                isInFocusMode: priorityMode === CONST.PRIORITY_MODE.GSD,
                betas,
                transactionViolations,
                reportNameValuePairs,
                reportAttributes,
                draftComments: reportsDrafts,
            });
        } else {
            // Full computation
            Log.info('[orderedReportsForLHN] building reportsToDisplay from scratch');

            // Convert policies to the expected format for SidebarUtils
            const partialPolicies: OnyxCollection<PartialPolicyForSidebar> = {};
            if (policies) {
                for (const [key, policy] of Object.entries(policies)) {
                    if (policy) {
                        partialPolicies[key] = {
                            type: policy.type,
                            name: policy.name,
                            avatarURL: policy.avatarURL,
                            employeeList: policy.employeeList,
                        };
                    }
                }
            }

            reportsToDisplay = SidebarUtils.getReportsToDisplayInLHN(
                undefined,
                reports,
                betas,
                partialPolicies,
                priorityMode,
                reportsDrafts,
                transactionViolations,
                reportNameValuePairs,
                reportAttributes,
            );
        }

        // Create locale comparison function
        const localeCompare = createLocaleCompare(preferredLocale);

        // Sort the reports
        const orderedReportIDs = SidebarUtils.sortReportsToDisplayInLHN(reportsToDisplay, priorityMode, localeCompare, reportsDrafts, reportNameValuePairs);

        // Mark as fully computed after first full iteration
        if (!Object.keys(reportUpdates).length && Object.keys(reports ?? {}).length > 0 && !isFullyComputed) {
            isFullyComputed = true;
        }

        return {
            reportsToDisplay,
            orderedReportIDs,
            currentReportID: undefined,
            locale: preferredLocale ?? null,
        };
    },
});
