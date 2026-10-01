import {getApprovalWorkflowRulesForPolicy} from '@libs/WorkflowUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import useOnyx from './useOnyx';

/**
 * Whether approval workflow rules route the reports of the given workspace, i.e. it has a rule that forwards or approves them.
 *
 * Admins also receive the workspace's merchant rules in this collection, so only the rules that route reports count.
 */
function useHasApprovalWorkflowRules(policyID: string | undefined): boolean {
    const [hasApprovalWorkflowRules] = useOnyx(ONYXKEYS.COLLECTION.RULE, {
        selector: (rules) =>
            Object.values(getApprovalWorkflowRulesForPolicy(rules, policyID)).some((rule) =>
                Object.values(rule.actions).some(
                    (action) => action.name === CONST.RULES.APPROVAL_WORKFLOW.ACTION.FORWARD_TO || action.name === CONST.RULES.APPROVAL_WORKFLOW.ACTION.APPROVE_REPORT,
                ),
            ),
    });

    return !!hasApprovalWorkflowRules;
}

export default useHasApprovalWorkflowRules;
