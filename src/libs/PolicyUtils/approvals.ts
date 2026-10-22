/**
 * Approval mode, the default approver, approval workflow rules, and who a report submits or forwards to.
 * Extracted from PolicyUtils/index.ts to keep that file smaller.
 */
import type {PersonalDetailsByLogin} from '@components/PersonalDetailsByLoginProvider';

import {getCategoryApproverRule} from '@libs/CategoryUtils';
import {getHRAdvancedModeFinalApprover} from '@libs/merge/HRUtils';
import {getAccountIDsByLogins} from '@libs/PersonalDetailsUtils';
import {isApprovalWorkflowRule, isRuleFilterComparison} from '@libs/RuleUtils';
import {getAllSortedTransactions, getCategory, getTag} from '@libs/TransactionUtils';
import {isValidAccountRoute} from '@libs/ValidationUtils';

import CONST from '@src/CONST';
import type {OnyxInputOrEntry, Policy, Report} from '@src/types/onyx';
import type {ApprovalWorkflowRule} from '@src/types/onyx/ApprovalWorkflowRules';
import type {ApprovalRule} from '@src/types/onyx/Policy';
import type Rule from '@src/types/onyx/Rule';
import type {RuleFilterComparison, RuleFilterNode} from '@src/types/onyx/RuleFilters';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {isPolicyMember} from './members';
import {isPolicyApprover} from './permissions';
import {isGroupPolicy} from './policyType';
import {getTagApproverRule} from './rules';
import {isSubmitAndClose} from './workflows';

/** The report facts an approval workflow rule is matched against. */
type ApprovalWorkflowContext = {
    /** Email of the member who submitted the report. */
    submitterEmail: string;

    /** Email of the approver the report is currently with. Empty when the report has not been approved yet. */
    currentApproverEmail?: string;

    /** Total of the report, in the backend (cents) amount the rules' `amount` filters are written in. */
    reportTotal: number;
};

/** The outcome of matching a report against the policy's approval workflow rules. */
type ApprovalWorkflowRuleMatch = {
    /** Email the matched rule forwards the report to. Undefined when the rule finalizes the report instead. */
    forwardsTo?: string;
};

/**
 * Returns true when the user is both a submitter and an approver, mirroring the Submit/Approve suggested-search eligibility in
 * `getSuggestedSearchesVisibility` (SearchUIUtils): a submitter is a member of any group workspace, and an approver is a member of a
 * group workspace with a non-optional approval flow whom `isPolicyApprover` recognizes (named approver or someone reports submit/forward to).
 */
function isSubmitterAndApprover(policies: OnyxCollection<Policy> | null | undefined, currentUserEmail: string | undefined): boolean {
    if (!policies || !currentUserEmail) {
        return false;
    }
    let isSubmitter = false;
    let isApprover = false;
    for (const policy of Object.values(policies)) {
        if (!policy) {
            continue;
        }
        isSubmitter = isSubmitter || isGroupPolicy(policy);
        if (!isApprover) {
            const hasApprovalFlow = isGroupPolicy(policy) && !!policy.approvalMode && policy.approvalMode !== CONST.POLICY.APPROVAL_MODE.OPTIONAL;
            isApprover = hasApprovalFlow && isPolicyApprover(policy, currentUserEmail);
        }
        if (isSubmitter && isApprover) {
            return true;
        }
    }
    return false;
}

function isControlOnAdvancedApprovalMode(policy: OnyxInputOrEntry<Policy>): boolean {
    return policy?.type === CONST.POLICY.TYPE.CORPORATE && getApprovalWorkflow(policy) === CONST.POLICY.APPROVAL_MODE.ADVANCED;
}

function getApprovalWorkflow(policy: OnyxEntry<Policy>): ValueOf<typeof CONST.POLICY.APPROVAL_MODE> {
    if (policy?.type === CONST.POLICY.TYPE.PERSONAL) {
        return CONST.POLICY.APPROVAL_MODE.OPTIONAL;
    }

    return policy?.approvalMode ?? CONST.POLICY.APPROVAL_MODE.ADVANCED;
}

