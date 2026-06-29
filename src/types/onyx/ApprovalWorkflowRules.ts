import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

/**
 * Operand of a comparison in an approval-workflow filter.
 *
 * - The left operand is a field identifier — one of the search-syntax filter keys (extended
 *   with `previousApprover` for approval rules).
 * - The right operand is the literal value the field is compared against. For email-typed
 *   fields like `from`, the value may be a list of emails to match against.
 */
type ApprovalWorkflowFilterOperand = ValueOf<typeof CONST.SEARCH.SYNTAX_FILTER_KEYS> | string | number | string[];

/**
 * A single comparison node: `<left> <operator> <right>`.
 *
 * `right` is optional because a future operator may be unary, but for the operators currently
 * in use (`eq`, `lt`, `gte`, ...) both sides are required.
 */
type ApprovalWorkflowFilterComparison = {
    /** The comparison operator. */
    operator: ValueOf<typeof CONST.SEARCH.SYNTAX_OPERATORS>;

    /** The field identifier being compared. */
    left: ApprovalWorkflowFilterOperand;

    /** The literal value being compared against. */
    right?: ApprovalWorkflowFilterOperand;
};

/**
 * Top-level filter for an approval-workflow rule. Combines two child nodes with a boolean
 * operator. `left` / `right` may be either leaf comparisons or nested filters
 */
type ApprovalWorkflowFilter = {
    /** Boolean combinator */
    operator: ValueOf<typeof CONST.SEARCH.SYNTAX_OPERATORS>;

    /** Left-hand child: leaf comparison or nested boolean filter. */
    left: ApprovalWorkflowFilterComparison | ApprovalWorkflowFilter;

    /** Right-hand child */
    right?: ApprovalWorkflowFilterComparison | ApprovalWorkflowFilter;
};

/**
 * A single approval-workflow rule, keyed by ruleID inside `Policy.rules.approvalWorkflows`.
 * When all `filters` match a report, the report is forwarded to `nextReceiver`.
 */
type ApprovalWorkflowRule = {
    /**
     * Conditions that must match the report for the rule to fire.
     */
    filters: ApprovalWorkflowFilter | ApprovalWorkflowFilterComparison;

    /** Currently the only supported action. Kept as a literal to leave room for future actions. */
    action: 'forward';

    /** Email of the user the report is forwarded to when the rule matches. */
    nextReceiver: string;
};

/**
 * Map of approval-workflow rules keyed by ruleID, as stored on the policy under
 * `rules.approvalWorkflows`.
 */
type ApprovalWorkflowRules = Record<string, ApprovalWorkflowRule>;

export type {ApprovalWorkflowFilter, ApprovalWorkflowFilterComparison, ApprovalWorkflowFilterOperand, ApprovalWorkflowRule, ApprovalWorkflowRules};
