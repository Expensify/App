import {useMemo} from 'react';
import {useAllReportsTransactionsAndViolations} from '@components/OnyxListItemProvider';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyCategories, PolicyTagLists, Report} from '@src/types/onyx';
import type {ReportTransactionsAndViolationsDerivedValue} from '@src/types/onyx/DerivedValues';
import type {OnyxValueWithOfflineFeedback} from '@src/types/onyx/OnyxCommon';
import useOnyx from './useOnyx';
import usePolicy from './usePolicy';

type PolicyData = {
    policy: OnyxValueWithOfflineFeedback<Policy>;
    tags: PolicyTagLists;
    categories: PolicyCategories;
    reports: Array<OnyxValueWithOfflineFeedback<Report>>;
    transactionsAndViolations: ReportTransactionsAndViolationsDerivedValue;
};

/**
 * Custom hook to retrieve policy-related data.
 * @param policyID The ID of the policy to retrieve data for.
 * @returns An object containing policy data, including tags, categories, reports, and transactions/violations.
 */

function usePolicyData(policyID?: string): PolicyData {
    const policy = usePolicy(policyID) as OnyxValueWithOfflineFeedback<Policy>;
    const allReportsTransactionsAndViolations = useAllReportsTransactionsAndViolations();

    const [tagsLists] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, {canBeMissing: true});
    const [categories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`, {canBeMissing: true});

    const [reportCollection] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        canBeMissing: true,
        selector: (allReports) => {
            if (!allReports) {
                return [];
            }
            const reportIDsWithTransactions = Object.keys(allReportsTransactionsAndViolations ?? {});
            return Object.values(allReports).filter((report) => !!report && report?.policyID === policyID && reportIDsWithTransactions.includes(report.reportID));
        },
    });

    const reports: Array<OnyxValueWithOfflineFeedback<Report>> = useMemo(() => {
        if (!reportCollection) {
            return [];
        }
        return reportCollection as Array<OnyxValueWithOfflineFeedback<Report>>;
    }, [reportCollection]);

    const transactionsAndViolations = useMemo(() => {
        return reports.reduce<ReportTransactionsAndViolationsDerivedValue>((acc, report) => {
            if (report?.reportID && allReportsTransactionsAndViolations?.[report.reportID]) {
                acc[report.reportID] = allReportsTransactionsAndViolations?.[report.reportID];
            }
            return acc;
        }, {});
    }, [reports, allReportsTransactionsAndViolations]);

    return {
        tags: tagsLists ?? {},
        categories: categories ?? {},

        policy,
        reports,
        transactionsAndViolations,
    };
}

export type {PolicyData};
export default usePolicyData;
