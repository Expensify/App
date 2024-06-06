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

type PaginationConfig<TResourceKey extends OnyxCollectionKey, TPageKey extends OnyxPagesKey> = {
    resourceCollectionKey: TResourceKey;
    resourceID: string;
    pageCollectionKey: TPageKey;
    sortItems: (items: OnyxValues[TResourceKey]) => Array<OnyxValues[TResourceKey] extends Record<string, infer TResource> ? TResource : never>;
    getItemID: (item: OnyxValues[TResourceKey] extends Record<string, infer TResource> ? TResource : never) => string;
    isInitialRequest: boolean;
};
type PaginatedRequest<TResourceKey extends OnyxCollectionKey, TPageKey extends OnyxPagesKey> = Request &
    PaginationConfig<TResourceKey, TPageKey> & {
        isPaginated: true;
    };

export default Request;
export type {OnyxData, RequestType, PaginationConfig, PaginatedRequest};
