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
    getConflictingRequests?: (persistedRequests: Request[]) => Request[];
    shouldIncludeCurrentRequest?: boolean;
    handleConflictingRequest?: (persistedRequest: Request) => unknown;
};

type Request = RequestData & OnyxData & RequestConflictResolver;

export default Request;
export type {OnyxData, RequestType, RequestConflictResolver};
