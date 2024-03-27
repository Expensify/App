import type {OnyxUpdate} from 'react-native-onyx';
import type {RequireAllOrNone} from 'type-fest';
import type Response from './Response';

type OnyxData = {
    successData?: OnyxUpdate[];
    failureData?: OnyxUpdate[];
    finallyData?: OnyxUpdate[];
    optimisticData?: OnyxUpdate[];
};

type RequestType = 'get' | 'post';

type RequestData = RequireAllOrNone<
    {
        command: string;
        commandName?: string;
        data?: Record<string, unknown>;
        type?: RequestType;
        shouldUseSecure?: boolean;
        successData?: OnyxUpdate[];
        failureData?: OnyxUpdate[];
        finallyData?: OnyxUpdate[];
        idempotencyKey?: string;

        getConflictingRequests: (persistedRequests: Request[]) => Request[];
        handleConflictingRequest: (persistedRequest: Request) => void;

        resolve?: (value: Response) => void;
        reject?: (value?: unknown) => void;
    },
    'getConflictingRequests' | 'handleConflictingRequest'
>;

type Request = RequestData & OnyxData;

export default Request;
export type {OnyxData, RequestType};
