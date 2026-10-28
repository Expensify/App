import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Agent, Policy} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import useNetwork from './useNetwork';
import useOnyx from './useOnyx';
import useWorkspaceAccountID from './useWorkspaceAccountID';
import useWorkspaceMembers from './useWorkspaceMembers';

/**
 * Hook that derives the policy's agents, including both agents owned by the policy and member agents.
 */
function useWorkspaceAgents(policy: OnyxEntry<Policy>) {
    const {isOffline} = useNetwork();
    const [allAgents] = useOnyx(ONYXKEYS.COLLECTION.AGENT);
    const policyID = policy?.id;
    const workspaceAccountID = useWorkspaceAccountID(policyID);
    const workspaceMembers = useWorkspaceMembers(policy);

    const manageableWorkspaceAgents: OnyxCollection<Agent> = Object.fromEntries(
        Object.entries(allAgents ?? {}).filter(([key, agent]) => {
            if (!agent) {
                return false;
            }
            const isPendingDeletion = agent.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
            if (isPendingDeletion && !isOffline) {
                return false;
            }
            const accountID = Number(key.slice(ONYXKEYS.COLLECTION.AGENT.length));
            const isAgentOwnedByWorkspace = agent.ownerAccountID === workspaceAccountID;
            const isAgentMemberOfWorkspace = !!workspaceMembers.find((member) => member.accountID === accountID);
            if (!isAgentOwnedByWorkspace && !isAgentMemberOfWorkspace) {
                return false;
            }
            return true;
        }),
    );
    const manageableWorkspaceAgentsIDs = new Set(Object.keys(manageableWorkspaceAgents).map((key) => Number(key.slice(ONYXKEYS.COLLECTION.AGENT.length))));

    const nonManageableWorkspaceAgentsIDs: number[] = [];
    for (const {accountID, details} of workspaceMembers) {
        if (!details.isCustomAgent) {
            continue;
        }
        if (manageableWorkspaceAgentsIDs.has(accountID)) {
            continue;
        }
        nonManageableWorkspaceAgentsIDs.push(accountID);
    }

    return {
        manageableWorkspaceAgents,
        nonManageableWorkspaceAgentsIDs,
    };
}

export default useWorkspaceAgents;
