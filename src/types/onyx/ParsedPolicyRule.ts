import type CONST from '@src/CONST';
import type {FlagForReviewRuleForm, MerchantRuleForm, RequireFieldsRuleForm, SpendRuleForm} from '@src/types/form';

import type {ValueOf} from 'type-fest';

/** The rule that was built, or why no rule was built */
type ParsedPolicyRuleState = ValueOf<typeof CONST.PARSED_POLICY_RULE.STATE>;

/** The rule type a description was mapped to */
type ParsedPolicyRuleType = ValueOf<typeof CONST.PARSED_POLICY_RULE.RULE_TYPE>;

/**
 * The form values Concierge filled in. Every field is optional and the field names are unique across the four
 * rule forms, so this seeds whichever draft ruleType names.
 */
type ParsedPolicyRuleValues = Partial<RequireFieldsRuleForm> & Partial<FlagForReviewRuleForm> & Partial<SpendRuleForm> & Partial<MerchantRuleForm>;

/** Model of the rule Concierge built from an admin's plain-English description */
type ParsedPolicyRule = {
    /** The attempt this answer belongs to, so an earlier one is not mistaken for it */
    parseID: string;

    /** The rule that was built, or why no rule was built */
    state: ParsedPolicyRuleState;

    /** The rule type the description was mapped to, set when state is rule */
    ruleType?: ParsedPolicyRuleType;

    /** The form values to seed the matching rule draft with, set when state is rule */
    rule?: ParsedPolicyRuleValues;

    /** Short plain-English description of the rule that was built */
    summary?: string;

    /** The area the deterministic rule types cannot express, set when state is unsupported */
    unsupportedArea?: string;
};

export default ParsedPolicyRule;
