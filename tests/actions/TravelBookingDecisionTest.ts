import {renderHook} from '@testing-library/react-native';

import useTravelBookingDecision from '@hooks/useTravelBookingDecision';

import {approveTravelBookings, rejectTravelBooking} from '@libs/actions/Travel';
import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import type {TripRoomData} from '@libs/TravelApprovalUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import type {BookingApproval} from '@src/types/onyx/ReportNameValuePairs';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/API');

const mockShowDecisionModal = jest.fn();
let mockIsOffline = false;
jest.mock('@hooks/useNetwork', () => () => ({isOffline: mockIsOffline}));
jest.mock('@hooks/useDecisionModal', () => () => ({showDecisionModal: mockShowDecisionModal}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (path: string) => path}));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => () => ({accountID: 1}));

const mockWrite = jest.mocked(API.write);

const APPROVER_ACCOUNT_ID = 1;
const TRIP_ROOM_ID = '100';
const SNAPSHOT_HASH = 42;
const HOTEL_PNR_ID = 'pnr-hotel';
const FLIGHT_PNR_ID = 'pnr-flight';

const reportNameValuePairsKey = `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${TRIP_ROOM_ID}` as const;
const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${TRIP_ROOM_ID}` as const;
const snapshotKey = `${ONYXKEYS.COLLECTION.SNAPSHOT}${SNAPSHOT_HASH}` as const;

function buildBooking(status: BookingApproval['status']): BookingApproval {
    return {status, approvalType: CONST.TRAVEL.BOOKING_APPROVAL.TYPE.SOFT, approvalID: 'approval', approverAccountIDs: [APPROVER_ACCOUNT_ID]};
}

const tripRoomReport: Report = {reportID: TRIP_ROOM_ID, hasOutstandingChildRequest: true};

function buildTripData(hotelStatus: BookingApproval['status'], flightStatus: BookingApproval['status']): NonNullable<TripRoomData> {
    return {
        tripID: 'trip',
        endDate: '2099-01-01',
        bookingApprovalState: {[HOTEL_PNR_ID]: buildBooking(hotelStatus), [FLIGHT_PNR_ID]: buildBooking(flightStatus)},
    };
}

/** Applies what the request would write, so the test reads Onyx the way the app does */
async function applyOnyxData(dataType: 'optimisticData' | 'successData' | 'failureData') {
    const onyxData = mockWrite.mock.calls.at(0)?.[2];
    await Onyx.update(onyxData?.[dataType] ?? []);
    await waitForBatchedUpdates();
}

async function setUpTrip(tripData: NonNullable<TripRoomData>) {
    await Onyx.set(reportNameValuePairsKey, {tripData});
    await Onyx.set(reportKey, tripRoomReport);
    await Onyx.merge(snapshotKey, {search: {hash: SNAPSHOT_HASH}, data: {[reportKey]: {...tripRoomReport, status: CONST.SEARCH.TRIP_STATUS.OUTSTANDING}}});
    await waitForBatchedUpdates();
}

describe('Travel booking decisions', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockWrite.mockClear();
        mockShowDecisionModal.mockClear();
        mockIsOffline = false;
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('shows an approval right away everywhere, then rolls it back with an error when it fails', async () => {
        // Given an approver with one outstanding booking left in the trip
        const tripData = buildTripData(CONST.TRAVEL.BOOKING_APPROVAL.STATUS.OUTSTANDING, CONST.TRAVEL.BOOKING_APPROVAL.STATUS.APPROVED);
        await setUpTrip(tripData);

        // When they approve it
        approveTravelBookings({tripRoomReport, tripData, currentUserAccountID: APPROVER_ACCOUNT_ID}, [HOTEL_PNR_ID]);
        await applyOnyxData('optimisticData');

        // Then only that booking is sent, and it shows approved and pending before the server answers
        expect(mockWrite).toHaveBeenCalledWith(WRITE_COMMANDS.APPROVE_TRAVEL_BOOKINGS, {reportID: TRIP_ROOM_ID, pnrIDs: [HOTEL_PNR_ID]}, expect.anything());
        let reportNameValuePairs = await getOnyxValue(reportNameValuePairsKey);
        expect(reportNameValuePairs?.tripData?.bookingApprovalState?.[HOTEL_PNR_ID]).toMatchObject({status: 'approved', pendingAction: 'update'});

        // And nothing waits on the approver anymore, so the green dot clears and the Spend row stops being outstanding
        expect((await getOnyxValue(reportKey))?.hasOutstandingChildRequest).toBe(false);
        let snapshot = await getOnyxValue(snapshotKey);
        expect(snapshot?.data?.[reportKey]).toMatchObject({status: CONST.SEARCH.TRIP_STATUS.UPCOMING});

        // When the server fails it
        await applyOnyxData('failureData');

        // Then the booking, the green dot and the Spend row go back to outstanding, with an error to dismiss
        reportNameValuePairs = await getOnyxValue(reportNameValuePairsKey);
        const hotelBooking = reportNameValuePairs?.tripData?.bookingApprovalState?.[HOTEL_PNR_ID];
        expect(hotelBooking?.status).toBe('outstanding');
        expect(hotelBooking?.pendingAction).toBeFalsy();
        expect(hotelBooking?.errors).toBeTruthy();
        expect((await getOnyxValue(reportKey))?.hasOutstandingChildRequest).toBe(true);
        snapshot = await getOnyxValue(snapshotKey);
        expect(snapshot?.data?.[reportKey]).toMatchObject({status: CONST.SEARCH.TRIP_STATUS.OUTSTANDING});
    });

    it('shows a rejection right away and keeps the green dot while another booking still waits on the approver', async () => {
        // Given an approver with two outstanding bookings
        const tripData = buildTripData(CONST.TRAVEL.BOOKING_APPROVAL.STATUS.OUTSTANDING, CONST.TRAVEL.BOOKING_APPROVAL.STATUS.OUTSTANDING);
        await setUpTrip(tripData);

        // When they reject one with a reason
        rejectTravelBooking({tripRoomReport, tripData, currentUserAccountID: APPROVER_ACCOUNT_ID}, HOTEL_PNR_ID, 'Too expensive');
        await applyOnyxData('optimisticData');

        // Then the rejection is sent with its reason and shows right away
        expect(mockWrite).toHaveBeenCalledWith(WRITE_COMMANDS.REJECT_TRAVEL_BOOKING, {reportID: TRIP_ROOM_ID, pnrID: HOTEL_PNR_ID, reason: 'Too expensive'}, expect.anything());
        const reportNameValuePairs = await getOnyxValue(reportNameValuePairsKey);
        expect(reportNameValuePairs?.tripData?.bookingApprovalState?.[HOTEL_PNR_ID]).toMatchObject({status: 'rejected', pendingAction: 'update'});

        // And the flight still waits on them, so the green dot and the outstanding Spend row stay
        expect((await getOnyxValue(reportKey))?.hasOutstandingChildRequest).toBe(true);
        const snapshot = await getOnyxValue(snapshotKey);
        expect(snapshot?.data?.[reportKey]).toMatchObject({status: CONST.SEARCH.TRIP_STATUS.OUTSTANDING});

        // When the server confirms
        await applyOnyxData('successData');

        // Then the booking stops showing as pending
        const confirmed = await getOnyxValue(reportNameValuePairsKey);
        expect(confirmed?.tripData?.bookingApprovalState?.[HOTEL_PNR_ID]?.pendingAction).toBeFalsy();
    });

    it('blocks Approve and Reject offline and shows the offline message instead of queuing them', async () => {
        // Given an approver who is offline, since a queued decision could reach Spotnana after the deadline decided the booking
        await setUpTrip(buildTripData(CONST.TRAVEL.BOOKING_APPROVAL.STATUS.OUTSTANDING, CONST.TRAVEL.BOOKING_APPROVAL.STATUS.OUTSTANDING));
        mockIsOffline = true;
        const {result} = renderHook(() => useTravelBookingDecision(tripRoomReport));

        // When they tap Approve and Reject
        result.current.approveBookings([HOTEL_PNR_ID, FLIGHT_PNR_ID]);
        result.current.rejectBooking(HOTEL_PNR_ID);

        // Then nothing is sent and the offline message shows each time
        expect(mockWrite).not.toHaveBeenCalled();
        expect(mockShowDecisionModal).toHaveBeenCalledTimes(2);
        expect(mockShowDecisionModal).toHaveBeenCalledWith(expect.objectContaining({title: 'common.youAppearToBeOffline'}));
    });

    it('sends the decision when online', async () => {
        // Given an approver who is online
        await setUpTrip(buildTripData(CONST.TRAVEL.BOOKING_APPROVAL.STATUS.OUTSTANDING, CONST.TRAVEL.BOOKING_APPROVAL.STATUS.OUTSTANDING));
        const {result} = renderHook(() => useTravelBookingDecision(tripRoomReport));
        await waitForBatchedUpdates();

        // When they tap Approve all
        result.current.approveBookings([HOTEL_PNR_ID, FLIGHT_PNR_ID]);

        // Then both bookings are sent and no offline message shows
        expect(mockWrite).toHaveBeenCalledWith(WRITE_COMMANDS.APPROVE_TRAVEL_BOOKINGS, {reportID: TRIP_ROOM_ID, pnrIDs: [HOTEL_PNR_ID, FLIGHT_PNR_ID]}, expect.anything());
        expect(mockShowDecisionModal).not.toHaveBeenCalled();
    });
});
