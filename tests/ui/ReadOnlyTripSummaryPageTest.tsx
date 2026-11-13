import {act, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import type * as SearchActionsModule from '@libs/actions/Search';
import {search} from '@libs/actions/Search';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import ReadOnlyTripSummaryPage from '@pages/inbox/ReadOnlyTripSummaryPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults} from '@src/types/onyx';
import type {TripData} from '@src/types/onyx/TripData';

import React from 'react';
import Onyx from 'react-native-onyx';

import {airReservationPnrData, airReservationTravelers} from '../data/TripAirReservationData';
import createMock from '../utils/createMock';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

type SearchActions = typeof SearchActionsModule;

jest.mock('@react-navigation/native');
jest.mock('@libs/actions/Search', () => ({
    ...jest.requireActual<SearchActions>('@libs/actions/Search'),
    search: jest.fn(),
}));
jest.mock('@hooks/useScreenWrapperTransitionStatus', () => ({
    __esModule: true,
    default: () => ({didScreenTransitionEnd: true}),
}));

const TRIP_ROOM_ID = '7001';

const tripPayload = createMock<TripData>({
    pnrs: [{...airReservationPnrData, data: {...airReservationPnrData.data, pnrTravelers: airReservationTravelers}}],
});

const tripQueryHash = buildSearchQueryJSON(`type:trip reportID:${TRIP_ROOM_ID}`)?.hash;

// Shaped like the trip search response for a trip the admin isn't in: the room and its tripData, and nothing in the admin's own reports
const tripSearchResults = createMock<SearchResults>({
    search: {type: CONST.SEARCH.DATA_TYPES.TRIP, offset: 0, hasMoreResults: false, hasResults: true, isLoading: false},
    data: createMock<SearchResults['data']>({
        [`${ONYXKEYS.COLLECTION.REPORT}${TRIP_ROOM_ID}` as const]: {
            reportID: TRIP_ROOM_ID,
            reportName: 'Trip to Denver',
            type: CONST.REPORT.TYPE.CHAT,
            chatType: CONST.REPORT.CHAT_TYPE.TRIP_ROOM,
        },
        [`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${TRIP_ROOM_ID}` as const]: {tripData: {tripID: 'trip-denver', payload: tripPayload}},
    }),
});

function renderPage() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrencyListContextProvider]}>
            <ReadOnlyTripSummaryPage reportID={TRIP_ROOM_ID} />
        </ComposeProviders>,
    );
}

describe('ReadOnlyTripSummaryPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        jest.clearAllMocks();
        wrapOnyxWithWaitForBatchedUpdates(Onyx);
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('shows the trip bookings to an admin outside the trip room without linking into it', async () => {
        // Given an admin with the travel approval beta, and a trip search for one trip in their workspace that they aren't in
        await act(async () => {
            await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.TRAVEL_APPROVAL]);
            await Onyx.set(`${ONYXKEYS.COLLECTION.SNAPSHOT}${tripQueryHash}`, tripSearchResults);
        });

        // When the summary opens
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then it refreshes that trip with a reportID trip search, so the bookings aren't stale
        expect(search).toHaveBeenCalledWith(expect.objectContaining({queryJSON: expect.objectContaining({hash: tripQueryHash}), shouldReturnTripRooms: true}));

        // And it shows the trip and its booking from the search results, since the admin has no trip room data of their own
        expect(screen.getByText('Trip to Denver')).toBeOnTheScreen();
        expect(screen.getByText('Trip summary')).toBeOnTheScreen();
        expect(screen.getAllByText(/Denver Intl/).length).toBeGreaterThan(0);

        // And its bookings aren't buttons, because the booking details live in the trip room the admin can't open
        expect(screen.queryByRole('button', {name: /Denver Intl/})).not.toBeOnTheScreen();
    });

    it('is not found without the travel approval beta', async () => {
        // Given the same trip search for a user without the beta, who has no trip rows to open it from
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.SNAPSHOT}${tripQueryHash}`, tripSearchResults);
        });

        // When the summary is opened from a link
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then it shows not found and doesn't search
        expect(screen.queryByText('Trip summary')).not.toBeOnTheScreen();
        expect(search).not.toHaveBeenCalled();
    });
});
