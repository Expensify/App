import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import useAgents from './useAgents';
import useNetwork from './useNetwork';
import useWorkspaceAccountID from './useWorkspaceAccountID';
import useWorkspaceMembers from './useWorkspaceMembers';

function useWorkspaceAgents(policy: OnyxEntry<Policy>) {
    const {isOffline} = useNetwork();
    const policyID = policy?.id;
    const workspaceAccountID = useWorkspaceAccountID(policyID);
    const workspaceMembers = useWorkspaceMembers(policy);

    const agentsData = useAgents();
    agentsData.agents = agentsData.agents.flatMap((agent) => {
        const agentMembership = workspaceMembers.find((member) => member.accountID === agent.accountID);
        const isAgentOwnedByWorkspace = agent.ownerAccountID === workspaceAccountID;
        const isAgentMemberOfWorkspace = !!agentMembership;
        if (!isAgentOwnedByWorkspace && !isAgentMemberOfWorkspace) {
            return [];
        }
        agent.role = agentMembership?.policyEmployee.role as ValueOf<typeof CONST.POLICY.ROLE>;
        return [agent];
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
        const pendingAction = policyEmployee.pendingAction;
        const isPendingDeletion = pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
        if (!isOffline && isPendingDeletion) {
            continue;
        }
        agentsData.agents.push({
            keyForList: String(accountID),
            accountID,
            displayName: details.displayName ?? details.login ?? '',
            login: details.login ?? '',
            role: policyEmployee.role as ValueOf<typeof CONST.POLICY.ROLE>,
            pendingAction,
            disabled: isPendingDeletion,
            isSelectionDisabled: true,
            canManage: false,
            action: () => null,
            onChatPress: () => () => null,
            onCopilotPress: () => () => null,
            dismissError: () => () => null,
        });
    }

    return agentsData;
}

export default useWorkspaceAgents;
