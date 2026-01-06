import {getAll as getAllPersistedRequests, getOngoingRequest} from '@libs/actions/PersistedRequests';
import {isClientTheLeader} from '@libs/ActiveClientManager';
import {getAll as getMainQueueRequests} from '@libs/Network/MainQueue';
import {isPaused as isSequentialQueuePaused, isRunning as isSequentialQueueRunning} from '@libs/Network/SequentialQueue';
import type {LeaderInfo, MainQueueInfo, PersistedRequestsInfo, RequestQueuesInfo, SequentialQueueInfo} from './types';

/**
 * Captures current MainQueue state.
 */
function captureMainQueueState(): MainQueueInfo {
    const queuedRequests = getMainQueueRequests();

    return {
        pendingRequestsCount: queuedRequests.length,
        queuedCommands: queuedRequests.map((request) => request.command).filter(Boolean),
    };
}

/**
 * Captures current PersistedRequests state.
 */
function capturePersistedRequestsState(): PersistedRequestsInfo {
    const persistedRequests = getAllPersistedRequests();
    const ongoingRequest = getOngoingRequest();

    return {
        queuedRequestsCount: persistedRequests.length,
        queuedCommands: persistedRequests.map((request) => request.command).filter(Boolean),
        ongoingRequestInfo: ongoingRequest
            ? {
                  command: ongoingRequest.command,
                  persistWhenOngoing: ongoingRequest.persistWhenOngoing,
                  isRollback: ongoingRequest.isRollback,
              }
            : undefined,
    };
}

/**
 * Captures current SequentialQueue state.
 */
function captureSequentialQueueState(): SequentialQueueInfo {
    return {
        isRunning: isSequentialQueueRunning(),
        isPaused: isSequentialQueuePaused(),
    };
}

/**
 * Captures leader state (whether this client is the leader).
 */
function captureLeaderInfo(): LeaderInfo {
    return {
        isClientLeader: isClientTheLeader(),
    };
}

/**
 * Captures current requests queues state.
 */
function captureRequestsQueueState(): RequestQueuesInfo {
    return {
        mainQueue: captureMainQueueState(),
        sequentialQueue: captureSequentialQueueState(),
        persistedRequests: capturePersistedRequestsState(),
        leaderInfo: captureLeaderInfo(),
    };
}

export default captureRequestsQueueState;
export type {RequestQueuesInfo} from './types';
