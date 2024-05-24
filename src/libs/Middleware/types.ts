import type Request from '@src/types/onyx/Request';
import type {PaginatedRequest} from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

type Middleware = <TPaginatedResource = void>(
    response: Promise<Response | void>,
    request: Request | PaginatedRequest<TPaginatedResource>,
    isFromSequentialQueue: boolean,
) => Promise<Response | void>;

export default Middleware;
