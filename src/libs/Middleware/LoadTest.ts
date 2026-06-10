import type {OnyxKey} from 'react-native-onyx';
import {triggerDuplicates} from '@libs/Network/LoadTest';
import type Request from '@src/types/onyx/Request';
import type {PaginatedRequest} from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';
import type Middleware from './types';

const LoadTest: Middleware = <TKey extends OnyxKey>(response: Promise<Response<TKey> | void>, request: Request<TKey> | PaginatedRequest<TKey>): Promise<Response<TKey> | void> => {
    return response.finally(() => {
        try {
            triggerDuplicates(request);
        } catch {
            // Never let load-test issues affect real traffic.
        }
    });
};

export default LoadTest;
