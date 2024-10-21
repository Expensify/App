import type {OnyxUpdate} from 'react-native-onyx';
import type Response from './Response';

/** Model of onyx requests sent to the API */
type OnyxData = {
    /** Onyx instructions that are executed after getting response from server with jsonCode === 200 */
    successData?: OnyxUpdate[];

    /** Onyx instructions that are executed after getting response from server with jsonCode !== 200 */
    failureData?: OnyxUpdate[];

    /** Onyx instructions that are executed after getting any response from server */
    finallyData?: OnyxUpdate[];

    /** Onyx instructions that are executed before request is made to the server */
    optimisticData?: OnyxUpdate[];
};

/** HTTP request method names */
type RequestType = 'get' | 'post';

/** Model of overall requests sent to the API */
type RequestData = {
    /** Name of the API command */
    command: string;

    /** Command name for logging purposes */
    commandName?: string;

    /** Additional parameters that can be sent with the request */
    data?: Record<string, unknown>;

    /** The HTTP request method name */
    type?: RequestType;

    /** Whether the app should connect to the secure API endpoints */
    shouldUseSecure?: boolean;

    /** Onyx instructions that are executed after getting response from server with jsonCode === 200 */
    successData?: OnyxUpdate[];

    /** Onyx instructions that are executed after getting response from server with jsonCode !== 200 */
    failureData?: OnyxUpdate[];

    /** Onyx instructions that are executed after getting any response from server */
    finallyData?: OnyxUpdate[];

    /** Promise resolve handler */
    resolve?: (value: Response) => void;

    /** Promise reject handler */
    reject?: (value?: unknown) => void;

    /** Whether the app should skip the web proxy to connect to API endpoints */
    shouldSkipWebProxy?: boolean;
};

/**
 * Model of a conflict request that has to be replaced in the request queue.
 */
type ConflictRequestReplace = {
    /**
     * The action to take in case of a conflict.
     */
    type: 'replace';

    /**
     * The index of the request in the queue to update.
     */
    index: number;
};

/**
 * Model of a conflict request that needs to be deleted from the request queue.
 */
type ConflictRequestDelete = {
    /**
     * The action to take in case of a conflict.
     */
    type: 'delete';

    /**
     * The indices of the requests in the queue that are to be deleted.
     */
    indices: number[];

    /**
     * A flag to mark if the new request should be pushed into the queue after deleting the conflicting requests.
     */
    pushNewRequest: boolean;
};

/**
 * Model of a conflict request that has to be enqueued at the end of request queue.
 */
type ConflictRequestPush = {
    /**
     * The action to take in case of a conflict.
     */
    type: 'push';
};

/**
 * Model of a conflict request that does not need to be updated or saved in the request queue.
 */
type ConflictRequestNoAction = {
    /**
     * The action to take in case of a conflict.
     */
    type: 'noAction';
};

/**
 * An object that has the request and the action to take in case of a conflict.
 */
type ConflictActionData = {
    /**
     * The action to take in case of a conflict.
     */
    conflictAction: ConflictRequestReplace | ConflictRequestDelete | ConflictRequestPush | ConflictRequestNoAction;
};

/**
 * An object that describes how a new write request can identify any queued requests that may conflict with or be undone by the new request,
 * and how to resolve those conflicts.
 */
type RequestConflictResolver = {
    /**
     * A function that checks if a new request conflicts with any existing requests in the queue.
     */
    checkAndFixConflictingRequest?: (persistedRequest: Request[]) => ConflictActionData;

    /**
     * A boolean flag to mark a request as persisting into Onyx, if set to true it means when Onyx loads
     * the ongoing request, it will be removed from the persisted request queue.
     */
    persistWhenOngoing?: boolean;
};

/** Model of requests sent to the API */
type Request = RequestData & OnyxData & RequestConflictResolver;

/**
 * An object used to describe how a request can be paginated.
 */
type PaginationConfig = {
    /**
     * The ID of the resource we're trying to paginate (i.e: the reportID in the case of paginating reportActions).
     */
    resourceID: string;

    /**
     * The ID used as a cursor/offset when making a paginated request.
     */
    cursorID?: string | null;
};

/**
 * A paginated request object.
 */
type PaginatedRequest = Request &
    PaginationConfig & {
        /**
         * A boolean flag to mark a request as Paginated.
         */
        isPaginated: true;
    };

export default Request;
export type {OnyxData, RequestType, PaginationConfig, PaginatedRequest, RequestConflictResolver, ConflictActionData};
