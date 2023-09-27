import {Middleware} from '../Request';

const handleUnusedOptimisticID: Middleware = (requestResponse, request) => requestResponse.then((response) => response);

export default handleUnusedOptimisticID;
