// AppState implementation for global state snapshot logging
import {getAll as getAllPersistedRequests, getOngoingRequest} from '@libs/actions/PersistedRequests';
import {isClientTheLeader} from '@libs/ActiveClientManager';
import {getAll as getMainQueueRequests} from '@libs/Network/MainQueue';
import {getShouldFailAllRequests, isPaused as isSequentialQueuePaused, isRunning as isSequentialQueueRunning} from '@libs/Network/SequentialQueue';
import type {MainQueueInfo, PersistedRequestsInfo, RequestAuthInfo, RequestQueuesInfo, SequentialQueueControlInfo, SequentialQueueInfo} from './types';

/**
 * Captures current MainQueue state for debugging loading issues
 * MainQueue is a concurrent launcher for READ/SIDE_EFFECT requests
 */
function captureMainQueueState(): MainQueueInfo {
    const queuedRequests = getMainQueueRequests();

    return {
        pendingRequestsCount: queuedRequests.length,
        queuedCommands: queuedRequests.map((request) => request.command).filter(Boolean),
    };
}

/**
 * Captures current PersistedRequests data layer state
 * Tracks WRITE requests stored in Onyx for offline/retry capability
 */
function capturePersistedRequestsState(): PersistedRequestsInfo {
    const persistedRequests = getAllPersistedRequests();
    const ongoingRequest = getOngoingRequest();

    return {
        queuedRequestsCount: persistedRequests.length,
        queuedCommands: persistedRequests.map((request) => request.command).filter(Boolean),
        ongoingRequest: ongoingRequest
            ? {
                  command: ongoingRequest.command,
                  persistWhenOngoing: ongoingRequest.persistWhenOngoing,
              }
            : undefined,
    };
}

/**
 * Captures current SequentialQueue control layer state
 * Tracks processing state and execution flow
 */
function captureSequentialQueueControlState(): SequentialQueueControlInfo {
    return {
        isRunning: isSequentialQueueRunning(),
        isPaused: isSequentialQueuePaused(),
        currentExecution: determineCurrentExecution(),
    };
}

/**
 * Determines current execution state based on available information
 */
function determineCurrentExecution() {
    const isRunning = isSequentialQueueRunning();
    const ongoingRequest = getOngoingRequest();

    if (!isRunning || !ongoingRequest) {
        return undefined;
    }

    return {
        isRetry: ongoingRequest.isRollback ?? false, // Check if request is a rollback/retry
    };
}

/**
 * Captures complete SequentialQueue state - both data and control layers
 * Provides comprehensive view of WRITE request processing system
 */
function captureSequentialQueueState(): SequentialQueueInfo {
    return {
        persistedRequests: capturePersistedRequestsState(),
        processingControl: captureSequentialQueueControlState(),
    };
}

/**
 * Captures request authentication and failure state
 * Global state that affects both queue types (unique info only)
 */
function captureRequestAuthState(): RequestAuthInfo {
    return {
        shouldFailAllRequests: getShouldFailAllRequests(),
        isClientLeader: isClientTheLeader(),
    };
}

function captureRequestsQueueState(): RequestQueuesInfo {
    return {
        mainQueue: captureMainQueueState(),
        sequentialQueue: captureSequentialQueueState(),
        requestAuth: captureRequestAuthState(),
    };
}

export default captureRequestsQueueState;
export type {RequestQueuesInfo} from './types';
