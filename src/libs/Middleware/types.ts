import type {OnyxKey} from 'react-native-onyx';
import type Request from '@src/types/onyx/Request';
import type {PaginatedRequest} from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

type Middleware = <TKey extends OnyxKey>(
    response: Promise<Response<TKey> | void>,
    request: Request<TKey> | PaginatedRequest<TKey>,
    isFromSequentialQueue: boolean,
) => Promise<Response<TKey> | void>;

export default Middleware;
