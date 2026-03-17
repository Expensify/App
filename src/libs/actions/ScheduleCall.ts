import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {GetGuideCallAvailabilityScheduleParams, SendScheduleCallNudgeParams} from '@libs/API/parameters';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, ScheduleCallDraft} from '@src/types/onyx';
import type {SelectedTimezone} from '@src/types/onyx/PersonalDetails';
import type {CalendlyCall} from '@src/types/onyx/ReportNameValuePairs';
import {openExternalLink} from './Link';

function getGuideCallAvailabilitySchedule(reportID: string) {
    if (!reportID) {
        return;
    }

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS>> = [
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

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS>> = [
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

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS>> = [
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

function confirmBooking(data: Required<ScheduleCallDraft>, currentUser: PersonalDetails, timezone?: SelectedTimezone) {
    const scheduleURL = `${data.guide.scheduleURL}?name=${encodeURIComponent(currentUser.displayName ?? '')}&email=${encodeURIComponent(
        currentUser?.login ?? '',
    )}&utm_source=newDot&utm_medium=report&utm_content=${data.reportID}&timezone=${timezone}`;

    openExternalLink(scheduleURL);
    clearBookingDraft();
    Navigation.dismissModal();
}

function getEventIDFromURI(eventURI: string) {
    const parts = eventURI.split('/');
    // Last path in the URI is ID
    return parts.slice(-1).at(0);
}

function rescheduleBooking(call: CalendlyCall) {
    const rescheduleURL = `https://calendly.com/reschedulings/${getEventIDFromURI(call.eventURI)}`;
    openExternalLink(rescheduleURL);
}

function cancelBooking(call: CalendlyCall) {
    const cancelURL = `https://calendly.com/cancellations/${getEventIDFromURI(call.eventURI)}`;
    openExternalLink(cancelURL);
}

function sendScheduleCallNudge(accountID: number, reportID: string) {
    const params: SendScheduleCallNudgeParams = {
        accountID,
        reportID,
    };
    API.write(WRITE_COMMANDS.SEND_SCHEDULE_CALL_NUDGE, params);
}

export {getGuideCallAvailabilitySchedule, saveBookingDraft, clearBookingDraft, confirmBooking, rescheduleBooking, cancelBooking, sendScheduleCallNudge};
