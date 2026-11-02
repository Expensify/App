import type * as NativeNavigation from '@react-navigation/native';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import SearchRouter from '@components/Search/SearchRouter/SearchRouter';
import type {PrivateIsArchivedMap} from '@hooks/usePrivateIsArchivedMap';
import type * as OptionsListUtilsModule from '@libs/OptionsListUtils';
import {createFilteredOptionList} from '@libs/OptionsListUtils';
import Navigation from '@navigation/Navigation';
import ComposeProviders from '@src/components/ComposeProviders';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {PersonalDetails, Report} from '@src/types/onyx';
import createCollection from '../utils/collections/createCollection';
import createPersonalDetails from '../utils/collections/personalDetails';
import {createRandomReport} from '../utils/collections/reports';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

jest.mock('lodash/debounce', () =>
    jest.fn((fn: Record<string, jest.Mock>) => {
        // eslint-disable-next-line no-param-reassign
        fn.cancel = jest.fn();
        return fn;
    }),
);

jest.mock('@src/libs/Log');

jest.mock('@src/libs/API', () => ({
    write: jest.fn(),
    makeRequestWithSideEffects: jest.fn(),
    read: jest.fn(),
}));

// The jest-expo preset resolves to the .native.tsx file which defers rendering via onLayout (which never fires in tests).
// Mock the deferred wrapper to directly render SearchAutocompleteList.
jest.mock('@components/Search/DeferredSearchAutocompleteList', () => {
    const module = jest.requireActual<{default: React.ComponentType}>('@components/Search/SearchAutocompleteList');
    return {
        __esModule: true,

        default: module.default,
    };
});

jest.mock('@src/libs/Navigation/Navigation', () => ({
    dismissModalWithReport: jest.fn(),
    getActiveRouteWithoutParams: jest.fn(() => ''),
    getTopmostReportId: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    isDisplayedInModal: jest.fn(() => false),
    navigate: jest.fn(),
}));

jest.mock('@src/hooks/useRootNavigationState', () => ({
    __esModule: true,
    default: () => ({contextualReportID: undefined, isSearchRouterScreen: false}),
}));

jest.mock('@hooks/useExportedToFilterOptions', () => ({
    __esModule: true,
    default: () => ({
        exportedToFilterOptions: [],
        combinedUniqueExportTemplates: [],
        connectedIntegrationNames: new Set<string>(),
    }),
}));

// Mock useFilteredOptions to bypass derived Onyx keys that aren't available in tests.
const mockUseFilteredOptions = jest.fn();
jest.mock('@hooks/useFilteredOptions', () => ({
    __esModule: true,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    default: (...args: unknown[]) => mockUseFilteredOptions(...args),
}));

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof NativeNavigation>('@react-navigation/native');
    return {
        ...actualNav,
        useFocusEffect: jest.fn(),
        useIsFocused: () => true,
        useRoute: () => jest.fn(),
        usePreventRemove: () => jest.fn(),
        useNavigation: () => ({
            navigate: jest.fn(),
            addListener: () => jest.fn(),
        }),
        createNavigationContainerRef: () => ({
            addListener: () => jest.fn(),
            removeListener: () => jest.fn(),
            isReady: () => jest.fn(),
            getCurrentRoute: () => jest.fn(),
            getState: () => jest.fn(),
        }),
        useNavigationState: () => ({
            routes: [],
        }),
    };
});

jest.mock('@src/components/ConfirmedRoute.tsx');

const getMockedReports = (length = 10) =>
    createCollection<Report>(
        (item) => `${ONYXKEYS.COLLECTION.REPORT}${item.reportID}`,
        (index) => createRandomReport(index, undefined),
        length,
    );

const getMockedPersonalDetails = (length = 10) =>
    createCollection<PersonalDetails>(
        (item) => item.accountID,
        (index) => createPersonalDetails(index),
        length,
    );

const mockedReports = getMockedReports(10);
const mockedBetas = Object.values(CONST.BETAS);
const mockedPersonalDetails = getMockedPersonalDetails(10);
const EMPTY_PRIVATE_IS_ARCHIVED_MAP: PrivateIsArchivedMap = {};
const mockedOptions = createFilteredOptionList(mockedPersonalDetails, mockedReports, undefined, EMPTY_PRIVATE_IS_ARCHIVED_MAP, undefined, {isSearching: true});

