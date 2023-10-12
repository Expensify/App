import _ from 'lodash';
import ONYXKEYS from '../../ONYXKEYS';
import Report from '../../types/onyx/Report';
import {Middleware} from '../Request';
import * as PersistedRequests from '../actions/PersistedRequests';
import deepReplaceKeysAndValues from '../deepReplaceKeysAndValues';

const handleUnusedOptimisticID: Middleware = (requestResponse, request, isFromSequentialQueue) =>
    requestResponse.then((response) => {
        const responseOnyxData = response?.onyxData ?? [];
        responseOnyxData.forEach((onyxData) => {
            const key = onyxData.key;
            if (!key?.startsWith(ONYXKEYS.COLLECTION.REPORT)) {
                return;
            }

            if (!onyxData.value) {
                return;
            }

            const report: Report = onyxData.value as Report;
            const preexistingReportID = report.preexistingReportID;
            if (!preexistingReportID) {
                return;
            }
            const oldReportID = request.data?.reportID;
            const offset = isFromSequentialQueue ? 1 : 0;
            PersistedRequests.getAll()
                .slice(offset)
                .forEach((persistedRequest, index) => {
                    const persistedRequestClone = _.clone(persistedRequest);
                    persistedRequestClone.data = deepReplaceKeysAndValues(persistedRequest.data, oldReportID as string, preexistingReportID);
                    PersistedRequests.update(index + offset, persistedRequestClone);
                });
        });
        return response;
    });

export default handleUnusedOptimisticID;
