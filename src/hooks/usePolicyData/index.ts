import {useMemo} from 'react';
import {useAllReportsTransactionsAndViolations} from '@components/OnyxListItemProvider';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyCategories, PolicyTagLists, Report} from '@src/types/onyx';
import type {ReportTransactionsAndViolationsDerivedValue} from '@src/types/onyx/DerivedValues';
import type {OnyxValueWithOfflineFeedback} from '@src/types/onyx/OnyxCommon';
import useOnyx from '../useOnyx';
import usePolicy from '../usePolicy';
import {PolicyData} from './types';

/**
 * Retrieves policy-related data such as tags, categories, reports, and transactions/violations.
 * @param policyID The ID of the policy to retrieve data for.
 * @returns An object containing policy data
 */

function usePolicyData(policyID?: string): PolicyData {
    const policy = usePolicy(policyID);
    const allReportsTransactionsAndViolations = useAllReportsTransactionsAndViolations();

    const [tagsLists] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, {canBeMissing: true});
    const [categories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`, {canBeMissing: true});

    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        canBeMissing: true,
        selector: (allReports) => {
            if (!allReports) {
                return [];
            }
            // Filter reports to only include those that belong to the specified policy and have associated transactions
            const reportIDsWithTransactionsAndViolations = Object.keys(allReportsTransactionsAndViolations ?? {});
            return Object.values(allReports).filter((report) => !!report && report?.policyID === policyID && reportIDsWithTransactionsAndViolations.includes(report.reportID));
        },
    });

    const transactionsAndViolations = useMemo(
        () =>
            (reports ?? []).reduce<ReportTransactionsAndViolationsDerivedValue>((acc, report) => {
                if (report?.reportID && allReportsTransactionsAndViolations?.[report.reportID]) {
                    acc[report.reportID] = allReportsTransactionsAndViolations[report.reportID];
                }
                return acc;
            }, {}),
        [reports, allReportsTransactionsAndViolations],
    );

    return {
        reports: reports as Array<OnyxValueWithOfflineFeedback<Report>>,
        policy: policy as OnyxValueWithOfflineFeedback<Policy>,
        categories: categories ?? {},
        tags: tagsLists ?? {},
        transactionsAndViolations,
    };
}

export default usePolicyData;
