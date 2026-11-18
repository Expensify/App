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
        expect(mockWrite).toHaveBeenCalledWith(WRITE_COMMANDS.APPROVE_TRAVEL_BOOKINGS, {reportID: TRIP_ROOM_ID, pnrIDs: JSON.stringify([HOTEL_PNR_ID])}, expect.anything());
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
        expect(mockWrite).toHaveBeenCalledWith(
            WRITE_COMMANDS.REJECT_TRAVEL_BOOKING,
            expect.objectContaining({reportID: TRIP_ROOM_ID, pnrID: HOTEL_PNR_ID, reason: 'Too expensive'}),
            expect.anything(),
        );
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

    it('shows the reject reason as a comment right away, under the ID the backend posts it with', async () => {
        // Given an approver with an outstanding hotel
        const tripData = buildTripData(CONST.TRAVEL.BOOKING_APPROVAL.STATUS.OUTSTANDING, CONST.TRAVEL.BOOKING_APPROVAL.STATUS.OUTSTANDING);
        await setUpTrip(tripData);
        const reportActionsKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${TRIP_ROOM_ID}` as const;

        // When they reject it with a reason
        rejectTravelBooking({tripRoomReport, tripData, currentUserAccountID: APPROVER_ACCOUNT_ID}, HOTEL_PNR_ID, 'Too expensive');
        await applyOnyxData('optimisticData');

        // Then the reason shows in the trip room as a pending comment with the ID that was sent, so the backend's comment replaces it
        const [reasonReportActionID = ''] = Object.keys((await getOnyxValue(reportActionsKey)) ?? {});
        expect(mockWrite).toHaveBeenCalledWith(WRITE_COMMANDS.REJECT_TRAVEL_BOOKING, expect.objectContaining({reasonReportActionID}), expect.anything());
        expect((await getOnyxValue(reportActionsKey))?.[reasonReportActionID]).toMatchObject({
            actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            message: [expect.objectContaining({text: 'Too expensive'})],
        });

        // When the rejection fails
        await applyOnyxData('failureData');

        // Then the comment goes away with it, since the booking is outstanding again
        expect((await getOnyxValue(reportActionsKey))?.[reasonReportActionID]).toBeUndefined();
    });

    it('adds no comment when the booking is rejected without a reason', async () => {
        // Given an approver with an outstanding hotel
        const tripData = buildTripData(CONST.TRAVEL.BOOKING_APPROVAL.STATUS.OUTSTANDING, CONST.TRAVEL.BOOKING_APPROVAL.STATUS.OUTSTANDING);
        await setUpTrip(tripData);

        // When they reject it without a reason
        rejectTravelBooking({tripRoomReport, tripData, currentUserAccountID: APPROVER_ACCOUNT_ID}, HOTEL_PNR_ID);
        await applyOnyxData('optimisticData');

        // Then nothing is posted, so no comment ID is sent and the trip room has no comment
        expect(mockWrite).toHaveBeenCalledWith(WRITE_COMMANDS.REJECT_TRAVEL_BOOKING, {reportID: TRIP_ROOM_ID, pnrID: HOTEL_PNR_ID}, expect.anything());
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${TRIP_ROOM_ID}`)).toBeUndefined();
    });

    it('puts the trip back to outstanding when the first of two back-to-back approvals fails', async () => {
        // Given an approver with two outstanding bookings
        await setUpTrip(buildTripData(CONST.TRAVEL.BOOKING_APPROVAL.STATUS.OUTSTANDING, CONST.TRAVEL.BOOKING_APPROVAL.STATUS.OUTSTANDING));

        // When they approve the hotel, then the flight before the hotel's request settles, reading the trip as the app would
        const hotelTripData = (await getOnyxValue(reportNameValuePairsKey))?.tripData;
        approveTravelBookings({tripRoomReport: await getOnyxValue(reportKey), tripData: hotelTripData, currentUserAccountID: APPROVER_ACCOUNT_ID}, [HOTEL_PNR_ID]);
        await Onyx.update(mockWrite.mock.calls.at(0)?.[2]?.optimisticData ?? []);
        await waitForBatchedUpdates();
        const flightTripData = (await getOnyxValue(reportNameValuePairsKey))?.tripData;
        approveTravelBookings({tripRoomReport: await getOnyxValue(reportKey), tripData: flightTripData, currentUserAccountID: APPROVER_ACCOUNT_ID}, [FLIGHT_PNR_ID]);
        await Onyx.update(mockWrite.mock.calls.at(1)?.[2]?.optimisticData ?? []);
        await waitForBatchedUpdates();

        // And the server fails the hotel, then confirms the flight, in the order the requests were sent
        await Onyx.update(mockWrite.mock.calls.at(0)?.[2]?.failureData ?? []);
        await Onyx.update(mockWrite.mock.calls.at(1)?.[2]?.successData ?? []);
        await waitForBatchedUpdates();

        // Then the hotel still waits on the approver, so the green dot and the outstanding Spend row come back
        expect((await getOnyxValue(reportNameValuePairsKey))?.tripData?.bookingApprovalState?.[HOTEL_PNR_ID]?.status).toBe('outstanding');
        expect((await getOnyxValue(reportKey))?.hasOutstandingChildRequest).toBe(true);
        expect((await getOnyxValue(snapshotKey))?.data?.[reportKey]).toMatchObject({status: CONST.SEARCH.TRIP_STATUS.OUTSTANDING});
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
        expect(mockWrite).toHaveBeenCalledWith(WRITE_COMMANDS.APPROVE_TRAVEL_BOOKINGS, {reportID: TRIP_ROOM_ID, pnrIDs: JSON.stringify([HOTEL_PNR_ID, FLIGHT_PNR_ID])}, expect.anything());
        expect(mockShowDecisionModal).not.toHaveBeenCalled();
    });
});
