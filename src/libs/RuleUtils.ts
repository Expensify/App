/**
 * Helpers for the `rules_` collection, which holds every kind of rule (approval workflows, expense defaults, ...)
 * under one shape. Anything reading the collection has to narrow to the kind it handles first, so those predicates
 * live here rather than in the per-kind util files, which would otherwise import each other. The policy-scoped
 * approval workflow readers live here too, so modules that cannot import `WorkflowUtils` (it reaches the connection
 * actions through `merge/HRUtils`) can still use them.
 */
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ApprovalWorkflowAction, ApprovalWorkflowRule} from '@src/types/onyx/ApprovalWorkflowRules';
import type {ExpenseDefaultAction, ExpenseDefaultRule} from '@src/types/onyx/ExpenseDefaultRules';
import type Rule from '@src/types/onyx/Rule';
import type {RuleFilterComparison, RuleFilterNode} from '@src/types/onyx/RuleFilters';

import type {OnyxCollection} from 'react-native-onyx';

type ApprovalWorkflowRulesDiff = Record<string, ApprovalWorkflowRule | null>;

/**
 * The index-keyed object shape the rules API uses for lists (`['a', 'b']` becomes `{'1': 'a', '2': 'b'}`). The
 * indices start at 1 because PHP decodes a 0-keyed JSON object as a list and re-encodes it as a JSON array,
 * which loses the object shape the rules API expects.
 */
function toIndexMap<T>(values: T[]): Record<string, T> {
    return Object.fromEntries(values.map((value, index) => [String(index + 1), value]));
}

/** Unwraps one of those index-keyed lists. The indices only order the list, so every reader drops them. */
function fromIndexMap<T>(indexMap: Record<string, T> | undefined): T[] {
    return Object.values(indexMap ?? {});
}

/** A rule's kind is read off its triggers, since nothing on the rule itself says which one it is. */
function getRuleTriggers(rule: Rule): string[] {
    const triggers: Record<string, string> | undefined = rule.triggers;
    return fromIndexMap(triggers);
}

/**
 * An approval workflow rule is one that only fires on report events.
 *
 * Every trigger has to be a report event, not just one of them. A rule that also fires on transaction creation is
 * an expense default and is listed as one, so treating it as a workflow would delete it along with the workflows
 * when approvals are turned off.
 */
function isApprovalWorkflowRule(rule: Rule): rule is Rule & ApprovalWorkflowRule {
    const approvalWorkflowTriggers: readonly string[] = CONST.RULES.APPROVAL_WORKFLOW.TRIGGERS;
    const triggers = getRuleTriggers(rule);

    return triggers.length > 0 && triggers.every((trigger) => approvalWorkflowTriggers.includes(trigger));
}

/**
 * An expense default rule fires on transaction creation, matches on a merchant, and sets at least one field.
 *
 * This mirrors the rules engine's own definition. It is a heuristic over triggers, filters and action names rather
 * than a full check of every action's shape, so callers that go on to read the values still validate them field by
 * field.
 *
 * The merchant condition is what keeps category rules out. They are moving into the same collection, and a client
 * that has no way to edit them must not list them either.
 */
function isExpenseDefaultRule(rule: Rule | undefined): rule is Rule & ExpenseDefaultRule {
    if (!rule) {
        return false;
    }

    // A rule's actions are one kind or the other, so widen to the union before reading the shared name.
    const actionsByIndex: Record<string, ExpenseDefaultAction | ApprovalWorkflowAction> | undefined = rule.actions;
    const actions = fromIndexMap(actionsByIndex);
    const hasCreateTransactionTrigger = getRuleTriggers(rule).some((trigger) => trigger === CONST.RULES.TRIGGERS.CREATE_TRANSACTION);
    const hasSetAction = actions.some((action) => action?.name === CONST.RULES.ACTIONS.SET);
    const hasMerchantFilter = getRuleFilterLeaves(rule.filters).some((leaf) => leaf.left === CONST.RULES.EXPENSE_DEFAULT.FIELD.MERCHANT);

    return hasCreateTransactionTrigger && hasMerchantFilter && hasSetAction;
}

/** Whether an unknown value read off a rule is shaped like a node of its filter tree. */
function isRuleFilterNode(value: unknown): value is RuleFilterNode {
    return !!value && typeof value === 'object' && 'left' in value && 'operator' in value && 'right' in value;
}

/**
 * A leaf node compares a single field, rather than joining two other nodes.
 *
 * Both shapes look the same (`{operator, left, right}`), so the giveaway is `left`: a comparison points at a
 * field name, a combination points at another node.
 */
function isRuleFilterComparison(node: RuleFilterNode | undefined): node is RuleFilterComparison {
    return !!node && typeof node.left === 'string';
}

/** Flattens a filter tree into its leaf comparisons, left to right. */
function getRuleFilterLeaves(filters: RuleFilterNode | undefined): RuleFilterComparison[] {
    // Rules arrive from the server, so a node can be malformed even though the type says otherwise.
    if (!filters || !isRuleFilterNode(filters)) {
        return [];
    }
    if (isRuleFilterComparison(filters)) {
        return [filters];
    }
    return [...getRuleFilterLeaves(filters.left), ...getRuleFilterLeaves(filters.right)];
}

/**
 * Keep only the rules belonging to `policyID`, preserving the collection shape so the result can still be
 * handed to anything that takes the whole rules collection.
 */
function filterRulesForPolicy(rulesCollection: OnyxCollection<Rule>, policyID: string | undefined): NonNullable<OnyxCollection<Rule>> {
    const result: NonNullable<OnyxCollection<Rule>> = {};
    if (!rulesCollection || !policyID) {
        return result;
    }

    for (const [onyxKey, rule] of Object.entries(rulesCollection)) {
        if (rule?.scope !== CONST.RULES.SCOPE.POLICY || rule.scopeID !== policyID) {
            continue;
        }
        result[onyxKey] = rule;
    }

    return result;
}

/**
 * Convert the `ONYXKEYS.COLLECTION.RULE` collection into the `ruleID -> rule body` map used by the
 * builder, reconcilers and converters, keeping only non-deleted rules scoped to `policyID`.
 */
function getApprovalWorkflowRulesForPolicy(rulesCollection: OnyxCollection<Rule> | undefined, policyID: string | undefined): Record<string, ApprovalWorkflowRule> {
    const result: Record<string, ApprovalWorkflowRule> = {};

    for (const [onyxKey, rule] of Object.entries(filterRulesForPolicy(rulesCollection, policyID))) {
        if (!rule || rule.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || !isApprovalWorkflowRule(rule)) {
            continue;
        }
        const ruleID = onyxKey.slice(ONYXKEYS.COLLECTION.RULE.length);
        result[ruleID] = {
            triggers: toIndexMap(fromIndexMap(rule.triggers)),
            filters: rule.filters,
            actions: toIndexMap(fromIndexMap(rule.actions)),
            ...(rule.isDefaultApprovalWorkflow ? {isDefaultApprovalWorkflow: true} : {}),
        };
    }

    return result;
}

export {
    filterRulesForPolicy,
    fromIndexMap,
    getApprovalWorkflowRulesForPolicy,
    getRuleFilterLeaves,
    isApprovalWorkflowRule,
    isExpenseDefaultRule,
    isRuleFilterComparison,
    isRuleFilterNode,
    toIndexMap,
};
export type {ApprovalWorkflowRulesDiff};
