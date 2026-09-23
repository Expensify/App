/**
 * Helpers for the `rules_` collection, which holds every kind of rule (approval workflows, expense defaults, ...)
 * under one shape. Anything reading the collection has to narrow to the kind it handles first, so those predicates
 * live here rather than in the per-kind util files, which would otherwise import each other.
 */
import CONST from '@src/CONST';
import type {ApprovalWorkflowAction, ApprovalWorkflowRule} from '@src/types/onyx/ApprovalWorkflowRules';
import type {ExpenseDefaultAction, ExpenseDefaultRule} from '@src/types/onyx/ExpenseDefaultRules';
import type Rule from '@src/types/onyx/Rule';
import type {RuleFilterComparison, RuleFilterNode} from '@src/types/onyx/RuleFilters';

/** A rule's kind is read off its triggers, since nothing on the rule itself says which one it is. */
function getRuleTriggers(rule: Rule): string[] {
    return Object.values(rule.triggers ?? {});
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
 * An expense default rule fires on transaction creation and sets at least one field.
 *
 * This mirrors the rules engine's own definition. It is a heuristic over triggers and action names rather than a
 * full check of every action's shape, so callers that go on to read the values still validate them field by field.
 */
function isExpenseDefaultRule(rule: Rule | undefined): rule is Rule & ExpenseDefaultRule {
    if (!rule) {
        return false;
    }

    // A rule's actions are one kind or the other, so widen to the union before reading the shared name.
    const actionsByIndex: Record<string, ExpenseDefaultAction | ApprovalWorkflowAction> = rule.actions ?? {};
    const actions = Object.values(actionsByIndex);
    const hasCreateTransactionTrigger = getRuleTriggers(rule).some((trigger) => trigger === CONST.RULES.TRIGGERS.CREATE_TRANSACTION);
    const hasSetAction = actions.some((action) => action?.name === CONST.RULES.ACTIONS.SET);

    return hasCreateTransactionTrigger && hasSetAction;
}

/** Whether an unknown value read off a rule is shaped like a node of its filter tree. */
function isRuleFilterNode(value: unknown): value is RuleFilterNode {
    return !!value && typeof value === 'object' && 'left' in value && 'operator' in value && 'right' in value;
}

/** A leaf node compares a single field: its `left` is a field name rather than another node. */
function isRuleFilterComparison(node: RuleFilterNode): node is RuleFilterComparison {
    return typeof node.left === 'string';
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

export {getRuleFilterLeaves, isApprovalWorkflowRule, isExpenseDefaultRule, isRuleFilterComparison, isRuleFilterNode};
