import type CONST from '@src/CONST';
import type {FlagForReviewRuleForm, MerchantRuleForm, RequireFieldsRuleForm, SpendRuleForm} from '@src/types/form';

import type {ValueOf} from 'type-fest';

/** The outcome of a generation attempt */
type GeneratedRuleState = ValueOf<typeof CONST.GENERATED_RULE.STATE>;

/** The rule type a description was mapped to */
type GeneratedRuleType = ValueOf<typeof CONST.GENERATED_RULE.RULE_TYPE>;

/** The generated form values, seeding whichever draft ruleType names */
type GeneratedRuleValues = Partial<RequireFieldsRuleForm> & Partial<FlagForReviewRuleForm> & Partial<SpendRuleForm> & Partial<MerchantRuleForm>;

/** Model of a rule generated from an admin's description */
type GeneratedRule = {
    /** The generation attempt this answer belongs to */
    generationID: string;

    /** The outcome of the generation attempt */
    state: GeneratedRuleState;

    /** The rule type the description was mapped to */
    ruleType?: GeneratedRuleType;

    /** The form values to seed the rule draft with */
    rule?: GeneratedRuleValues;

    /** Short description of the generated rule */
    summary?: string;

    /** The area no rule type supports */
    unsupportedArea?: string;
};

export default GeneratedRule;
