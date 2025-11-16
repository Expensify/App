import type {OnyxEntry} from 'react-native-onyx';
import type {Policy, PolicyCategories, PolicyTagLists, Report} from '@src/types/onyx';
import type {ReportTransactionsAndViolationsDerivedValue} from '@src/types/onyx/DerivedValues';

type PolicyData = {
    policyID: string;
    policy: OnyxEntry<Policy>;
    tagLists: OnyxEntry<PolicyTagLists>;
    categories: OnyxEntry<PolicyCategories>;
    reports: Array<OnyxEntry<Report>>;
    transactionsAndViolations: ReportTransactionsAndViolationsDerivedValue;
};

export default PolicyData;
