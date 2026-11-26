import {act, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {EMPTY_TRANSACTIONS_BY_REPORT_ID, SearchResultsContext} from '@components/Search/SearchContextDefinitions';
import type {SearchResultsContextValue} from '@components/Search/types';

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
    search: {type: CONST.SEARCH.DATA_TYPES.TRIP, offset: 0, hasMoreResults: false, hasResults: true, isLoading: false, state: CONST.SEARCH.SNAPSHOT_STATE.LOADED},
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

// The trip search answered, but the trip isn't in it any more
const emptyTripSearchResults = createMock<SearchResults>({
    search: {type: CONST.SEARCH.DATA_TYPES.TRIP, offset: 0, hasMoreResults: false, hasResults: false, isLoading: false, state: CONST.SEARCH.SNAPSHOT_STATE.LOADED},
    data: createMock<SearchResults['data']>({}),
});

// The trips table the summary was opened from, which still has the trip
const tableSearchResults = createMock<SearchResults>({
    ...tripSearchResults,
    data: createMock<SearchResults['data']>({
        ...tripSearchResults.data,
        [`${ONYXKEYS.COLLECTION.REPORT}${TRIP_ROOM_ID}` as const]: {
            reportID: TRIP_ROOM_ID,
            reportName: 'Trip to Denver from the table',
            type: CONST.REPORT.TYPE.CHAT,
            chatType: CONST.REPORT.CHAT_TYPE.TRIP_ROOM,
        },
    }),
});

function renderPage(currentSearchResults?: SearchResults) {
    const searchResultsContext: SearchResultsContextValue = {
        currentSearchResults,
        currentSearchTransactionsByReportID: EMPTY_TRANSACTIONS_BY_REPORT_ID,
        currentSearchViolations: CONST.EMPTY_OBJECT,
        approvalWorkflowRules: undefined,
        shouldUseLiveData: false,
        sortedReportIDs: CONST.EMPTY_ARRAY,
        shouldShowFiltersBarLoading: false,
        lastSearchType: undefined,
    };
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrencyListContextProvider]}>
            <SearchResultsContext.Provider value={searchResultsContext}>
                <ReadOnlyTripSummaryPage reportID={TRIP_ROOM_ID} />
            </SearchResultsContext.Provider>
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

    it('shows not found when the trip search answers without the trip, even if the table still has it', async () => {
        // Given the trip search for this trip answered with no trip, while the trips table it was opened from still lists it
        await act(async () => {
            await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.TRAVEL_APPROVAL]);
            await Onyx.set(`${ONYXKEYS.COLLECTION.SNAPSHOT}${tripQueryHash}`, emptyTripSearchResults);
        });

        // When the summary opens
        renderPage(tableSearchResults);
        await waitForBatchedUpdatesWithAct();

        // Then the fresh answer wins, so it doesn't show the table's stale trip and bookings
        expect(screen.queryByText('Trip summary')).not.toBeOnTheScreen();
        expect(screen.queryByText('Trip to Denver from the table')).not.toBeOnTheScreen();
        expect(screen.queryAllByText(/Denver Intl/)).toHaveLength(0);
    });

    it('shows the trip from the table while the trip search is still running', async () => {
        // Given the trip search for this trip hasn't answered yet, as when it was just sent or is queued offline
        await act(async () => {
            await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.TRAVEL_APPROVAL]);
            await Onyx.set(`${ONYXKEYS.COLLECTION.SNAPSHOT}${tripQueryHash}`, {
                ...emptyTripSearchResults,
                search: {...emptyTripSearchResults.search, state: CONST.SEARCH.SNAPSHOT_STATE.LOADING},
            });
        });

        // When the summary opens from the trips table
        renderPage(tableSearchResults);
        await waitForBatchedUpdatesWithAct();

        // Then it shows the table's trip and bookings instead of waiting
        expect(screen.getByText('Trip to Denver from the table')).toBeOnTheScreen();
        expect(screen.getByText('Trip summary')).toBeOnTheScreen();
        expect(screen.getAllByText(/Denver Intl/).length).toBeGreaterThan(0);
    });

    it('shows the trip from the table when the trip search fails', async () => {
        // Given the trip search for this trip failed, so its empty data says nothing about the trip
        await act(async () => {
            await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.TRAVEL_APPROVAL]);
            await Onyx.set(`${ONYXKEYS.COLLECTION.SNAPSHOT}${tripQueryHash}`, {
                ...emptyTripSearchResults,
                search: {...emptyTripSearchResults.search, responseJsonCode: CONST.JSON_CODE.EXP_ERROR},
            });
        });

        // When the summary opens from the trips table
        renderPage(tableSearchResults);
        await waitForBatchedUpdatesWithAct();

        // Then it keeps showing the table's trip rather than not found
        expect(screen.getByText('Trip to Denver from the table')).toBeOnTheScreen();
        expect(screen.getByText('Trip summary')).toBeOnTheScreen();
    });

    it('prefers the trip search over the table once it answers with the trip', async () => {
        // Given both the trip search and the table have the trip, with the table's copy older
        await act(async () => {
            await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.TRAVEL_APPROVAL]);
            await Onyx.set(`${ONYXKEYS.COLLECTION.SNAPSHOT}${tripQueryHash}`, tripSearchResults);
        });

        // When the summary opens from the trips table
        renderPage(tableSearchResults);
        await waitForBatchedUpdatesWithAct();

        // Then it shows the trip search's copy
        expect(screen.getByText('Trip to Denver')).toBeOnTheScreen();
        expect(screen.queryByText('Trip to Denver from the table')).not.toBeOnTheScreen();
    });

    it('prefers the table over a trip search saved on an earlier visit while the new one runs', async () => {
        // Given a trip search saved when the trip was opened before, now being rerun, and a newer copy of the trip in the table
        await act(async () => {
            await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.TRAVEL_APPROVAL]);
            await Onyx.set(`${ONYXKEYS.COLLECTION.SNAPSHOT}${tripQueryHash}`, {
                ...tripSearchResults,
                search: {...tripSearchResults.search, state: CONST.SEARCH.SNAPSHOT_STATE.LOADING},
            });
        });

        // When the summary opens from the trips table
        renderPage(tableSearchResults);
        await waitForBatchedUpdatesWithAct();

        // Then it shows the table's copy rather than the older saved one
        expect(screen.getByText('Trip to Denver from the table')).toBeOnTheScreen();
        expect(screen.queryByText('Trip to Denver')).not.toBeOnTheScreen();
    });

    it('prefers the table over a trip search saved on an earlier visit when the new one fails', async () => {
        // Given the rerun of a saved trip search failed, while the table has a newer copy of the trip
        await act(async () => {
            await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.TRAVEL_APPROVAL]);
            await Onyx.set(`${ONYXKEYS.COLLECTION.SNAPSHOT}${tripQueryHash}`, {
                ...tripSearchResults,
                search: {...tripSearchResults.search, responseJsonCode: CONST.JSON_CODE.EXP_ERROR},
            });
        });

        // When the summary opens from the trips table
        renderPage(tableSearchResults);
        await waitForBatchedUpdatesWithAct();

        // Then it keeps the table's copy
        expect(screen.getByText('Trip to Denver from the table')).toBeOnTheScreen();
        expect(screen.queryByText('Trip to Denver')).not.toBeOnTheScreen();
    });

    it('shows the saved trip search when there is no table to fall back on', async () => {
        // Given a saved trip search that is being rerun, and no trips table, as when the summary is opened from a link offline
        await act(async () => {
            await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.TRAVEL_APPROVAL]);
            await Onyx.set(`${ONYXKEYS.COLLECTION.SNAPSHOT}${tripQueryHash}`, {
                ...tripSearchResults,
                search: {...tripSearchResults.search, state: CONST.SEARCH.SNAPSHOT_STATE.LOADING},
            });
        });

        // When the summary opens
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then it shows the saved trip instead of a spinner or not found
        expect(screen.getByText('Trip to Denver')).toBeOnTheScreen();
        expect(screen.getByText('Trip summary')).toBeOnTheScreen();
    });
});
