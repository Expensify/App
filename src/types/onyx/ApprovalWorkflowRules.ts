import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import type {RuleFilter, RuleFilterComparison} from './RuleFilters';

/**
 * A report lifecycle event that can fire an approval-workflow rule (`ReportSubmit` or `ReportApprove`).
 */
type ApprovalWorkflowTrigger = ValueOf<typeof CONST.RULES.APPROVAL_WORKFLOW.TRIGGER>;

/**
 * The triggers of a rule, keyed by a string index (e.g. `{"0": "ReportSubmit"}`). A rule fires when
 * any of its triggers matches the report event.
 */
type ApprovalWorkflowTriggers = Record<string, ApprovalWorkflowTrigger>;

/**
 * The name of the action a rule performs when it matches (`ForwardTo` or `ApproveReport`).
 */
type ApprovalWorkflowActionName = ValueOf<typeof CONST.RULES.APPROVAL_WORKFLOW.ACTION>;

/**
 * A single action a rule performs when it matches.
 */
type ApprovalWorkflowAction = {
    /** What the rule does when it matches. */
    name: ApprovalWorkflowActionName;

    /** Email of the approver the report is forwarded to. Present only for `ForwardTo` actions. */
    approver?: string;
};

/**
 * The actions of a rule, keyed by a string index (e.g. `{"0": {"name": "ForwardTo", "approver": "..."}}`).
 */
type ApprovalWorkflowActions = Record<string, ApprovalWorkflowAction>;

/**
 * A single comparison node: `<left> <operator> <right>`. Both `left` and `right` are always present.
 */
type ApprovalWorkflowFilterComparison = RuleFilterComparison;

/**
 * A boolean filter that combines two child nodes. `left` / `right` may each be either a leaf comparison
 * or a nested boolean filter. Both children are always present.
 */
type ApprovalWorkflowFilter = RuleFilter;

/**
 * The body of a single approval-workflow rule. When the report event matches one of the `triggers` and
 * the `filters` match the report, the rule's `actions` are performed
 */
type ApprovalWorkflowRule = {
    /** Report lifecycle events that fire this rule. */
    triggers: ApprovalWorkflowTriggers;

    /** Conditions that must match the report for the rule to fire. */
    filters: ApprovalWorkflowFilter | ApprovalWorkflowFilterComparison;

    /** What happens when the rule matches. */
    actions: ApprovalWorkflowActions;

    /** Whether this rule belongs to the policy's default workflow. */
    isDefaultApprovalWorkflow?: boolean;
};

export type {ApprovalWorkflowAction, ApprovalWorkflowActions, ApprovalWorkflowFilter, ApprovalWorkflowFilterComparison, ApprovalWorkflowRule, ApprovalWorkflowTriggers};
