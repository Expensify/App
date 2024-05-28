import type {OnyxCollectionKey, OnyxPagesKey} from '@src/ONYXKEYS';
import type Request from '@src/types/onyx/Request';
import type {PaginatedRequest} from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

type Middleware = <TPaginatedResource = void, TResourceKey extends OnyxCollectionKey = OnyxCollectionKey, TPageKey extends OnyxPagesKey = OnyxPagesKey>(
    response: Promise<Response | void>,
    request: Request | PaginatedRequest<TPaginatedResource, TResourceKey, TPageKey>,
    isFromSequentialQueue: boolean,
) => Promise<Response | void>;

export default Middleware;
