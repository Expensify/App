import {useCallback, useMemo} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import {useAllReportsTransactionsAndViolations} from '@components/OnyxListItemProvider';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import type {ReportTransactionsAndViolationsDerivedValue} from '@src/types/onyx/DerivedValues';
import type PolicyData from './types';

/**
 * Retrieves policy tags, categories, reports and their associated transactions and violations.
 * @param policyID The ID of the policy to retrieve data for.
 * @returns An object containing policy data
 */
function usePolicyData(policyID: string): PolicyData {
    const allReportsTransactionsAndViolations = useAllReportsTransactionsAndViolations();

    // Stable selector for useOnyx to avoid defining the selector inline
    const reportsSelectorCallback = useCallback(
        (allReports: OnyxCollection<Report>) => {
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
        },
        [policyID, allReportsTransactionsAndViolations],
    );

    const policy = usePolicy(policyID);
    const [tagLists] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, {canBeMissing: true}, [policyID]);
    const [categories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`, {canBeMissing: true}, [policyID]);
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: true, selector: reportsSelectorCallback}, [policyID, allReportsTransactionsAndViolations]);
    const transactionsAndViolations = useMemo(() => {
        if (!reports || !allReportsTransactionsAndViolations) {
            return {};
        }
        return Object.entries(reports).reduce<ReportTransactionsAndViolationsDerivedValue>((acc, [reportID]) => {
            if (Object.keys(allReportsTransactionsAndViolations[reportID].transactions).length > 0) {
                acc[reportID] = allReportsTransactionsAndViolations[reportID];
            }
            return acc;
        }, {});
    }, [reports, allReportsTransactionsAndViolations]);
    return {
        transactionsAndViolations,
        tagLists: tagLists ?? {},
        categories: categories ?? {},
        policyID,
        policy,
        reports: Object.values(reports ?? {}),
    };
}

export default usePolicyData;
