/**
 * Cover/reveal contract of the Insights fetch hook once the Home tab sits under `ScreenActivityWrapper`:
 *   - the mount fetch fires once
 *   - a hide issues no fetch and a reveal re-fires the fetch exactly once, the request a tab focus fires today
 *   - a reconnect that happens behind the cover folds into that single reveal fetch
 *   - an unfocused screen never fetches
 *   - the chart data derived from the snapshot is the same after the reveal, before any new response arrives
 */
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useNetwork from '@hooks/useNetwork';

import {search} from '@libs/actions/Search';
import {getSuggestedSearches} from '@libs/SearchUIUtils';

import useInsightData, {INSIGHT_STATE} from '@pages/home/InsightsSection/useInsightData';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import type SearchResults from '@src/types/onyx/SearchResults';

import {useIsFocused} from '@react-navigation/native';
import React, {useEffect} from 'react';

import createMock from '../../utils/createMock';
import renderScreenWithCover, {getCoverMode} from '../../utils/ScreenCoverHarness';

const ACCOUNT_ID = 12345;

// Module mocks

jest.mock('@react-navigation/native', () => ({
    useIsFocused: jest.fn(() => true),
    createNavigationContainerRef: () => ({}),
}));

jest.mock('@libs/actions/Search', () => ({
    search: jest.fn(),
}));

jest.mock('@hooks/useNetwork', () => ({
    __esModule: true,
    default: jest.fn(() => ({isOffline: false})),
}));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: jest.fn(() => ({accountID: ACCOUNT_ID, login: `${ACCOUNT_ID}@test.com`})),
}));

const mockedUseIsFocused = jest.mocked(useIsFocused);
const mockedUseNetwork = jest.mocked(useNetwork);
const mockedUseCurrentUserPersonalDetails = jest.mocked(useCurrentUserPersonalDetails);
const mockedSearch = jest.mocked(search);

// useOnyx mock, applying the selector to seeded data the way the Home hook unit tests do.

const onyxData: Record<string, unknown> = {};

const mockUseOnyx = jest.fn((key: string, options?: {selector?: (value: unknown) => unknown}) => {
    const value = onyxData[key];
    const selected = options?.selector ? options.selector(value) : value;
    return [selected];
});

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: (key: string, options?: {selector?: (value: unknown) => unknown}) => mockUseOnyx(key, options),
}));

// The real Home config for the spend-over-time insight, so the hook fetches and reads the snapshot key production uses.
const spendOverTimeConfig = getSuggestedSearches(ACCOUNT_ID)[CONST.SEARCH.SEARCH_KEYS.SPEND_OVER_TIME];

/** Seeds a loaded month-grouped snapshot for the spend-over-time query, matching the request metadata `isSearchDataLoaded` checks. */
function setupSpendOverTimeSnapshot() {
    const queryJSON = spendOverTimeConfig.searchQueryJSON;
    onyxData[`${ONYXKEYS.COLLECTION.SNAPSHOT}${spendOverTimeConfig.hash}`] = createMock<SearchResults>({
        data: {
            personalDetailsList: {},
            [`${CONST.SEARCH.GROUP_PREFIX}2026_1` as const]: {year: 2026, month: 1, count: 5, currency: CONST.CURRENCY.USD, total: 250},
            [`${CONST.SEARCH.GROUP_PREFIX}2025_12` as const]: {year: 2025, month: 12, count: 3, currency: CONST.CURRENCY.USD, total: 75},
        },
        search: {
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            hash: spendOverTimeConfig.hash,
            sortBy: queryJSON?.sortBy,
            sortOrder: queryJSON?.sortOrder,
            offset: 0,
            hasMoreResults: false,
            hasResults: true,
            isLoading: false,
            state: CONST.SEARCH.SNAPSHOT_STATE.LOADED,
        },
    });
}

