import type {AgentRowData} from '@components/Tables/AgentsTable';

import Log from '@libs/Log';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import useAgentsTable from './useAgentsTable';
import useWorkspaceAgents from './useWorkspaceAgents';
import useWorkspaceMembers from './useWorkspaceMembers';

/**
 * Hook that returns the agent rows for a workspace: agents the user can manage joined with their workspace role, plus read-only rows for custom-agent members the user cannot manage.
 */
function useWorkspaceAgentsTable(policy: OnyxEntry<Policy>) {
    const policyID = policy?.id;
    const policyRoles = Object.values(CONST.POLICY.ROLE);
    const workspaceMembers = useWorkspaceMembers(policy);

    const {agents, ...rest} = useAgentsTable();
    const {manageableWorkspaceAgents, nonManageableWorkspaceAgentsIDs} = useWorkspaceAgents(policy);

    const workspaceAgents: AgentRowData[] = [];
    for (const key of Object.keys(manageableWorkspaceAgents)) {
        const accountID = Number(key.slice(ONYXKEYS.COLLECTION.AGENT.length));
        const agent = agents.find((agentItem) => agentItem.accountID === accountID);

        if (!agent) {
            Log.warn('Manageable agent is not found in agents list', {accountID, policyID});
            continue;
        }

        // Attach role if agent is a member of the policy
        const agentMembership = workspaceMembers.find((member) => member.accountID === accountID);
        if (agentMembership) {
            const role = agentMembership.policyEmployee.role;
            agent.role = policyRoles.find((policyRole) => policyRole === role);
        }

        workspaceAgents.push(agent);
    }
    for (const accountID of nonManageableWorkspaceAgentsIDs) {
        const agentMembership = workspaceMembers.find((member) => member.accountID === accountID);

        if (!agentMembership) {
            Log.warn('Non-manageable agent is not found in members list', {accountID, policyID});
            continue;
        }

        workspaceAgents.push({
            keyForList: String(accountID),
            accountID,
            displayName: agentMembership.details.displayName ?? agentMembership.details.login ?? '',
            login: agentMembership.details.login ?? '',
            role: policyRoles.find((policyRole) => policyRole === agentMembership.policyEmployee.role),
            pendingAction: agentMembership.policyEmployee.pendingAction,
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

export default useWorkspaceAgentsTable;
