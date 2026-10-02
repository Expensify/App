import {getApprovalWorkflowRulesForPolicy, hasApprovalWorkflowWithNonMemberApprover} from '@libs/WorkflowUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import type Rule from '@src/types/onyx/Rule';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {emailSelector} from '@selectors/Session';

import useOnyx from './useOnyx';
import usePermissions from './usePermissions';

/**
 * Whether the current user should see a red dot for a workflow on this workspace whose approver is no longer a member.
 * Both reads go through selectors, so a consumer only re-renders when the answer changes.
 */
function useHasApprovalWorkflowWithNonMemberApprover(policyID: string | undefined): boolean {
    const {isBetaEnabled} = usePermissions();
    const isMultipleApproversBetaEnabled = isBetaEnabled(CONST.BETAS.MULTIPLE_APPROVERS);
    const [currentUserLogin] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});

    // Rules only route the workflows under the beta, so they aren't read otherwise
    const rulesSelector = (rules: OnyxCollection<Rule>) => (isMultipleApproversBetaEnabled ? getApprovalWorkflowRulesForPolicy(rules, policyID) : undefined);
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE, {selector: rulesSelector});

    const policySelector = (policy: OnyxEntry<Policy>) => hasApprovalWorkflowWithNonMemberApprover({policy, currentUserLogin, rules, isMultipleApproversBetaEnabled});
    const [hasNonMemberApprover] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {selector: policySelector});

    return !!hasNonMemberApprover;
}

export default useHasApprovalWorkflowWithNonMemberApprover;
