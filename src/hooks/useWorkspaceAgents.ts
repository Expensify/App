import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import useAgents from './useAgents';
import useNetwork from './useNetwork';
import useWorkspaceAccountID from './useWorkspaceAccountID';
import useWorkspaceMembers from './useWorkspaceMembers';

function useWorkspaceAgents(policy: OnyxEntry<Policy>) {
    const {isOffline} = useNetwork();
    const policyID = policy?.id;
    const workspaceAccountID = useWorkspaceAccountID(policyID);
    const workspaceMembers = useWorkspaceMembers(policy);
    const workspaceMemberAccountIDs = new Set(workspaceMembers.map(({accountID}) => accountID));

    const agentsData = useAgents();
    agentsData.agents = agentsData.agents.filter((agent) => {
        if (agent.ownerAccountID === workspaceAccountID) {
            return true;
        }
        if (workspaceMemberAccountIDs.has(agent.accountID)) {
            return true;
        }
        return false;
    });

    // The useAgents hook only includes agents that the user can manage
    // We need to include other agents in the workspace too
    const manageableAgentAccountIDs = new Set(agentsData.agents.map(({accountID}) => accountID));
    for (const workspaceMember of workspaceMembers) {
        const {policyEmployee, accountID, details} = workspaceMember;
        if (!details.isCustomAgent) {
            continue;
        }
        if (manageableAgentAccountIDs.has(accountID)) {
            continue;
        }
        const isPendingDeletion = policyEmployee.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
        if (!isOffline && isPendingDeletion) {
            continue;
        }
        agentsData.agents.push({
            keyForList: String(accountID),
            accountID,
            displayName: details.displayName ?? details.login ?? '',
            login: details.login ?? '',
            disabled: isPendingDeletion,
            isSelectionDisabled: true,
            action: () => null,
            onChatPress: () => () => null,
            onCopilotPress: () => () => null,
            dismissError: () => () => null,
        });
    }

    return agentsData;
}

export default useWorkspaceAgents;
