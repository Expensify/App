import {act, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import TripRoomPreview from '@components/ReportActionItem/TripRoomPreview';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Beta, Report, ReportAction} from '@src/types/onyx';
import type {BookingApproval} from '@src/types/onyx/ReportNameValuePairs';
import type {TripData} from '@src/types/onyx/TripData';

import React from 'react';
import Onyx from 'react-native-onyx';

import {airReservationPnrData, airReservationTravelers} from '../data/TripAirReservationData';
import createMock from '../utils/createMock';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

jest.mock('@react-navigation/native');

const TRIP_ROOM_ID = '7001';
const APPROVER_ACCOUNT_ID = 24680;
const TRAVELER_ACCOUNT_ID = 13579;
const OUTBOUND_PNR_ID = 'PNR12345';
const RETURN_PNR_ID = 'PNR67890';

// Two round-trip flights, so the trip has two bookings but four flight legs
const tripPayload = createMock<TripData>({
    pnrs: [
        {...airReservationPnrData, data: {...airReservationPnrData.data, pnrTravelers: airReservationTravelers}},
        {...airReservationPnrData, pnrId: RETURN_PNR_ID, data: {...airReservationPnrData.data, pnrTravelers: airReservationTravelers}},
    ],
});

const tripRoom = createMock<Report>({
    reportID: TRIP_ROOM_ID,
    reportName: 'Trip to Denver',
    type: CONST.REPORT.TYPE.CHAT,
    chatType: CONST.REPORT.CHAT_TYPE.TRIP_ROOM,
});

const tripPreviewAction = createMock<ReportAction>({
    reportActionID: '9001',
    actionName: CONST.REPORT.ACTIONS.TYPE.TRIP_PREVIEW,
    created: '2026-11-01 09:00:00.000',
    message: {linkedReportID: TRIP_ROOM_ID},
});

const outstandingBooking: BookingApproval = {
    status: CONST.TRAVEL.BOOKING_APPROVAL.STATUS.OUTSTANDING,
    approvalType: CONST.TRAVEL.BOOKING_APPROVAL.TYPE.SOFT,
    approvalID: 'approval-outbound',
    approverAccountIDs: [APPROVER_ACCOUNT_ID],
};

async function setUpTrip({accountID, betas, bookingApprovalState}: {accountID: number; betas: Beta[]; bookingApprovalState?: Record<string, BookingApproval>}) {
    await act(async () => {
        await Onyx.set(ONYXKEYS.SESSION, {accountID, email: `${accountID}@test.com`});
        await Onyx.set(ONYXKEYS.BETAS, betas);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${TRIP_ROOM_ID}`, tripRoom);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${TRIP_ROOM_ID}`, {tripData: {tripID: 'trip-denver', payload: tripPayload, bookingApprovalState}});
    });
    await waitForBatchedUpdatesWithAct();
}

function renderPreview() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, CurrentUserPersonalDetailsProvider, LocaleContextProvider, CurrencyListContextProvider]}>
            <TripRoomPreview action={tripPreviewAction} />
        </ComposeProviders>,
    );
}

describe('TripRoomPreview', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        wrapOnyxWithWaitForBatchedUpdates(Onyx);
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('counts bookings instead of flight legs with travel approval', async () => {
        // Given a trip with two round-trip flights, which is two bookings but four flight legs
        await setUpTrip({accountID: TRAVELER_ACCOUNT_ID, betas: [CONST.BETAS.TRAVEL_APPROVAL]});

        // When the workspace chat shows its preview
        renderPreview();
        await waitForBatchedUpdatesWithAct();

        // Then the header counts the two bookings, the unit approvers decide on
        expect(screen.getByText(/2 bookings/)).toBeOnTheScreen();
        expect(screen.queryByText(/4 trips/)).not.toBeOnTheScreen();
    });

    it('keeps counting flight legs without travel approval', async () => {
        // Given the same trip for a user without the travel approval beta
        await setUpTrip({accountID: TRAVELER_ACCOUNT_ID, betas: []});

        // When the workspace chat shows its preview
        renderPreview();
        await waitForBatchedUpdatesWithAct();

        // Then the preview stays as it was before the beta
        expect(screen.getByText(/4 trips/)).toBeOnTheScreen();
        expect(screen.getByText('View')).toBeOnTheScreen();
    });

    it('asks an approver to review an outstanding booking', async () => {
        // Given an outstanding booking the signed-in user approves
        await setUpTrip({accountID: APPROVER_ACCOUNT_ID, betas: [CONST.BETAS.TRAVEL_APPROVAL], bookingApprovalState: {[OUTBOUND_PNR_ID]: outstandingBooking}});

        // When the workspace chat shows its preview
        renderPreview();
        await waitForBatchedUpdatesWithAct();

        // Then the booking shows its badge and the button says Review, since there's a decision waiting on them
        expect(screen.getByText('Outstanding')).toBeOnTheScreen();
        expect(screen.getByText('Review')).toBeOnTheScreen();
        expect(screen.queryByText('View')).not.toBeOnTheScreen();
    });

    it('shows View to everyone else on the trip', async () => {
        // Given an outstanding booking someone else approves
        await setUpTrip({accountID: TRAVELER_ACCOUNT_ID, betas: [CONST.BETAS.TRAVEL_APPROVAL], bookingApprovalState: {[OUTBOUND_PNR_ID]: outstandingBooking}});

        // When the traveler sees the preview
        renderPreview();
        await waitForBatchedUpdatesWithAct();

        // Then they see the booking's status, but View, since there's nothing for them to decide
        expect(screen.getByText('Outstanding')).toBeOnTheScreen();
        expect(screen.getByText('View')).toBeOnTheScreen();
        expect(screen.queryByText('Review')).not.toBeOnTheScreen();
    });
});