function getDefaultApprover(policy: OnyxEntry<Policy>): string {
    // We intentionally use || here so an empty-string approver falls back to the owner. ?? would keep the empty string.
    return policy?.approver || policy?.owner || '';
}

/**
 * Whether an approver email points at someone who is no longer on the workspace. The owner always counts as a member,
 * and HR advanced (manager) mode is excluded, because its final approver doesn't have to be a workspace member.
 */
function isNonMemberApprover(policy: OnyxEntry<Policy>, approverEmail: string | undefined): boolean {
    return !!approverEmail && !isPolicyMember(policy, approverEmail) && !getHRAdvancedModeFinalApprover(policy);
}

/**
 * Whether the policy has at least one custom approval workflow. A workflow is considered custom when either:
 * - the default workflow was modified by changing its first approver or adding an "Approves to" user, or
 * - a new workflow was created (a member submits to an approver other than the default approver).
 */
function hasCustomApprovalWorkflow(policy: OnyxEntry<Policy>): boolean {
    if (!policy) {
        return false;
    }

    const defaultApprover = getDefaultApprover(policy);

    // The default workflow's first approver was changed away from the workspace owner.
    if (!!policy.approver && !!policy.owner && policy.approver !== policy.owner) {
        return true;
    }

    const employees = policy.employeeList ?? {};

    // The default approver forwards approvals to someone, i.e. an "Approves to" user was added,
    // either unconditionally (forwardsTo) or above an approval limit (overLimitForwardsTo).
    const defaultApproverEmployee = employees[defaultApprover];
    if (!!defaultApprover && (!!defaultApproverEmployee?.forwardsTo || !!defaultApproverEmployee?.overLimitForwardsTo)) {
        return true;
    }

    // A new workflow exists when a member submits to an approver other than the default approver.
    return Object.values(employees).some(
        (employee) => employee?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && !!employee?.submitsTo && employee.submitsTo !== defaultApprover,
    );
}

function getRuleApprovers(policy: OnyxEntry<Policy>, expenseReport: OnyxEntry<Report>) {
    const categoryApprovers: string[] = [];
    const tagApprovers: string[] = [];
    const allReportTransactions = getAllSortedTransactions(expenseReport?.reportID);

    // Before submitting to their `submitsTo` (in a policy on Advanced Approvals), submit to category/tag approvers.
    // Category approvers are prioritized, then tag approvers.
    for (let i = 0; i < allReportTransactions.length; i++) {
        const transaction = allReportTransactions.at(i);
        const tag = getTag(transaction);
        const category = getCategory(transaction);
        const categoryApprover = getCategoryApproverRule(policy?.rules?.approvalRules ?? [], category)?.approver;
        const tagApprover = getTagApproverRule(policy, tag)?.approver;
        if (categoryApprover) {
            categoryApprovers.push(categoryApprover);
        }

        if (tagApprover) {
            tagApprovers.push(tagApprover);
        }
    }

    // Return the unique approvers list
    return [...new Set([...categoryApprovers, ...tagApprovers])];
}

