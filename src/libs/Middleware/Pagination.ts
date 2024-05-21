import Log from '@libs/Log';
import type {PaginatedRequest} from '@src/types/onyx/Request';
import type Middleware from './types';

const paginate: Middleware = (response, request: PaginatedRequest) => {
    if (!request.isPaginated) {
        return response;
    }
    Log.info('[API] Detected paginated request, executing pagination middleware.');
};

export default paginate;
