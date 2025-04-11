import * as API from '@libs/API';
import type { GetGuideCallAvailabilityScheduleParams } from '@libs/API/parameters';
import { READ_COMMANDS } from '@libs/API/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type { PersonalDetails, ScheduleCallDraft } from '@src/types/onyx';
import Onyx from 'react-native-onyx';
import Navigation from '@libs/Navigation/Navigation';
import * as NetworkStore from '@libs/Network/NetworkStore';
import { openExternalLink } from './Link';


function getGuideCallAvailabilitySchedule(policyID: string | undefined, reportID: string, accountID: number, month: number) {
    const authToken = NetworkStore.getAuthToken();

    if (!policyID || !authToken) {
        return;
    }

    const params: GetGuideCallAvailabilityScheduleParams = {
        policyID,
        month,
        authToken,
        accountID,
        reportID,
    };

    API.read(READ_COMMANDS.GET_GUIDE_CALL_AVAILABILITY_SCHEDULE, params);
}

function saveBookingDraft(data: ScheduleCallDraft) {
    Onyx.merge(`${ONYXKEYS.SCHEDULE_CALL_DRAFT}`, data);
}

function clearBookingDraft() {
    Onyx.set(`${ONYXKEYS.SCHEDULE_CALL_DRAFT}`, null);
}

function confirmBooking(data: Required<ScheduleCallDraft>, currentUser: PersonalDetails){
    const scheduleUrl = `${data?.guide?.scheduleUrl}?name=${encodeURIComponent(currentUser.displayName ?? '')}&email=${encodeURIComponent(currentUser?.login ?? '')}&utm_source=newDot&utm_medium=report&utm_content=${data.reportID}&utm_campaign=91234ebaaffc89-SJC`;

    console.debug('data', data);

    openExternalLink(scheduleUrl);
    clearBookingDraft();
    Navigation.dismissModal();
}
export {getGuideCallAvailabilitySchedule, saveBookingDraft, confirmBooking};
