import {useAllReportsTransactionsAndViolations} from '@components/OnyxListItemProvider';

import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report} from '@src/types/onyx';
import type {ReportTransactionsAndViolationsDerivedValue} from '@src/types/onyx/DerivedValues';
import type {OnyxValueWithOfflineFeedback} from '@src/types/onyx/OnyxCommon';

import type {OnyxCollection} from 'react-native-onyx';

import type PolicyData from './types';

/**
 * Retrieves policy tags, categories, reports and their associated transactions and violations.
 * @param policyID The ID of the policy to retrieve data for.
 * @returns An object containing policy data
 */
function usePolicyData(policyID?: string): PolicyData {
    const policy = usePolicy(policyID);
    const allReportsTransactionsAndViolations = useAllReportsTransactionsAndViolations();

    // Stable selector for useOnyx to avoid defining the selector inline
    const reportsSelectorCallback = (allReports: OnyxCollection<Report>) => {
        if (!policyID || !allReports || !allReportsTransactionsAndViolations) {
            return {};
        }

        // Filter reports to only include those that belong to the specified policy and have associated transactions
        return Object.keys(allReportsTransactionsAndViolations).reduce<Record<string, Report>>((acc, reportID) => {
            const policyReport = allReports[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
            if (policyReport?.policyID === policyID) {
                acc[reportID] = policyReport;
            }
            return acc;
        }, {});
    };

    const [tags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);
    const [categories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const [vendors] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_VENDORS}${policyID}`);
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: reportsSelectorCallback});
    const transactionsAndViolations =
        !reports || !allReportsTransactionsAndViolations
            ? {}
            : Object.keys(reports).reduce<ReportTransactionsAndViolationsDerivedValue>((acc, reportID) => {
                  if (allReportsTransactionsAndViolations[reportID]) {
                      acc[reportID] = allReportsTransactionsAndViolations[reportID];
                  }
                  return acc;
              }, {});
    return {
        transactionsAndViolations,
        tags: tags ?? {},
        categories: categories ?? {},
        vendors: vendors ?? undefined,
        policy: policy as OnyxValueWithOfflineFeedback<Policy>,
        reports: Object.values(reports ?? {}) as Array<OnyxValueWithOfflineFeedback<Report>>,
    };
}

export default usePolicyData;
