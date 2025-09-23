/**
 * Main queue state - concurrent request launcher
 * Launches READ/SIDE_EFFECT requests immediately in parallel
 */
type MainQueueInfo = {
    /** Number of requests waiting to be launched (delayed/queued) */
    pendingRequestsCount: number;

    /** Types of requests in queue for debugging */
    queuedCommands?: string[];
};

/**
 * Persisted requests data layer - request storage and persistence
 * Manages WRITE requests stored in Onyx for offline/retry capability
 */
type PersistedRequestsInfo = {
    /** Number of requests waiting in persistent storage */
    queuedRequestsCount: number;

    /** Commands of queued requests for debugging */
    queuedCommands: string[];

    /** Currently ongoing request (moved from queue, being processed) */
    ongoingRequest?: {
        /** API command being executed */
        command?: string;

        /** When request was originally created */
        timestamp?: string;

        /** Whether this request persists during processing */
        persistWhenOngoing?: boolean;
    };
};

/**
 * Sequential queue control layer - processing engine state
 * Controls execution flow and processing state of persistent requests
 */
type SequentialQueueControlInfo = {
    /** Whether queue processing engine is actively running */
    isRunning: boolean;

    /** Whether processing is paused (e.g. due to data gaps/conflicts) */
    isPaused: boolean;

    /** Current execution state */
    currentExecution?: {
        /** When current request execution started */
        startTime?: string;

        /** Whether execution is a retry after failure */
        isRetry?: boolean;
    };
};

/**
 * Combined sequential queue state - both data and control layers
 */
type SequentialQueueInfo = {
    /** Data layer - what requests are stored/queued */
    persistedRequests: PersistedRequestsInfo;

    /** Control layer - how processing is managed */
    processingControl: SequentialQueueControlInfo;
};

/**
 * Request authentication and failure state
 * Global state that affects both queue types (unique info only)
 */
type RequestAuthInfo = {
    /** Whether all requests should fail (emergency brake) */
    shouldFailAllRequests?: boolean;

    /** Whether this client is the leader (affects SequentialQueue) */
    isClientLeader?: boolean;
};

/**
 * Request queues and processing state - CRITICAL for debugging loading issues
 */
type RequestQueuesInfo = {
    /** Main queue (immediate requests) */
    mainQueue: MainQueueInfo;

    /** Sequential queue (persisted requests) */
    sequentialQueue: SequentialQueueInfo;

    /** Authentication state affecting requests */
    requestAuth: RequestAuthInfo;
};

export type {MainQueueInfo, PersistedRequestsInfo, SequentialQueueControlInfo, SequentialQueueInfo, RequestAuthInfo, RequestQueuesInfo};
