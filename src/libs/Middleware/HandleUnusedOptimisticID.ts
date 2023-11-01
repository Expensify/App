import _ from 'lodash';
import deepReplaceKeysAndValues from '@libs/deepReplaceKeysAndValues';
import {Middleware} from '@libs/Request';
import * as PersistedRequests from '@userActions/PersistedRequests';
import ONYXKEYS from '@src/ONYXKEYS';
import Report from '@src/types/onyx/Report';

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
