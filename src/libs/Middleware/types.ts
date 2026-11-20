import type Request from '@src/types/onyx/Request';
import type {PaginatedRequest} from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

import type {OnyxKey} from 'react-native-onyx';

type Middleware = <TKey extends OnyxKey>(
    response: Promise<Response<TKey> | void>,
    request: Request<TKey> | PaginatedRequest<TKey>,
    isFromSequentialQueue: boolean,
) => Promise<Response<TKey> | void>;

/**
 * How the session changed between sending a request and handling its 407:
 * - unchanged: the request was sent with the current token, so the current session expired
 * - tokenReplaced: the same kind of session now has a newer token
 * - accountChanged: the request was sent for another account, such as before connecting as a copilot
 */
type SessionChange = 'unchanged' | 'tokenReplaced' | 'accountChanged';

export default Middleware;
export type {SessionChange};
