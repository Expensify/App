import type CONST from '@src/CONST';
import type {FlagForReviewRuleForm, MerchantRuleForm, RequireFieldsRuleForm, SpendRuleForm} from '@src/types/form';

import type {ValueOf} from 'type-fest';

/** The rule that was built, or why no rule was built */
type GeneratedRuleState = ValueOf<typeof CONST.GENERATED_RULE.STATE>;

/** The rule type a description was mapped to */
type GeneratedRuleType = ValueOf<typeof CONST.GENERATED_RULE.RULE_TYPE>;

/**
 * The form values Concierge filled in. Every field is optional and the field names are unique across the four
 * rule forms, so this seeds whichever draft ruleType names.
 */
type GeneratedRuleValues = Partial<RequireFieldsRuleForm> & Partial<FlagForReviewRuleForm> & Partial<SpendRuleForm> & Partial<MerchantRuleForm>;

/** Model of the rule Concierge built from an admin's plain-English description */
type GeneratedRule = {
    /** The attempt this answer belongs to, so an earlier one is not mistaken for it */
    generationID: string;

    /** The rule that was built, or why no rule was built */
    state: GeneratedRuleState;

    /** The rule type the description was mapped to, set when state is rule */
    ruleType?: GeneratedRuleType;

    /** The form values to seed the matching rule draft with, set when state is rule */
    rule?: GeneratedRuleValues;

    /** Short plain-English description of the rule that was built */
    summary?: string;

    /** The area the deterministic rule types cannot express, set when state is unsupported */
    unsupportedArea?: string;
};

export default GeneratedRule;