function getFirstRuleApprover(approvalRules: ApprovalRule[], expenseReport: OnyxEntry<Report>, ownerLogin: string | undefined) {
    // Pre-build a lookup map of { category: { value → approver }, tag: { value → approver } }
    // from the policy's approval rules so that each transaction's category/tag can be resolved in O(1).
    const rulesMap: Record<'category' | 'tag', Record<string, string>> = {
        category: {},
        tag: {},
    };

    for (let i = 0; i < approvalRules.length; i++) {
        const rule = approvalRules.at(i);
        if (!rule) {
            continue;
        }
        for (let j = 0; j < rule.applyWhen.length; j++) {
            const applyWhen = rule.applyWhen.at(j);
            if (applyWhen?.condition !== CONST.POLICY.RULE_CONDITIONS.MATCHES) {
                continue;
            }
            if (applyWhen.field === CONST.POLICY.FIELDS.CATEGORY || applyWhen.field === CONST.POLICY.FIELDS.TAG) {
                rulesMap[applyWhen.field][applyWhen.value] = rule.approver;
            }
        }
    }

    if (isEmptyObject(rulesMap.category) && isEmptyObject(rulesMap.tag)) {
        return '';
    }

    const allReportTransactions = getAllSortedTransactions(expenseReport?.reportID);

    if (!allReportTransactions.length) {
        return '';
    }

    let firstCategoryApprover = '';
    let firstTagApprover = '';

    for (let i = 0; i < allReportTransactions.length; i++) {
        const transaction = allReportTransactions.at(i);
        const category = getCategory(transaction);
        const categoryApprover = rulesMap.category[category];

        // Category approvers take strict priority over tag approvers.
        // Break immediately on the first match so we don't keep scanning transactions unnecessarily.
        if (categoryApprover && categoryApprover !== ownerLogin) {
            firstCategoryApprover = categoryApprover;
            break;
        }

        // Only look for a tag approver if we haven't found one yet — no need to re-check on subsequent transactions.
        if (!firstTagApprover) {
            const tag = getTag(transaction);
            const tagApprover = rulesMap.tag[tag];

            if (tagApprover && tagApprover !== ownerLogin) {
                firstTagApprover = tagApprover;
            }
        }
    }

    return firstCategoryApprover || firstTagApprover;
}

function matchesApprovalWorkflowEmailComparison(node: RuleFilterComparison, email: string | undefined): boolean {
    const expectedEmails = (Array.isArray(node.right) ? node.right : [node.right]).map((value) => String(value).toLowerCase());
    const isMatch = !!email && expectedEmails.includes(email.toLowerCase());
    return node.operator === CONST.SEARCH.SYNTAX_OPERATORS.NOT_EQUAL_TO ? !isMatch : isMatch;
}

function matchesApprovalWorkflowAmountComparison(node: RuleFilterComparison, amount: number): boolean {
    const expectedAmount = typeof node.right === 'number' ? node.right : Number(node.right);
    if (Number.isNaN(expectedAmount)) {
        return false;
    }

    switch (node.operator) {
        case CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO:
            return amount === expectedAmount;
        case CONST.SEARCH.SYNTAX_OPERATORS.NOT_EQUAL_TO:
            return amount !== expectedAmount;
        case CONST.SEARCH.SYNTAX_OPERATORS.GREATER_THAN:
            return amount > expectedAmount;
        case CONST.SEARCH.SYNTAX_OPERATORS.GREATER_THAN_OR_EQUAL_TO:
            return amount >= expectedAmount;
        case CONST.SEARCH.SYNTAX_OPERATORS.LOWER_THAN:
            return amount < expectedAmount;
        case CONST.SEARCH.SYNTAX_OPERATORS.LOWER_THAN_OR_EQUAL_TO:
            return amount <= expectedAmount;
        default:
            return false;
    }
}

function evaluateApprovalWorkflowFilter(node: RuleFilterNode, context: ApprovalWorkflowContext): boolean {
    if (!isRuleFilterComparison(node)) {
        const left = evaluateApprovalWorkflowFilter(node.left, context);
        const right = evaluateApprovalWorkflowFilter(node.right, context);
        return node.operator === CONST.SEARCH.SYNTAX_OPERATORS.OR ? left || right : left && right;
    }

    switch (node.left) {
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM:
            return matchesApprovalWorkflowEmailComparison(node, context.submitterEmail);

        // A report with no current approver has not been approved by anybody yet, so a rule based on who
        // approved it last cannot apply.
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.TO:
            return !!context.currentApproverEmail && matchesApprovalWorkflowEmailComparison(node, context.currentApproverEmail);
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT:
            return matchesApprovalWorkflowAmountComparison(node, Math.abs(context.reportTotal));

        default:
            return false;
    }
}

/**
 * True when every condition in the rule's filter tree is true for `context`.
 */
function evaluateApprovalWorkflowRule(rule: ApprovalWorkflowRule, context: ApprovalWorkflowContext): boolean {
    return evaluateApprovalWorkflowFilter(rule.filters, context);
}

/**
 * Check the policy's approval workflow rules to determine where the report goes next.
 */
