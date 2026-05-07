import type {AnyRequest} from '@src/types/onyx';

/**
 * Main queue state
 */
type MainQueueInfo = {
    /** Number of requests waiting to be launched */
    pendingRequestsCount: number;

    /** Types of requests in queue for debugging */
    queuedCommands?: string[];
};

type OngoingRequestInfo = Pick<AnyRequest, 'command' | 'persistWhenOngoing' | 'isRollback'>;

/**
 * Persisted requests state
 */
type PersistedRequestsInfo = {
    /** Number of requests waiting in persistent storage */
    queuedRequestsCount: number;

    /** Commands of queued requests for debugging */
    queuedCommands: string[];

    /** Currently ongoing request state */
    ongoingRequestInfo?: OngoingRequestInfo;
};

/**
 * Sequential queue state
 */
type SequentialQueueInfo = {
    /** Whether queue processing engine is actively running */
    isRunning: boolean;

    /** Whether processing is paused (e.g. due to data gaps/conflicts) */
    isPaused: boolean;
};

/**
 * Request control and failure state. Global state that affects both queue types.
 */
type LeaderInfo = {
    /** Whether this client is the leader */
    isClientLeader?: boolean;
};

/**
 * Request queues and processing state.
 */
type RequestQueuesInfo = {
    /** Main queue state */
    mainQueue: MainQueueInfo;

    /** Sequential queue state */
    sequentialQueue: SequentialQueueInfo;

    /** Persisted requests state */
    persistedRequests: PersistedRequestsInfo;

    /** Leader state affecting requests */
    leaderInfo: LeaderInfo;
};

export type {MainQueueInfo, PersistedRequestsInfo, SequentialQueueInfo, LeaderInfo, RequestQueuesInfo};
