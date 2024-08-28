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

/** Model of requests sent to the API */
type Request = RequestData & OnyxData & RequestConflictResolver;

/**
 * Model of a conflict request that has to be updated, in the request queue.
 */
type ConflictRequestUpdate = {
    /**
     * The action to take in case of a conflict.
     */
    type: 'update';

    /**
     * The index of the request in the queue to update.
     */
    index: number;
};

/**
 * Model of a conflict request that has to be saved, in the request queue.
 */
type ConflictRequestSave = {
    /**
     * The action to take in case of a conflict.
     */
    type: 'save';
};

/**
 * An object that has the request and the action to take in case of a conflict.
 */
type ConflictActionData = {
    /**
     * The request that is conflicting with the new request.
     */
    request: Request;

    /**
     * The action to take in case of a conflict.
     */
    conflictAction: ConflictRequestUpdate | ConflictRequestSave;
};

/**
 * An object that describes how a new write request can identify any queued requests that may conflict with or be undone by the new request,
 * and how to resolve those conflicts.
 */
type RequestConflictResolver = {
    /**
     * A function that checks if a new request conflicts with any existing requests in the queue.
     */
    checkAndFixConflictingRequest?: (persistedRequest: Request[], request: Request) => ConflictActionData;
};

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
export type {OnyxData, RequestType, PaginationConfig, PaginatedRequest, RequestConflictResolver};