function getForwardsToFromRules(policy: OnyxEntry<Policy>, context: ApprovalWorkflowContext, rules: OnyxCollection<Rule>): ApprovalWorkflowRuleMatch | undefined {
    if (!policy?.id || !context.submitterEmail) {
        return undefined;
    }

    const trigger = context.currentApproverEmail ? CONST.RULES.TRIGGERS.REPORT_APPROVE : CONST.RULES.TRIGGERS.REPORT_SUBMIT;

    // Sort by Onyx key so the rule picked stays the same across evaluations when more than one matches (which should not happen).
    const ruleKeys = Object.keys(rules ?? {}).sort();
    for (const ruleKey of ruleKeys) {
        const rule = rules?.[ruleKey];
        if (!rule || rule.scope !== CONST.RULES.SCOPE.POLICY || rule.scopeID !== policy.id || rule.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            continue;
        }
        if (!isApprovalWorkflowRule(rule) || !Object.values(rule.triggers ?? {}).includes(trigger)) {
            continue;
        }
        if (!evaluateApprovalWorkflowRule(rule, context)) {
            continue;
        }

        return {forwardsTo: Object.values(rule.actions ?? {}).find((action) => action.name === CONST.RULES.ACTIONS.FORWARD_TO)?.approver};
    }

    return undefined;
}

function getManagerAccountEmail(policy: OnyxEntry<Policy>, ownerLogin: string | undefined, rules: OnyxCollection<Rule>, reportTotal = 0): string {
    const ruleMatch = getForwardsToFromRules(policy, {submitterEmail: ownerLogin ?? '', reportTotal}, rules);
    if (ruleMatch) {
        return ruleMatch.forwardsTo ?? '';
    }

    const defaultApprover = getDefaultApprover(policy);

    // For policy using the optional or basic workflow, the manager is the policy default approver.
    if (([CONST.POLICY.APPROVAL_MODE.OPTIONAL, CONST.POLICY.APPROVAL_MODE.BASIC] as Array<ValueOf<typeof CONST.POLICY.APPROVAL_MODE>>).includes(getApprovalWorkflow(policy))) {
        return defaultApprover;
    }

    const employee = policy?.employeeList?.[ownerLogin ?? ''];
    if (!employee && !defaultApprover) {
        return '';
    }

    return employee?.submitsTo ?? defaultApprover ?? '';
}

function getManagerAccountID(policy: OnyxEntry<Policy>, ownerLogin: string | undefined, rules: OnyxCollection<Rule>, reportTotal = 0) {
    const managerEmail = getManagerAccountEmail(policy, ownerLogin, rules, reportTotal);
    return managerEmail ? (getAccountIDsByLogins([managerEmail]).at(0) ?? -1) : -1;
}

/**
 * Returns the email the expense report should submit to per workspace approval config
 * (approval rules, employee submitsTo, or default approver for basic/optional workflows).
 */
function getSubmitToEmail(
    policy: OnyxEntry<Policy>,
    expenseReport: OnyxEntry<Report>,
    ownerLogin: string | undefined,
    rules: OnyxCollection<Rule>,
    shouldFallBackWhenManagerIsNotMember = false,
): string {
    const approvalRules = policy?.rules?.approvalRules;

    if (!isSubmitAndClose(policy) && approvalRules?.length) {
        const ruleApprover = getFirstRuleApprover(approvalRules, expenseReport, ownerLogin);
        if (ruleApprover) {
            return ruleApprover;
        }
    }

    const ruleMatch = getForwardsToFromRules(policy, {submitterEmail: ownerLogin ?? '', reportTotal: expenseReport?.total ?? 0}, rules);
    if (ruleMatch) {
        return ruleMatch.forwardsTo ?? '';
    }

    const managerEmail = getManagerAccountEmail(policy, ownerLogin, rules, expenseReport?.total ?? 0);

    // Falls back to the default approver when the manager is unavailable.
    if (shouldFallBackWhenManagerIsNotMember && managerEmail && !policy?.employeeList?.[managerEmail] && !getHRAdvancedModeFinalApprover(policy)) {
        return getDefaultApprover(policy);
    }

    return managerEmail;
}

/**
 * Returns the accountID to whom the given expenseReport submits reports to in the given Policy.
 */
