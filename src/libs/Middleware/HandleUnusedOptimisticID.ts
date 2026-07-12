import {prepareOnyxDataForCleanUpOptimisticParticipants} from '@libs/actions/Report';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import deepReplaceKeysAndValues from '@libs/deepReplaceKeysAndValues';
import {getLoginByAccountID} from '@libs/PersonalDetailsUtils';
import type {Middleware} from '@libs/Request';

import * as PersistedRequests from '@userActions/PersistedRequests';

import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';
import type Report from '@src/types/onyx/Report';
import type {AnyOnyxUpdate} from '@src/types/onyx/Request';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';

import clone from 'lodash/clone';
import Onyx from 'react-native-onyx';

// Local cache of reportID to optimistic Onyx data
const reportOptimisticData = new Map<
    string,
    {settledPersonalDetails: OnyxEntry<PersonalDetailsList>; redundantParticipants: Record<number, null>; missingLoginParticipants: number[]; invitedEmails: string[]} | undefined
>();

function isRecord(value: unknown): value is Record<string, unknown> {
    return !!value && typeof value === 'object';
}

// Pairs the login invited via emailList with the one participant that has no login. Restores only the unambiguous 1:1 case.
function getRestoredPersonalDetails(
    responseOnyxData: AnyOnyxUpdate[],
    reportID: string,
    redundantParticipants: Record<number, null>,
    missingLoginParticipants: number[],
    invitedEmails: string[],
): PersonalDetailsList {
    const invitedEmail = invitedEmails.length === 1 ? invitedEmails.at(0) : undefined;
    if (!invitedEmail) {
        return {};
    }

    const settledParticipantIDs = new Set<string>();
    const missingLoginDetailIDs = new Set<string>();
    for (const update of responseOnyxData) {
        if (update.key === `${ONYXKEYS.COLLECTION.REPORT}${reportID}` && isRecord(update.value) && isRecord(update.value.participants)) {
            for (const accountID of Object.keys(update.value.participants)) {
                settledParticipantIDs.add(accountID);
            }
        }
        if (update.key === ONYXKEYS.PERSONAL_DETAILS_LIST && isRecord(update.value)) {
            for (const [accountID, detail] of Object.entries(update.value)) {
                if (!isRecord(detail) || detail.login) {
                    continue;
                }
                missingLoginDetailIDs.add(accountID);
            }
        }
    }

    for (const accountID of missingLoginParticipants) {
        settledParticipantIDs.add(String(accountID));
        missingLoginDetailIDs.add(String(accountID));
    }
    const candidates = [...settledParticipantIDs].filter((accountID) => missingLoginDetailIDs.has(accountID) && !(accountID in redundantParticipants));
    const settledAccountID = candidates.length === 1 ? Number(candidates.at(0)) : undefined;
    if (!settledAccountID) {
        return {};
    }
    return {[settledAccountID]: {accountID: settledAccountID, login: invitedEmail}};
}

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
            const cleanupData = prepareOnyxDataForCleanUpOptimisticParticipants(currentRequestReportID);
            const emailList = request.data?.emailList;
            const invitedEmails = typeof emailList === 'string' ? emailList.split(',').filter(Boolean) : [];
            reportOptimisticData.set(currentRequestReportID, cleanupData ? {...cleanupData, invitedEmails} : undefined);
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
            const {settledPersonalDetails, redundantParticipants, missingLoginParticipants, invitedEmails} = reportOptimisticData.get(currentRequestReportID) ?? {};
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

            // The cleanup above deletes the only record carrying the typed login, so restore it onto the settled participant
            const restoredPersonalDetails = getRestoredPersonalDetails(
                response.onyxData as AnyOnyxUpdate[],
                currentRequestReportID,
                redundantParticipants ?? {},
                missingLoginParticipants ?? [],
                invitedEmails ?? [],
            );
            if (!isEmptyObject(restoredPersonalDetails)) {
                (response.onyxData as AnyOnyxUpdate[]).push({
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                    value: restoredPersonalDetails,
                });
            }
        }
        // OpenPublicProfilePage can echo back an explicitly empty login for an account the client
        // already knows a login for; drop that so it can't blank out the value we already have.
        if (request?.command === READ_COMMANDS.OPEN_PUBLIC_PROFILE_PAGE) {
            for (const update of response?.onyxData ?? []) {
                if (update.key !== ONYXKEYS.PERSONAL_DETAILS_LIST || !isRecord(update.value)) {
                    continue;
                }
                for (const [accountID, detail] of Object.entries(update.value)) {
                    if (!isRecord(detail) || detail.login !== '' || !getLoginByAccountID(Number(accountID))) {
                        continue;
                    }
                    delete detail.login;
                }
            }
        }
        return response;
    });

export default handleUnusedOptimisticID;
