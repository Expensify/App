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
 * An object that describes how a new write request can identify any queued requests that may conflict with or be undone by the new request,
 * whether the new request should be sent in the event of the new conflict, and what to do with the conflicting requests.
 */
type RequestConflictResolver = {
    /**
     * A callback that's provided with all the currently serialized functions in the sequential queue.
     * Should return a subset of the requests passed in that conflict with the new request.
     * Any conflicting requests will be cancelled and removed from the queue.
     *
     * @example - In ReconnectApp, you'd only want to have one instance of that command serialized to run on reconnect. The callback for that might look like this:
     * (persistedRequests) => persistedRequests.filter((request) => request.command === 'ReconnectApp')
     * */
    getConflictingRequests?: (persistedRequests: Request[]) => Request[];

    /**
     * If other conflicting requests are found, should the new request still happen?
     * This is useful if the new request and an existing request cancel each other out completely.
     *
     * @example - In DeleteComment, if you're deleting an optimistic comment, you'd want to cancel the optimistic AddComment call AND the DeleteComment call.
     *            In this case you'd want shouldSkipThisRequestOnConflict to return true
     *
     * @example - If multiple OpenReport commands are queued for the same report offline (and none of them are creating the report optimistically),
     *            then you'd want to cancel the other OpenReport commands and keep only the last one.
     *            In this case, you'd want shouldSkipThisRequestOnConflict to return false
     * */
    shouldSkipThisRequestOnConflict?: () => boolean;

    /**
     * Callback to handle a single conflicting request.
     * This is useful if you need to clean up some optimistic data for a request that was queue but never sent.
     * In these cases the optimisticData will be applied immediately, but the successData, failureData, and/or finallyData will never be applied unless you do it manually in this callback.
     */
    handleConflictingRequest?: (persistedRequest: Request) => unknown;
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
export type {OnyxData, RequestType, PaginationConfig, PaginatedRequest, RequestConflictResolver};
