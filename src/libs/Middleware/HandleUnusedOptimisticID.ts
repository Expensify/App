import ONYXKEYS from '../../ONYXKEYS';
import Report from '../../types/onyx/Report';
import {Middleware} from '../Request';
import * as PersistedRequests from '../actions/PersistedRequests';
import deepReplaceKeysAndValues from '../deepReplaceKeysAndValues';

const handleUnusedOptimisticID: Middleware = (requestResponse, request) =>
    requestResponse.then((response) => {
        const responseOnyxData = response?.onyxData;
        responseOnyxData.forEach((onyxData: {key: string; value: Record<string, unknown>}) => {
            const key = onyxData.key;
            if (!key.startsWith(ONYXKEYS.COLLECTION.REPORT)) {
                return;
            }

            if (!onyxData.value) {
                return;
            }

            const report: Report = onyxData.value as Report;
            if (!report.preexistingReportID) {
                return;
            }
            const preexistingReportID = report.preexistingReportID;
            const oldReportID = request.data?.reportID;
            PersistedRequests.getAll()
                .slice(1)
                .forEach((persistedRequest, index) => {
                    const oldRequest = persistedRequest;
                    oldRequest.data = deepReplaceKeysAndValues(oldRequest.data, oldReportID as string, preexistingReportID);
                    PersistedRequests.update(index, oldRequest);
                });
        });
        return response;
    });

export default handleUnusedOptimisticID;
