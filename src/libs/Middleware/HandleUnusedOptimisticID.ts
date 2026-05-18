import clone from 'lodash/clone';
import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import {prepareOnyxDataForCleanUpOptimisticParticipants} from '@libs/actions/Report';
import {WRITE_COMMANDS} from '@libs/API/types';
import deepReplaceKeysAndValues from '@libs/deepReplaceKeysAndValues';
import type {Middleware} from '@libs/Request';
import * as PersistedRequests from '@userActions/PersistedRequests';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';
import type Report from '@src/types/onyx/Report';
import type {AnyOnyxUpdate} from '@src/types/onyx/Request';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

// Local cache of reportID to optimistic Onyx data
const reportOptimisticData = new Map<string, {settledPersonalDetails: OnyxEntry<PersonalDetailsList>; redundantParticipants: Record<number, null>} | undefined>();

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
        const currentRequestReportID = request?.data?.reportID as string;
        const isCreatingNewReport = request?.command === WRITE_COMMANDS.OPEN_REPORT && !!request?.data?.createdReportActionID && !!currentRequestReportID;
        if (isCreatingNewReport) {
            // We're opening a new report, which can be a new or preexisting report
            // For new report, clean up optimistic data after this request returned successfully
            // For report redirect a preexisting report, clean up optimistic data after the request of preexisting report returned successfully
            reportOptimisticData.set(currentRequestReportID, prepareOnyxDataForCleanUpOptimisticParticipants(currentRequestReportID));
        }

        const responseOnyxData = response?.onyxData ?? [];
        for (const onyxData of responseOnyxData) {
            const key = onyxData.key;
            if (!key?.startsWith(ONYXKEYS.COLLECTION.REPORT)) {
                continue;
            }

            if (!onyxData.value) {
                continue;
            }

            const report: Report = onyxData.value as Report;
            const preexistingReportID = report.preexistingReportID;
            if (!preexistingReportID) {
                continue;
            }
            const oldReportID = key.split(ONYXKEYS.COLLECTION.REPORT).at(-1) ?? request.data?.reportID ?? request.data?.optimisticReportID;

            if (isCreatingNewReport && currentRequestReportID === oldReportID) {
                // move optimistic data to preexisting reportID, so it'll be cleaned up after preexisting report is returned successfully
                reportOptimisticData.set(preexistingReportID, reportOptimisticData.get(currentRequestReportID));
                reportOptimisticData.delete(currentRequestReportID);
            }

            if (isFromSequentialQueue) {
                const ongoingRequest = PersistedRequests.getOngoingRequest();
                const ongoingRequestReportIDParam = ongoingRequest?.data?.reportID ?? ongoingRequest?.data?.optimisticReportID;
                if (ongoingRequest && ongoingRequestReportIDParam === oldReportID) {
                    const ongoingRequestClone = clone(ongoingRequest);
                    ongoingRequestClone.data = deepReplaceKeysAndValues(ongoingRequest.data, oldReportID as string, preexistingReportID);
                    PersistedRequests.updateOngoingRequest(ongoingRequestClone);
                }
            }

            for (const [index, persistedRequest] of PersistedRequests.getAll().entries()) {
                const persistedRequestClone = clone(persistedRequest);
                persistedRequestClone.data = deepReplaceKeysAndValues(persistedRequest.data, oldReportID as string, preexistingReportID);
                PersistedRequests.update(index, persistedRequestClone);
            }
        }

        if (!!currentRequestReportID && request?.command === WRITE_COMMANDS.OPEN_REPORT && !!response?.onyxData && reportOptimisticData.has(currentRequestReportID)) {
            const {settledPersonalDetails, redundantParticipants} = reportOptimisticData.get(currentRequestReportID) ?? {};
            reportOptimisticData.delete(currentRequestReportID);
            if (!isEmptyObject(settledPersonalDetails) && !isEmptyObject(redundantParticipants)) {
                (response.onyxData as AnyOnyxUpdate[]).push(
                    {
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: `${ONYXKEYS.COLLECTION.REPORT}${currentRequestReportID}`,
                        value: {
                            participants: redundantParticipants,
                        },
                    },
                    {
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                        value: redundantParticipants,
                    },
                );
            }
        }
        return response;
    });

export default handleUnusedOptimisticID;
