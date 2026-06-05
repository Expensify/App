import type {OnyxEntry} from 'react-native-onyx';
import Navigation from '@libs/Navigation/Navigation';
import {getMemberAccountIDsForWorkspace} from '@libs/PolicyUtils';
import type {AvatarSource} from '@libs/UserAvatarUtils';
import {addMembersToWorkspace} from '@userActions/Policy/Member';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';
import type ApprovalWorkflow from '@src/types/onyx/ApprovalWorkflow';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';

type OwnedAgent = {accountID: number; email: string; displayName: string; avatar?: AvatarSource};

/**
 * Returns a handler that seeds an approval workflow with the current user's first available
 * owned agent and navigates to the approver edit screen. When every owned agent is already
 * an approver on the workflow, the handler routes the admin to the create-agent screen so
 * we don't duplicate an existing agent.
 */
function useAddAgentToApprovalWorkflow(policy: OnyxEntry<Policy>, policyID: string) {
    const {formatPhoneNumber} = useLocalize();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [agentPrompts] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT);

    const ownedAgents: OwnedAgent[] = (() => {
        if (!agentPrompts || !personalDetails) {
            return [];
        }
        return Object.keys(agentPrompts)
            .map<OwnedAgent | null>((key) => {
                const accountID = Number(key.slice(ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT.length));
                const details = personalDetails[accountID];
                if (!details?.login) {
                    return null;
                }
                return {
                    accountID,
                    email: details.login,
                    displayName: details.displayName ?? details.login,
                    avatar: details.avatar,
                };
            })
            .filter((agent): agent is OwnedAgent => !!agent);
    })();

    return (workflow: ApprovalWorkflow) => {
        const workflowApproverEmail = workflow.approvers.at(0)?.email ?? '';

        // Prefer the first owned agent that isn't already an approver on this workflow.
        // If every owned agent is already in the workflow there's nothing to seed, so we
        // route the admin to create a new agent instead of duplicating an existing one.
        const agentToSeed = ownedAgents.find((candidate) => !workflow.approvers.some((approver) => approver.email === candidate.email));
        if (!agentToSeed) {
            Navigation.navigate(
                ROUTES.WORKSPACE_WORKFLOWS_ADD_AGENT.getRoute({
                    policyID,
                    workflowApproverEmail,
                }),
            );
            return;
        }

        // Ensure the agent is a workspace member before they show up as an approver. The
        // server makes this idempotent so it's safe to call even if the agent was added via
        // the API's `policyID` parameter when CREATE_AGENT was first called.
        const isAlreadyMember = !!policy?.employeeList?.[agentToSeed.email];
        if (!isAlreadyMember && policy) {
            const policyMemberAccountIDs = Object.values(getMemberAccountIDsForWorkspace(policy.employeeList, false, false));
            addMembersToWorkspace({[agentToSeed.email]: agentToSeed.accountID}, '', policy, policyMemberAccountIDs, CONST.POLICY.ROLE.USER, formatPhoneNumber, {
                accountID: currentUserPersonalDetails.accountID,
                displayName: currentUserPersonalDetails.displayName,
                email: currentUserPersonalDetails.login,
                avatar: currentUserPersonalDetails.avatar,
            });
        }

        Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_EDIT.getRoute(policyID, workflowApproverEmail, agentToSeed.email));
    };
}

export default useAddAgentToApprovalWorkflow;
