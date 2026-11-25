import type {AgentRowData} from '@components/Tables/AgentsTable';

import {isValidAgentAccountID} from '@libs/AgentAccountIDMapping';
import Log from '@libs/Log';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import useAgentsTable from './useAgentsTable';
import useOnyx from './useOnyx';
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
    const [agentAccountIDMapping] = useOnyx(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING);
    // While a new agent's data reaches this tab, useAgentsTable lists it once, under its temporary or its real record.
    const otherRecordAccountIDs = new Map<number, number>();
    for (const [optimisticAccountID, realAccountID] of Object.entries(agentAccountIDMapping ?? {})) {
        if (isValidAgentAccountID(realAccountID)) {
            otherRecordAccountIDs.set(Number(optimisticAccountID), realAccountID);
            otherRecordAccountIDs.set(realAccountID, Number(optimisticAccountID));
        }
    }

    const workspaceAgents: AgentRowData[] = [];
    for (const key of Object.keys(manageableWorkspaceAgents)) {
        const accountID = Number(key.slice(ONYXKEYS.COLLECTION.AGENT.length));
        // Rows are keyed by the agent record's accountID; a new agent's row may show its real details under another ID.
        const agent = agents.find((agentItem) => agentItem.keyForList === String(accountID));

        if (!agent) {
            // The new agent's other record carries its row.
            const otherRecordAccountID = otherRecordAccountIDs.get(accountID);
            if (!agents.some((agentItem) => agentItem.keyForList === String(otherRecordAccountID))) {
                Log.warn('Manageable agent is not found in agents list', {accountID, policyID});
            }
            continue;
        }

        // Attach role if agent is a member of the policy. A new agent's row can show its real details, and its real
        // accountID is the one the workspace lists as a member.
        const agentMembership = workspaceMembers.find((member) => member.accountID === accountID || member.accountID === agent.accountID);
        if (agentMembership) {
            const role = agentMembership.policyEmployee.role;
            agent.role = policyRoles.find((policyRole) => policyRole === role);
        }

        workspaceAgents.push(agent);
    }
    for (const accountID of nonManageableWorkspaceAgentsIDs) {
        // A new agent whose temporary record is listed above can already be a member under its real accountID.
        if (workspaceAgents.some((agent) => agent.accountID === accountID)) {
            continue;
        }
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
