import type {Policy, PolicyCategories, PolicyTagLists, Report} from '@src/types/onyx';
import type {ReportTransactionsAndViolationsDerivedValue} from '@src/types/onyx/DerivedValues';
import type {OnyxValueWithOfflineFeedback} from '@src/types/onyx/OnyxCommon';

type PolicyData = {
    policy: OnyxValueWithOfflineFeedback<Policy>;
    tags: PolicyTagLists;
    categories: PolicyCategories;
    reports: Array<OnyxValueWithOfflineFeedback<Report>>;
    transactionsAndViolations: ReportTransactionsAndViolationsDerivedValue;
};

export default PolicyData;
