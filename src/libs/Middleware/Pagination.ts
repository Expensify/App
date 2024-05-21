import Log from '@libs/Log';
import type Request from '@src/types/onyx/Request';
import type Middleware from './types';

const paginate: Middleware = (responsePromise, request: Request) => {
    if (!request.isPaginated) {
        return responsePromise;
    }
    Log.info('[API] Detected paginated request, executing pagination middleware.');
    return responsePromise;
};

export default paginate;
