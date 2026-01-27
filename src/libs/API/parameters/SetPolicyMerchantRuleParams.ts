import type {CodingRuleTax} from '@src/types/onyx/Policy';

type SetPolicyMerchantRuleParams = {
    policyID: string;
    merchantToMatch: string;
    merchant?: string;
    category?: string;
    tag?: string;
    tax?: CodingRuleTax;
    comment?: string;
    reimbursable?: boolean;
    billable?: boolean;
};

export default SetPolicyMerchantRuleParams;
