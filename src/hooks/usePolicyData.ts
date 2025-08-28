import {useOnyx } from 'react-native-onyx';
import type {Report, Policy, PolicyCategories, PolicyTagLists } from '@src/types/onyx';
import type { OnyxValueWithOfflineFeedback } from '@src/types/onyx/OnyxCommon';
import type {ReportTransactionsAndViolationsDerivedValue } from '@src/types/onyx/DerivedValues';
import {useAllReportsTransactionsAndViolations} from '@components/OnyxListItemProvider';
import usePolicy from './usePolicy';
import ONYXKEYS from '@src/ONYXKEYS';

type PolicyData = {
    policy: OnyxValueWithOfflineFeedback<Policy>;
    reports: OnyxValueWithOfflineFeedback<Report>[];
    tags: PolicyTagLists;
    categories: PolicyCategories;
    transactionsAndViolations: ReportTransactionsAndViolationsDerivedValue;
};


function usePolicyData(policyID?: string):PolicyData {
    const policy = usePolicy(policyID);
    const allReportsTransactionsAndViolations = useAllReportsTransactionsAndViolations();

    const [tags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, {canBeMissing: true});
    const [categories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`, {canBeMissing: true});

    const [reports] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}`, {
        canBeMissing: false,
        selector: (reportCollection) => {
            if (!policyID) {
                return [];
            }
            return Object.values(reportCollection ?? {}).filter((report) => report !== undefined && report.reportID && report.policyID === policyID);
        }
    });

    const transactionsAndViolations = (reports ?? []).reduce<ReportTransactionsAndViolationsDerivedValue>((acc, report) => {
        if (report === undefined || !report.reportID) {
            return acc;
        }
        const reportTransactionsAndViolations = allReportsTransactionsAndViolations?.[report.reportID];
        if (reportTransactionsAndViolations) {
            acc[report.reportID] = reportTransactionsAndViolations;
        }
        return acc;
    }, {} as ReportTransactionsAndViolationsDerivedValue);

    return {
        policy: policy as OnyxValueWithOfflineFeedback<Policy>,
        reports: reports as OnyxValueWithOfflineFeedback<Report>[],
        tags: tags ?? {},
        categories: categories ?? {},
        transactionsAndViolations: transactionsAndViolations,
    };
}

export type {PolicyData}
export default usePolicyData;