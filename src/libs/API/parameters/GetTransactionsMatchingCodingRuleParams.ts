import type {CodingRuleFilter} from '@src/types/onyx/Policy';

type GetTransactionsMatchingCodingRuleParams = {
    policyID: string;
    filters: CodingRuleFilter;
};

export default GetTransactionsMatchingCodingRuleParams;
