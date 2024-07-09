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
type Request = RequestData & OnyxData;

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
export type {OnyxData, RequestType, PaginationConfig, PaginatedRequest};
