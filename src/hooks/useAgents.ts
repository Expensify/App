import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Agent} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import useNetwork from './useNetwork';
import useOnyx from './useOnyx';

const filterDeletedAgents = (agents: OnyxCollection<Agent>, isOffline: boolean) => {
    return Object.fromEntries(
        Object.entries(agents ?? {}).filter(([, agent]) => {
            if (!agent) {
                return false;
            }
            const pendingAction = agent.pendingAction;
            const isPendingDeletion = pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
            if (isPendingDeletion && !isOffline) {
                return false;
            }
            return true;
        }),
    );
};

/**
 * Hook that derives the current user's manageable agents.
 */
function useAgents() {
    const {isOffline} = useNetwork();
    const [agents] = useOnyx(ONYXKEYS.COLLECTION.AGENT, {
        selector: (agentsCollection) => filterDeletedAgents(agentsCollection, isOffline),
    });
    return agents;
}

export default useAgents;