/** Records every settled result of the real hook, so a test can compare what it returned before a hide and after the reveal. */
let observedResults: Array<ReturnType<typeof useInsightData>> = [];

function InsightProbe() {
    const data = useInsightData(spendOverTimeConfig);

    useEffect(() => {
        observedResults.push(data);
    });

    return null;
}

function lastObserved() {
    return observedResults.at(-1);
}

beforeEach(() => {
    for (const key of Object.keys(onyxData)) {
        delete onyxData[key];
    }
    observedResults = [];
    mockUseOnyx.mockClear();
    mockedSearch.mockClear();
    mockedUseIsFocused.mockReturnValue(true);
    mockedUseNetwork.mockReturnValue({isOffline: false});
    mockedUseCurrentUserPersonalDetails.mockReturnValue(createMock<CurrentUserPersonalDetails>({accountID: ACCOUNT_ID, login: `${ACCOUNT_ID}@test.com`}));
});

describe('useInsightData under a screen cover', () => {
    it('fetches once on mount', () => {
        renderScreenWithCover(<InsightProbe />);

        expect(mockedSearch).toHaveBeenCalledTimes(1);
        expect(mockedSearch).toHaveBeenCalledWith(expect.objectContaining({queryJSON: expect.objectContaining({hash: spendOverTimeConfig.hash})}));
    });

    it('issues no fetch while hidden and re-fires the fetch once on reveal, as a tab focus does today', async () => {
        const screen = renderScreenWithCover(<InsightProbe />);

        await screen.hide();

        expect(mockedSearch).toHaveBeenCalledTimes(1);

        await screen.reveal();

        // Without the wrapper the effect dependencies are unchanged, so only a real `isFocused` flip re-fires today.
        expect(mockedSearch).toHaveBeenCalledTimes(getCoverMode() === 'activity' ? 2 : 1);
    });

    it('fetches once on reveal after a reconnect that happened behind the cover', async () => {
        mockedUseNetwork.mockReturnValue({isOffline: true});
        const screen = renderScreenWithCover(<InsightProbe />);

        expect(mockedSearch).not.toHaveBeenCalled();

        await screen.hide();
        mockedUseNetwork.mockReturnValue({isOffline: false});
        await screen.reveal();

        expect(mockedSearch).toHaveBeenCalledTimes(1);
    });

    it('holds back the fetch of a reconnect that re-renders behind the cover until the reveal', async () => {
        mockedUseNetwork.mockReturnValue({isOffline: true});
        const screen = renderScreenWithCover(<InsightProbe />);

        await screen.hide();
        mockedUseNetwork.mockReturnValue({isOffline: false});
        // A second hide re-renders the covered screen, which is what the navigator does while another tab is on top.
        await screen.hide();

        // The covered subtree has no mounted effect, so the dependency change cannot reach the network before the reveal.
        expect(mockedSearch).toHaveBeenCalledTimes(getCoverMode() === 'activity' ? 0 : 1);

        await screen.reveal();

        expect(mockedSearch).toHaveBeenCalledTimes(1);
    });

    it('never fetches while the screen is not focused', async () => {
        mockedUseIsFocused.mockReturnValue(false);
        const screen = renderScreenWithCover(<InsightProbe />);

        await screen.hide();
        await screen.reveal();

        expect(mockedSearch).not.toHaveBeenCalled();
    });

    it('returns the same chart data after the reveal, before any new response arrives', async () => {
        setupSpendOverTimeSnapshot();
        const screen = renderScreenWithCover(<InsightProbe />);

        const beforeHide = lastObserved();
        expect(beforeHide?.state).toBe(INSIGHT_STATE.READY);
        expect(beforeHide?.sortedData).toHaveLength(2);

        await screen.hide();
        await screen.reveal();

        const afterReveal = lastObserved();
        expect(afterReveal?.state).toBe(INSIGHT_STATE.READY);
        expect(afterReveal?.sortedData).toEqual(beforeHide?.sortedData);
    });
});
