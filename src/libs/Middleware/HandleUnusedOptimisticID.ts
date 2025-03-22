import clone from 'lodash/clone';
import deepReplaceKeysAndValues from '@libs/deepReplaceKeysAndValues';
import type {Middleware} from '@libs/Request';
import * as PersistedRequests from '@userActions/PersistedRequests';
import ONYXKEYS from '@src/ONYXKEYS';
import type Report from '@src/types/onyx/Report';

/**
 * This middleware checks for the presence of a field called preexistingReportID in the response.
 * If present, that means that the client passed an optimistic reportID with the request that the server did not use.
 * This can happen because there was already a report matching the parameters provided that the client didn't know about.
 * (i.e: a DM chat report with the same set of participants)
 *
 * If that happens, this middleware checks for any serialized network requests that reference the unused optimistic ID.
 * If it finds any, it replaces the unused optimistic ID with the "real ID" from the server.
 * That way these serialized requests function as expected rather than returning a 404.
 */
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
            const oldReportID = key.split(ONYXKEYS.COLLECTION.REPORT).at(-1) ?? request.data?.reportID;

            if (isFromSequentialQueue) {
                const ongoingRequest = PersistedRequests.getOngoingRequest();
                if (ongoingRequest && ongoingRequest.data?.reportID === oldReportID) {
                    const ongoingRequestClone = clone(ongoingRequest);
                    ongoingRequestClone.data = deepReplaceKeysAndValues(ongoingRequest.data, oldReportID as string, preexistingReportID);
                    PersistedRequests.updateOngoingRequest(ongoingRequestClone);
                }
            }

            PersistedRequests.getAll().forEach((persistedRequest, index) => {
                const persistedRequestClone = clone(persistedRequest);
                persistedRequestClone.data = deepReplaceKeysAndValues(persistedRequest.data, oldReportID as string, preexistingReportID);
                PersistedRequests.update(index, persistedRequestClone);
            });
        });
        return response;
    });

export default handleUnusedOptimisticID;