const mockOnClose = jest.fn();

// Fake report options that getSearchOptions returns as recentReports.
// These simulate local results available before any server search completes.
const fakeRecentReports = [
    {reportID: '101', keyForList: '101', text: 'Alice Report', alternateText: 'alice alt', lastMessageText: 'hello'},
    {reportID: '102', keyForList: '102', text: 'Bob Report', alternateText: 'bob alt', lastMessageText: 'hi'},
    {reportID: '103', keyForList: '103', text: 'Charlie Report', alternateText: 'charlie alt', lastMessageText: 'hey'},
];

function SearchRouterWrapper() {
    return (
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <SearchRouter onRouterClose={mockOnClose} />
        </ComposeProviders>
    );
}

/**
 * Helper to flush all pending React state updates and Onyx callbacks.
 * With fake timers we need multiple rounds of timer advancement + microtask flushing.
 */
async function flushAllUpdates() {
    for (let i = 0; i < 10; i++) {
        await act(async () => {
            jest.advanceTimersByTime(100);
            await waitForBatchedUpdates();
        });
    }
}

describe('SearchAutocompleteList', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT],
        });
    });

    beforeEach(() => {
        global.fetch = TestHelper.getGlobalFetchMock();
        wrapOnyxWithWaitForBatchedUpdates(Onyx);
        mockUseFilteredOptions.mockReturnValue({
            options: mockedOptions,
            isLoading: false,
            loadMore: jest.fn(),
            hasMore: false,
            isLoadingMore: false,
        });
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    it('should display Recent searches section when query is empty and recent searches exist', async () => {
        const timestampOne = '2024-01-01T00:00:00';
        const timestampTwo = '2024-01-02T00:00:00';
        const recentSearches: Record<string, {query: string; timestamp: string}> = {};
        recentSearches[timestampOne] = {query: 'type:expense status:approved', timestamp: timestampOne};
        recentSearches[timestampTwo] = {query: 'type:chat', timestamp: timestampTwo};

        await waitForBatchedUpdates();
        await Onyx.multiSet({
            ...mockedReports,
            [ONYXKEYS.PERSONAL_DETAILS_LIST]: mockedPersonalDetails,
            [ONYXKEYS.BETAS]: mockedBetas,
            [ONYXKEYS.RAM_ONLY_IS_SEARCHING_FOR_REPORTS]: true,
            [ONYXKEYS.RECENT_SEARCHES]: recentSearches,
        });

        render(<SearchRouterWrapper />);

        // Flush all pending updates (Onyx subscriptions, useEffect, re-renders)
        await flushAllUpdates();

        // Verify "Recent searches" section header is visible when query is empty and recent searches exist
        await waitFor(() => {
            expect(screen.getByText('Recent searches')).toBeTruthy();
        });

        // Verify the recent search items themselves are also displayed
        expect(screen.getByText('type:expense status:approved')).toBeTruthy();
        expect(screen.getByText('type:chat')).toBeTruthy();
    });

    describe('two-section chat switcher', () => {
        // These tests use a controlled getSearchOptions mock to verify the section splitting logic
        // introduced for stable two-section chat switcher results (local + server).
        let getSearchOptionsSpy: jest.SpyInstance;

        beforeEach(() => {
            const OptionsListUtils = jest.requireActual<typeof OptionsListUtilsModule>('@libs/OptionsListUtils');
            getSearchOptionsSpy = jest.spyOn(OptionsListUtils, 'getSearchOptions').mockReturnValue({
                options: {
                    recentReports: fakeRecentReports,
                    personalDetails: [],
                    currentUserOption: null,
                    userToInvite: null,
                },
            });
        });

        afterEach(() => {
            getSearchOptionsSpy.mockRestore();
        });

        it('should display "Recent chats" section when query is empty', async () => {
            const recentSearches: Record<string, {query: string; timestamp: string}> = {};
            recentSearches['2024-01-01T00:00:00'] = {query: 'type:expense', timestamp: '2024-01-01T00:00:00'};

            await waitForBatchedUpdates();
            await Onyx.multiSet({
                ...mockedReports,
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: mockedPersonalDetails,
                [ONYXKEYS.BETAS]: mockedBetas,
                [ONYXKEYS.RECENT_SEARCHES]: recentSearches,
            });

            render(<SearchRouterWrapper />);
            await flushAllUpdates();

            await waitFor(() => {
                expect(screen.getByText('Recent chats')).toBeTruthy();
            });

            // "Search results" section should NOT be visible when query is empty
            expect(screen.queryByText('Search results')).toBeNull();
        });

        it('should keep "Recent chats" header when an active search query is entered', async () => {
            const recentSearches: Record<string, {query: string; timestamp: string}> = {};
            recentSearches['2024-01-01T00:00:00'] = {query: 'type:expense', timestamp: '2024-01-01T00:00:00'};

            await waitForBatchedUpdates();
            await Onyx.multiSet({
                ...mockedReports,
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: mockedPersonalDetails,
                [ONYXKEYS.BETAS]: mockedBetas,
                [ONYXKEYS.RECENT_SEARCHES]: recentSearches,
            });

            render(<SearchRouterWrapper />);
            await flushAllUpdates();

            // Verify initial state shows "Recent chats" section
            await waitFor(() => {
                expect(screen.getByText('Recent chats')).toBeTruthy();
            });

            // Type a search query to trigger the two-section split
            const textInput = screen.getByTestId('search-autocomplete-text-input');
            fireEvent.changeText(textInput, 'test');
            await flushAllUpdates();

            // "Recent chats" header should still be visible with an active query
            // (local section keeps the title, server section uses "Search results")
            await waitFor(() => {
                expect(screen.getByText('Recent chats')).toBeTruthy();
            });
        });

        it('should return to "Recent chats" section when search query is cleared', async () => {
            const recentSearches: Record<string, {query: string; timestamp: string}> = {};
            recentSearches['2024-01-01T00:00:00'] = {query: 'type:expense', timestamp: '2024-01-01T00:00:00'};

            await waitForBatchedUpdates();
            await Onyx.multiSet({
                ...mockedReports,
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: mockedPersonalDetails,
                [ONYXKEYS.BETAS]: mockedBetas,
                [ONYXKEYS.RECENT_SEARCHES]: recentSearches,
            });

            render(<SearchRouterWrapper />);
            await flushAllUpdates();

            // Type a search query
            const textInput = screen.getByTestId('search-autocomplete-text-input');
            fireEvent.changeText(textInput, 'some query');
            await flushAllUpdates();

            // "Recent chats" should still be visible with an active query
            await waitFor(() => {
                expect(screen.getByText('Recent chats')).toBeTruthy();
            });

            // Clear the query
            fireEvent.changeText(textInput, '');
            await flushAllUpdates();

            // Should return to "Recent chats" section
            await waitFor(() => {
                expect(screen.getByText('Recent chats')).toBeTruthy();
            });

            // "Search results" section should not be visible
            expect(screen.queryByText('Search results')).toBeNull();
        });

        it('should preserve frozen local result order when server results arrive', async () => {
            const recentSearches: Record<string, {query: string; timestamp: string}> = {};
            recentSearches['2024-01-01T00:00:00'] = {query: 'type:expense', timestamp: '2024-01-01T00:00:00'};

            await waitForBatchedUpdates();
            await Onyx.multiSet({
                ...mockedReports,
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: mockedPersonalDetails,
                [ONYXKEYS.BETAS]: mockedBetas,
                [ONYXKEYS.RECENT_SEARCHES]: recentSearches,
            });

            render(<SearchRouterWrapper />);
            await flushAllUpdates();

            // Verify initial state shows "Recent chats" section with Alice, Bob, Charlie
            await waitFor(() => {
                expect(screen.getByText('Recent chats')).toBeTruthy();
            });

            // Type a search query to freeze the local rank (Alice=0, Bob=1, Charlie=2)
            const textInput = screen.getByTestId('search-autocomplete-text-input');
            fireEvent.changeText(textInput, 'test');
            await flushAllUpdates();

            // "Recent chats" header should still be visible (local section keeps its title)
            await waitFor(() => {
                expect(screen.getByText('Recent chats')).toBeTruthy();
            });

            // Now simulate server results arriving by updating the mock to return results
            // in a DIFFERENT order, plus a new server-only result.
            getSearchOptionsSpy.mockReturnValue({
                options: {
                    recentReports: [
                        {reportID: '103', keyForList: '103', text: 'Charlie Report', alternateText: 'charlie alt', lastMessageText: 'hey'},
                        {reportID: '101', keyForList: '101', text: 'Alice Report', alternateText: 'alice alt', lastMessageText: 'hello'},
                        {reportID: '102', keyForList: '102', text: 'Bob Report', alternateText: 'bob alt', lastMessageText: 'hi'},
                        {reportID: '201', keyForList: '201', text: 'NewServer Report', alternateText: 'server alt', lastMessageText: 'new'},
                    ],
                    personalDetails: [],
                    currentUserOption: null,
                    userToInvite: null,
                },
            });

            // Trigger a re-render by returning a new options reference from useFilteredOptions
            // (simulates server data arriving and updating Onyx-backed options).
            mockUseFilteredOptions.mockReturnValue({
                options: {...mockedOptions},
                isLoading: false,
                loadMore: jest.fn(),
                hasMore: false,
                isLoadingMore: false,
            });
            await act(async () => {
                await Onyx.set(ONYXKEYS.RAM_ONLY_IS_SEARCHING_FOR_REPORTS, false);
            });
            await flushAllUpdates();

            // Verify "Search results" section appears (the server result goes there)
            await waitFor(() => {
                expect(screen.getByText('Search results')).toBeTruthy();
            });

            // Verify the new server-only result appears
            expect(screen.getByText('NewServer Report')).toBeTruthy();

            // Verify that local results maintain their FROZEN order (Alice < Bob < Charlie)
            // even though the mock now returns them as Charlie, Alice, Bob.
            // Check ordering by examining the sequence of rendered text nodes.
            const allTexts = screen.queryAllByText(/Report$/);
            const names = allTexts.map((el) => {
                // React Native Testing Library text elements expose their content via children
                const textContent = typeof el.props.children === 'string' ? el.props.children : '';
                return textContent;
            });

            // Filter to only the names we care about
            const relevantOrder = names.filter((n: string) => ['Alice Report', 'Bob Report', 'Charlie Report', 'NewServer Report'].includes(n));

            // Alice, Bob, Charlie should appear in that order (frozen rank), with NewServer after them
            expect(relevantOrder.indexOf('Alice Report')).toBeLessThan(relevantOrder.indexOf('Bob Report'));
            expect(relevantOrder.indexOf('Bob Report')).toBeLessThan(relevantOrder.indexOf('Charlie Report'));
            // NewServer should appear after the local results (in the server section)
            expect(relevantOrder.indexOf('Charlie Report')).toBeLessThan(relevantOrder.indexOf('NewServer Report'));
        });

        // Regression test for https://github.com/Expensify/App/issues/93009: after the two-section switcher was
        // introduced, the first matched chat was no longer highlighted because the highlight focused a fixed flat
        // index that now lands on the "Recent chats" section header row instead of the first result. As a result
        // pressing Enter ran a text search instead of opening the chat. The fix focuses the header-aware index of
        // the first result.
        it('should focus the first matched chat so submitting opens it instead of running a search', async () => {
            const recentSearches: Record<string, {query: string; timestamp: string}> = {};
            recentSearches['2024-01-01T00:00:00'] = {query: 'type:expense', timestamp: '2024-01-01T00:00:00'};

            await waitForBatchedUpdates();
            await Onyx.multiSet({
                ...mockedReports,
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: mockedPersonalDetails,
                [ONYXKEYS.BETAS]: mockedBetas,
                [ONYXKEYS.RECENT_SEARCHES]: recentSearches,
            });

            render(<SearchRouterWrapper />);
            await flushAllUpdates();

            // Wait for the first recent chat row (not just the header) to render so the highlight has a target.
            await waitFor(() => {
                expect(screen.getByText('Recent chats')).toBeTruthy();
                expect(screen.getByText('Alice Report')).toBeTruthy();
            });

            // Type a query that matches the first recent chat ("Alice Report") as a whole word.
            // The header-aware highlight effect should move focus onto that result row, not a section header.
            const textInput = screen.getByTestId('search-autocomplete-text-input');
            fireEvent.changeText(textInput, 'Alice');
            await flushAllUpdates();

            // Submitting (Enter) should open the focused chat rather than run a text search. The highlight effect
            // runs asynchronously, so poll the submit until focus settles on the result. With the bug present the
            // first row is never highlighted, so submit always runs a text search and this never becomes true.
            await waitFor(() => {
                fireEvent(textInput, 'submitEditing');
                expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute('101'));
            });
        });
    });
});
