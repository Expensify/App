import Log from '@libs/Log';
import type {PaginatedRequest} from '@src/types/onyx/Request';
import type Middleware from './types';

function isPaginatedRequest(request: Request | PaginatedRequest): request is PaginatedRequest {
    if (!('isPaginated' in request)) {
        return false;
    }
    return request.isPaginated;
}

const paginate: Middleware = (responsePromise, request: Request | PaginatedRequest) => {
    if (!isPaginatedRequest(request)) {
        return responsePromise;
    }
    return responsePromise.then((response) => {
        if (!response) {
            return;
        }

        Log.info('[API] Detected paginated request, executing pagination middleware.');
        const {getSortedItemsFromResponse} = request;
        const sortedItems = getSortedItemsFromResponse(response).map((value) => {
            // eslint-disable-next-line no-param-reassign
            value.isFromPagination = true;
            return value;
        });

        return sortedItems;
    });
};

export default paginate;
