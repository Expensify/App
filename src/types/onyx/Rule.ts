import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import type {ApprovalWorkflowRule} from './ApprovalWorkflowRules';
import type {ExpenseDefaultRule, ExpenseDefaultTriggers} from './ExpenseDefaultRules';
import type {Errors, OnyxValueWithOfflineFeedback} from './OnyxCommon';
import type {RuleFilterNode} from './RuleFilters';

/** The kind of entity a rule is scoped to. */
type RuleScope = ValueOf<typeof CONST.RULES.SCOPE>;

/**
 * The body of a rule, i.e. the `value` sent to `SetRule`. Which body a rule has is determined by its
 * triggers and actions rather than by a discriminator field.
 */
type RuleBody = ApprovalWorkflowRule | ExpenseDefaultRule;

/** A category limit mirrored into the rules collection by a legacy write. */
type CategoryFlagRule = {
    triggers: ExpenseDefaultTriggers;
    filters: RuleFilterNode;
    actions: Record<string, {name: typeof CONST.RULES.ACTIONS.TRIGGER_VIOLATION}>;
};

/**
 * A rule as stored in the `ONYXKEYS.COLLECTION.RULE` collection under `rules_<ruleID>`.
 */
type Rule = OnyxValueWithOfflineFeedback<
    (RuleBody | CategoryFlagRule) & {
        /** What kind of entity this rule is scoped to. */
        scope: RuleScope;

        /** ID of the scoped entity (the policyID for `policy`-scoped rules). */
        scopeID: string;

        /** Determines the order rules are applied in when more than one matches. */
        priority?: number;

        /** ISO timestamp of when the rule was created. */
        created?: string;

        /** Errors from the latest failed write of this rule. */
        errors?: Errors;
    }
>;

export default Rule;
export type {RuleBody};
