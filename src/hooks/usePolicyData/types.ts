import type {Policy, PolicyCategories, PolicyTagLists, PolicyVendors, Report} from '@src/types/onyx';
import type {ReportTransactionsAndViolationsDerivedValue} from '@src/types/onyx/DerivedValues';
import type {OnyxValueWithOfflineFeedback} from '@src/types/onyx/OnyxCommon';

type PolicyData = {
    policy: OnyxValueWithOfflineFeedback<Policy>;
    tags: PolicyTagLists;
    categories: PolicyCategories;
    vendors?: PolicyVendors;
    reports: Array<OnyxValueWithOfflineFeedback<Report>>;
    transactionsAndViolations: ReportTransactionsAndViolationsDerivedValue;
};

export default PolicyData;
