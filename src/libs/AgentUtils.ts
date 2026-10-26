import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Agent} from '@src/types/onyx';
import type {Errors} from '@src/types/onyx/OnyxCommon';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {getLatestError} from './ErrorUtils';

function getAgentErrors(agent: OnyxEntry<Agent>): Errors | undefined {
    if (!agent) {
        return undefined;
    }
    const mergedErrors = {
        ...getLatestError(agent.errors ?? undefined),
        ...getLatestError(agent.nameErrors ?? undefined),
        ...getLatestError(agent.promptErrors ?? undefined),
        ...getLatestError(agent.avatarErrors ?? undefined),
    };
    return getLatestError(mergedErrors);
}

function doesAgentHaveErrors(agent: OnyxEntry<Agent>): boolean {
    const agentErrors = getAgentErrors(agent);
    return Object.keys(agentErrors ?? {}).length > 0;
}

function hasAgentErrorsSelector(agents: OnyxCollection<Agent>): boolean {
    return Object.values(agents ?? {}).some(doesAgentHaveErrors);
}

function filterDeletedAgents(agents: OnyxCollection<Agent>, isOffline: boolean): OnyxCollection<Agent> {
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
}

function agentAccountIDsSelector(agents: OnyxCollection<Agent>): Set<number> {
    return new Set(Object.keys(agents ?? {}).map((key) => Number(key.slice(ONYXKEYS.COLLECTION.AGENT.length))));
}

export {getAgentErrors, doesAgentHaveErrors, hasAgentErrorsSelector, filterDeletedAgents, agentAccountIDsSelector};
