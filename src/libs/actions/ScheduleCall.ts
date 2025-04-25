import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {GetGuideCallAvailabilityScheduleParams} from '@libs/API/parameters';
import {READ_COMMANDS} from '@libs/API/types';
import Navigation from '@libs/Navigation/Navigation';
import * as NetworkStore from '@libs/Network/NetworkStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, ScheduleCallDraft} from '@src/types/onyx';
import {openExternalLink} from './Link';

function getGuideCallAvailabilitySchedule(policyID: string | undefined, reportID: string, accountID: number, month?: number) {
    const authToken = NetworkStore.getAuthToken();

    if (!policyID || !authToken) {
        return;
    }

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`,
            value: {
                calendlySchedule: {
                    isLoading: true,
                    errors: null,
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`,
            value: {
                calendlySchedule: {
                    isLoading: false,
                    errors: null,
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`,
            value: {
                calendlySchedule: {
                    isLoading: false,
                },
            },
        },
    ];

    const params: GetGuideCallAvailabilityScheduleParams = {
        policyID,
        month,
        authToken,
        accountID,
        reportID,
    };

    API.read(READ_COMMANDS.GET_GUIDE_CALL_AVAILABILITY_SCHEDULE, params, {optimisticData, successData, failureData});
}

function saveBookingDraft(data: ScheduleCallDraft) {
    Onyx.merge(`${ONYXKEYS.SCHEDULE_CALL_DRAFT}`, data);
}

function clearBookingDraft() {
    Onyx.set(`${ONYXKEYS.SCHEDULE_CALL_DRAFT}`, null);
}

function confirmBooking(data: Required<ScheduleCallDraft>, currentUser: PersonalDetails) {
    const scheduleUrl = `${data.guide.scheduleUrl}?name=${encodeURIComponent(currentUser.displayName ?? '')}&email=${encodeURIComponent(
        currentUser?.login ?? '',
    )}&utm_source=newDot&utm_medium=report&utm_content=${data.reportID}&utm_campaign=91234ebaaffc89-SJC`;

    openExternalLink(scheduleUrl);
    clearBookingDraft();
    Navigation.dismissModal();
}
export {getGuideCallAvailabilitySchedule, saveBookingDraft, confirmBooking};
