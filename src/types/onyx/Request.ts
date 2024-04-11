import type {OnyxUpdate} from 'react-native-onyx';
import type Response from './Response';

type OnyxData = {
    successData?: OnyxUpdate[];
    failureData?: OnyxUpdate[];
    finallyData?: OnyxUpdate[];
    optimisticData?: OnyxUpdate[];
};

type RequestType = 'get' | 'post';

type RequestData = {
    command: string;
    commandName?: string;
    data?: Record<string, unknown>;
    type?: RequestType;
    shouldUseSecure?: boolean;
    successData?: OnyxUpdate[];
    failureData?: OnyxUpdate[];
    finallyData?: OnyxUpdate[];
    getConflictingRequests?: (persistedRequests: Request[]) => Request[];
    handleConflictingRequest?: (persistedRequest: Request) => unknown;
    resolve?: (value: Response) => void;
    reject?: (value?: unknown) => void;
};

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

type Request = RequestData & OnyxData & RequestConflictResolver;

export default Request;
export type {OnyxData, RequestType, RequestConflictResolver};
