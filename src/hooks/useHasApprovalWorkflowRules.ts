import {getApprovalWorkflowRulesForPolicy} from '@libs/WorkflowUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import useOnyx from './useOnyx';

/**
 * Whether approval workflow rules route the reports of the given workspace.
 */
function useHasApprovalWorkflowRules(policyID: string | undefined): boolean {
    const [hasApprovalWorkflowRules] = useOnyx(ONYXKEYS.COLLECTION.RULE, {
        selector: (rules) => !isEmptyObject(getApprovalWorkflowRulesForPolicy(rules, policyID)),
    });

    return !!hasApprovalWorkflowRules;
}

export default useHasApprovalWorkflowRules;
