import {getApprovalWorkflowRulesForPolicy, hasApprovalWorkflowWithNonMemberApprover} from '@libs/WorkflowUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {emailSelector} from '@selectors/Session';

import useOnyx from './useOnyx';
import usePermissions from './usePermissions';

/**
 * Whether the current user should see a red dot for a workflow on this workspace whose approver is no longer a member.
 * The policy read goes through a selector that reduces it to the answer, so a consumer only re-renders when it changes.
 */
function useHasApprovalWorkflowWithNonMemberApprover(policyID: string | undefined): boolean {
    const {isBetaEnabled} = usePermissions();
    const isMultipleApproversBetaEnabled = isBetaEnabled(CONST.BETAS.MULTIPLE_APPROVERS);
    const [currentUserLogin] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});

    // Read without a selector, so a rule write costs a cheap reference check instead of a deep compare of the
    // policy's rules. Rules only route the workflows under the beta, so they aren't used otherwise.
    const [allRules] = useOnyx(ONYXKEYS.COLLECTION.RULE);
    const rules = isMultipleApproversBetaEnabled ? getApprovalWorkflowRulesForPolicy(allRules, policyID) : undefined;

    const policySelector = (policy: OnyxEntry<Policy>) => hasApprovalWorkflowWithNonMemberApprover({policy, currentUserLogin, rules, isMultipleApproversBetaEnabled});
    const [hasNonMemberApprover] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {selector: policySelector});

    return !!hasNonMemberApprover;
}

export default useHasApprovalWorkflowWithNonMemberApprover;
