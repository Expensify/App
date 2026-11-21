import {render, screen} from '@testing-library/react-native';

import SearchPageHeaderCommon from '@components/Search/SearchPageHeader/SearchPageHeaderCommon';

import CONST from '@src/CONST';

import React from 'react';

let mockShouldUseFlatNavigationBar = true;
let mockIsOffline = false;
let mockIsSearchLoading = false;
let mockAreReportRequestsInFlight = false;

jest.mock('@components/Navigation/FlatNavigationBar/useShouldUseFlatNavigationBar', () => () => mockShouldUseFlatNavigationBar);
jest.mock('@hooks/useNetwork', () => () => ({isOffline: mockIsOffline}));
jest.mock('@hooks/useInFlightRequests', () => ({useLoadingBarVisibility: () => mockAreReportRequestsInFlight}));
jest.mock('@hooks/useActiveSavedSearch', () => () => undefined);
jest.mock('@hooks/useLocalize', () => () => ({translate: (path: string) => path}));
jest.mock('@components/Search/SearchContext', () => ({
    useSearchQueryContext: () => ({currentSearchKey: undefined, suggestedSearches: {}}),
    useSearchResultsContext: () => ({currentSearchResults: {search: {isLoading: mockIsSearchLoading}}}),
}));
jest.mock('@components/Navigation/TopBar', () => {
    // The factory is hoisted above the imports, so it loads what it renders itself.
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
    const {Text: MockText} = require('react-native');
    return ({shouldShowLoadingBar}: {shouldShowLoadingBar?: boolean}) => <MockText>{shouldShowLoadingBar ? 'Loading bar shown' : 'Loading bar hidden'}</MockText>;
});

function renderHeader() {
    return render(<SearchPageHeaderCommon queryJSONType={CONST.SEARCH.DATA_TYPES.EXPENSE} />);
}

describe('SearchPageHeaderCommon loading bar', () => {
    beforeEach(() => {
        mockShouldUseFlatNavigationBar = true;
        mockIsOffline = false;
        mockIsSearchLoading = false;
        mockAreReportRequestsInFlight = false;
    });

    it('leaves the loading bar to the Spend column for users outside the flat nav beta', () => {
        // Given a user outside the flat nav beta, whose Spend column already draws the bar, and a loading search
        mockShouldUseFlatNavigationBar = false;
        mockIsSearchLoading = true;

        // When the header renders
        renderHeader();

        // Then the header draws no bar of its own, so the page does not show two
        expect(screen.getByText('Loading bar hidden')).toBeTruthy();
    });

    it('shows the bar while the current search loads online', () => {
        // Given a flat nav user whose search is loading online
        mockIsSearchLoading = true;

        // When the header renders
        renderHeader();

        // Then the header draws the bar the Spend column used to draw
        expect(screen.getByText('Loading bar shown')).toBeTruthy();
    });

    it('keeps the bar hidden for a loading search while offline', () => {
        // Given an offline flat nav user, whose search cannot finish loading until they reconnect
        mockIsOffline = true;
        mockIsSearchLoading = true;

        // When the header renders
        renderHeader();

        // Then the bar stays hidden, so it does not spin with nothing to wait for
        expect(screen.getByText('Loading bar hidden')).toBeTruthy();
    });

    it('shows the bar while report requests are in flight', () => {
        // Given a flat nav user with report requests in flight and no search loading
        mockAreReportRequestsInFlight = true;

        // When the header renders
        renderHeader();

        // Then the bar shows, because the results on the page are still being updated
        expect(screen.getByText('Loading bar shown')).toBeTruthy();
    });
});
