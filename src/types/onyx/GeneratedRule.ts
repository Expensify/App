import type CONST from '@src/CONST';
import type {FlagForReviewRuleForm, MerchantRuleForm, RequireFieldsRuleForm, SpendRuleForm} from '@src/types/form';

import type {ValueOf} from 'type-fest';

/** The outcome of a generation attempt */
type GeneratedRuleState = ValueOf<typeof CONST.GENERATED_RULE.STATE>;

/** The rule type a description was mapped to */
type GeneratedRuleType = ValueOf<typeof CONST.GENERATED_RULE.RULE_TYPE>;

/** Why neither a rule nor an agent rule can do what the description asks */
type GeneratedRuleImpossibleReason = ValueOf<typeof CONST.GENERATED_RULE.IMPOSSIBLE_REASON>;

/** The generated form values, seeding whichever draft ruleType names */
type GeneratedRuleValues = Partial<RequireFieldsRuleForm> &
    Partial<FlagForReviewRuleForm> &
    Partial<SpendRuleForm> &
    Partial<MerchantRuleForm> & {
        /** Whether a card spend rule covers every card a new rule can cover */
        isAllCards?: boolean;
    };

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

    /** The instruction an agent rule follows, written as what the agent will do. Only when state is agentRule. */
    agentRulePrompt?: string;

    /**
     * One sentence in the language of the description. When state is impossible, it says what cannot be done. When state
     * is agentRule, it says how the agent rule differs from the description, and it is absent when they match.
     */
    explanation?: string;

    /** Why the description cannot be done. Only when state is impossible. */
    reason?: GeneratedRuleImpossibleReason;

    /** The closest description that a rule or an agent rule can do. Only when state is impossible, and it can be empty. */
    suggestedPrompt?: string;
};

export default GeneratedRule;
export type {GeneratedRuleImpossibleReason, GeneratedRuleState, GeneratedRuleType, GeneratedRuleValues};
