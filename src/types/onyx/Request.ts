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

export default Request;
export type {OnyxData, RequestType};
