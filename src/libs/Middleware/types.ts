import type Request from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

type Middleware = (response: Promise<Response | void>, request: Request, isFromSequentialQueue: boolean) => Promise<Response | void>;

export default Middleware;