function getSubmitToAccountID(
    policy: OnyxEntry<Policy>,
    expenseReport: OnyxEntry<Report>,
    ownerLogin: string | undefined,
    rules: OnyxCollection<Rule>,
    shouldFallBackWhenManagerIsNotMember = false,
): number {
    const submitToEmail = getSubmitToEmail(policy, expenseReport, ownerLogin, rules, shouldFallBackWhenManagerIsNotMember);
    return submitToEmail ? (getAccountIDsByLogins([submitToEmail]).at(0) ?? CONST.DEFAULT_NUMBER_ID) : CONST.DEFAULT_NUMBER_ID;
}

function getSubmitReportManagerAccountID(
    policy: OnyxEntry<Policy>,
    expenseReport: OnyxEntry<Report>,
    submitterLogin: string | undefined,
    rules: OnyxCollection<Rule>,
    personalDetailsByLogins: PersonalDetailsByLogin,
): number | undefined {
    const approvalRules = policy?.rules?.approvalRules;
    const ruleApprover = !isSubmitAndClose(policy) && approvalRules?.length ? getFirstRuleApprover(approvalRules, expenseReport, submitterLogin) : '';
    const hasReliablePolicyRoute =
        ([CONST.POLICY.APPROVAL_MODE.OPTIONAL, CONST.POLICY.APPROVAL_MODE.BASIC] as Array<ValueOf<typeof CONST.POLICY.APPROVAL_MODE>>).includes(getApprovalWorkflow(policy)) ||
        !!ruleApprover ||
        !!policy?.employeeList?.[submitterLogin ?? ''];

    if (!hasReliablePolicyRoute) {
        return undefined;
    }

    const submitToEmail = getSubmitToEmail(policy, expenseReport, submitterLogin, rules, true);
    const submitToAccountID = submitToEmail ? personalDetailsByLogins[submitToEmail]?.accountID : undefined;
    if (submitToAccountID === undefined || !isValidAccountRoute(submitToAccountID)) {
        return undefined;
    }

    return submitToAccountID;
}

/**
 * Returns the email of the account to forward the report to depending on the approver's approval limit.
 * Used for advanced approval mode only.
 *
 * `submitterEmail` is needed to consult the workspace's approval workflow rules, which describe each hop in
 * terms of who submitted the report as well as who is approving it. Without it only the legacy employeeList
 * forwardsTo/overLimitForwardsTo is considered.
 */
function getForwardsToAccount(policy: OnyxEntry<Policy>, employeeEmail: string, reportTotal: number, rules: OnyxCollection<Rule>, submitterEmail?: string): string {
    const ruleMatch = submitterEmail ? getForwardsToFromRules(policy, {submitterEmail, currentApproverEmail: employeeEmail, reportTotal}, rules) : undefined;
    if (ruleMatch) {
        return ruleMatch.forwardsTo ?? '';
    }

    if (!isControlOnAdvancedApprovalMode(policy)) {
        return '';
    }

    const employee = policy?.employeeList?.[employeeEmail];
    if (!employee) {
        return '';
    }

    const positiveReportTotal = Math.abs(reportTotal);
    if (employee.approvalLimit && employee.overLimitForwardsTo && positiveReportTotal > employee.approvalLimit) {
        return employee.overLimitForwardsTo;
    }
    return employee.forwardsTo ?? '';
}

function getWorkflowApprovalsUnavailable(policy: OnyxEntry<Policy>) {
    return policy?.approvalMode === CONST.POLICY.APPROVAL_MODE.OPTIONAL || !!policy?.errorFields?.approvalMode;
}

export {
    isSubmitterAndApprover,
    getApprovalWorkflow,
    getDefaultApprover,
    isNonMemberApprover,
    hasCustomApprovalWorkflow,
    getRuleApprovers,
    evaluateApprovalWorkflowRule,
    getForwardsToFromRules,
    getManagerAccountEmail,
    getManagerAccountID,
    getSubmitToEmail,
    getSubmitToAccountID,
    getSubmitReportManagerAccountID,
    getForwardsToAccount,
    getWorkflowApprovalsUnavailable,
};
