import {Middleware} from '../Request';

const handleUnusedOptimisticID: Middleware = (requestResponse, request) =>
    requestResponse.then((response) => {
        if (!response) {
            return response;
        }
    });

export default handleUnusedOptimisticID;
