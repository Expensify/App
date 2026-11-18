import {approveTravelBookings, rejectTravelBooking} from '@libs/actions/Travel';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import type ReportNameValuePairs from '@src/types/onyx/ReportNameValuePairs';

import type {OnyxEntry} from 'react-native-onyx';

import useAlertModals from './useAlertModals';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useDelegateAccountID from './useDelegateAccountID';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';

const tripDataSelector = (reportNameValuePairs: OnyxEntry<ReportNameValuePairs>) => reportNameValuePairs?.tripData;

/**
 * Approve and Reject for a trip room's bookings. Offline they show the Spend offline message and send nothing,
 * because Spotnana may approve or cancel the booking at its deadline before a queued decision would reach it.
 */
function useTravelBookingDecision(tripRoomReport: OnyxEntry<Report>) {
    const {isOffline} = useNetwork();
    const {showOfflineModal} = useAlertModals();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const delegateAccountID = useDelegateAccountID();
    const [tripData] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${tripRoomReport?.reportID}`, {selector: tripDataSelector});

    const approveBookings = (pnrIDs: string[]) => {
        if (isOffline) {
            showOfflineModal();
            return;
        }
        approveTravelBookings({tripRoomReport, tripData, currentUserAccountID}, pnrIDs);
    };

    const rejectBooking = (pnrID: string, reason?: string) => {
        if (isOffline) {
            showOfflineModal();
            return;
        }
        rejectTravelBooking({tripRoomReport, tripData, currentUserAccountID, delegateAccountID}, pnrID, reason);
    };

    return {approveBookings, rejectBooking};
}

export default useTravelBookingDecision;
