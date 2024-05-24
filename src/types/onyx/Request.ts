import type {OnyxUpdate} from 'react-native-onyx';
import type {OnyxKey} from '@src/ONYXKEYS';
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
    resolve?: (value: Response) => void;
    reject?: (value?: unknown) => void;
    shouldSkipWebProxy?: boolean;
};

type PaginatedRequestData<TResource, TPageKey extends OnyxKey> = {
    isPaginated: true;
    pageKey: TPageKey;
    getItemsFromResponse: (response: Response) => Record<string, TResource>;
    sortItems: (items: Record<string, TResource>) => TResource[];
    getItemID: (item: TResource) => string;
    isInitialRequest: boolean;
};

type Request = RequestData & OnyxData;
type PaginatedRequest<TResource> = Request & PaginatedRequestData<TResource>;

export default Request;
export type {OnyxData, RequestType, PaginatedRequest};
