import type {OnyxUpdate} from 'react-native-onyx';
import type {OnyxCollectionKey, OnyxPagesKey, OnyxValues} from '@src/ONYXKEYS';
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

type Request = RequestData & OnyxData;

type PaginationConfig<TResource, TResourceKey extends OnyxCollectionKey = OnyxCollectionKey, TPageKey extends OnyxPagesKey = OnyxPagesKey> = {
    resourceKey: TResourceKey;
    pageKey: TPageKey;
    getItemsFromResponse: (response: Response) => OnyxValues[TResourceKey];
    sortItems: (items: OnyxValues[TResourceKey]) => TResource[];
    getItemID: (item: TResource) => string;
    isInitialRequest: boolean;
};
type PaginatedRequest<TResource, TResourceKey extends OnyxCollectionKey = OnyxCollectionKey, TPageKey extends OnyxPagesKey = OnyxPagesKey> = Request &
    PaginationConfig<TResource, TResourceKey, TPageKey> & {
        isPaginated: true;
    };

export default Request;
export type {OnyxData, RequestType, PaginationConfig, PaginatedRequest};
