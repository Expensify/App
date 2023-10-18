import Request from '../../types/onyx/Request';
import Response from '../../types/onyx/Response';

type Middleware = (response: Promise<Response | void>, request: Request, isFromSequentialQueue: boolean) => Promise<Response | void>;

export default Middleware;
