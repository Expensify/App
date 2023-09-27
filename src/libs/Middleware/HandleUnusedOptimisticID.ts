import {Middleware} from '../Request';
import * as PersistedRequests from '../actions/PersistedRequests';
import deepReplaceKeysAndValues from '../deepReplaceKeysAndValues';

const handleUnusedOptimisticID: Middleware = (requestResponse, request) =>
    requestResponse.then((response) => {
        if (response && typeof response === 'object' && 'preexistingReportID' in response) {
            const oldReportID = request.data?.reportID;
            PersistedRequests.getAll().forEach((persistedRequest, index) => {
                // eslint-disable-next-line no-param-reassign
                persistedRequest.data = deepReplaceKeysAndValues(persistedRequest.data, oldReportID as string, response.preexistingReportID as string);
                PersistedRequests.update(index, persistedRequest);
            });
        }
        return response;
    });

export default handleUnusedOptimisticID;
