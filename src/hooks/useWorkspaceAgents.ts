import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import useAgents from './useAgents';
import useNetwork from './useNetwork';
import useWorkspaceAccountID from './useWorkspaceAccountID';
import useWorkspaceMembers from './useWorkspaceMembers';

/**
 * Hook that returns the agent rows for a workspace: agents the user can manage joined with their workspace role, plus read-only rows for custom-agent members the user cannot manage.
 */
function useWorkspaceAgents(policy: OnyxEntry<Policy>) {
    const {isOffline} = useNetwork();
    const policyID = policy?.id;
    const workspaceAccountID = useWorkspaceAccountID(policyID);
    const workspaceMembers = useWorkspaceMembers(policy);
    const policyRoles = Object.values(CONST.POLICY.ROLE);

    const {agents, ...rest} = useAgents();
    const workspaceAgents = agents.flatMap((agent) => {
        const agentMembership = workspaceMembers.find((member) => member.accountID === agent.accountID);
        const isAgentOwnedByWorkspace = agent.ownerAccountID === workspaceAccountID;
        const isAgentMemberOfWorkspace = !!agentMembership;
        if (!isAgentOwnedByWorkspace && !isAgentMemberOfWorkspace) {
            return [];
        }
        // Attach the workspace role to the agent row. The agent object is local to this flatMap and not shared
        // eslint-disable-next-line no-param-reassign
        agent.role = policyRoles.find((policyRole) => policyRole === agentMembership?.policyEmployee.role);
        return [agent];
    });

    // The useAgents hook only includes agents that the user can manage
    // We need to include other agents in the workspace too
    const manageableAgentAccountIDs = new Set(workspaceAgents.map(({accountID}) => accountID));
    for (const workspaceMember of workspaceMembers) {
        const {policyEmployee, accountID, details} = workspaceMember;
        if (!details.isCustomAgent) {
            continue;
        }
        if (manageableAgentAccountIDs.has(accountID)) {
            continue;
        }
        const pendingAction = policyEmployee.pendingAction;
        const isPendingDeletion = pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
        if (!isOffline && isPendingDeletion) {
            continue;
        }
        workspaceAgents.push({
            keyForList: String(accountID),
            accountID,
            displayName: details.displayName ?? details.login ?? '',
            login: details.login ?? '',
            role: policyRoles.find((policyRole) => policyRole === policyEmployee.role),
            pendingAction,
            disabled: true,
            isSelectionDisabled: true,
            canManage: false,
            action: () => {},
            onChatPress: () => {},
            onCopilotPress: () => {},
            dismissError: () => {},
        });
    }

    return {agents: workspaceAgents, ...rest};
}

export default useWorkspaceAgents;
