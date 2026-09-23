import {act, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import FullScreenBlockingViewContextProvider from '@components/FullScreenBlockingViewContextProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type * as SearchContext from '@components/Search/SearchContext';
import {SearchContextProvider} from '@components/Search/SearchContextProvider';
import type {SearchListItem} from '@components/Search/SearchList/ListItem/types';
import SearchLoadingSkeleton from '@components/Search/SearchLoadingSkeleton';
import type * as SearchWriteActionsProviderModule from '@components/Search/SearchWriteActionsProvider';
import type {SearchData, SearchSelectionActionsValue} from '@components/Search/types';
import {PlaybackContextProvider} from '@components/VideoPlayerContexts/PlaybackContext';

import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import {search} from '@libs/actions/Search';
import type * as SearchActions from '@libs/actions/Search';
import registerMiddlewares from '@libs/Middleware/register';
import createRootStackNavigator from '@libs/Navigation/AppNavigator/createRootStackNavigator';
import navigationRef from '@libs/Navigation/navigationRef';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import type {SearchFullscreenNavigatorParamList} from '@libs/Navigation/types';
import * as SearchQueryUtils from '@libs/SearchQueryUtils';
import {getSuggestedSearches} from '@libs/SearchUIUtils';

import EmptySearchView from '@pages/Search/EmptySearchView';
import SearchPage from '@pages/Search/SearchPage';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Policy, Report, Transaction} from '@src/types/onyx';
import type SearchResults from '@src/types/onyx/SearchResults';

import type * as CoreNavigation from '@react-navigation/core';
import type * as reactNavigationNativeImport from '@react-navigation/native';
import type React from 'react';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import getOnyxValue from '../utils/getOnyxValue';

registerMiddlewares();

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
jest.mock('@hooks/useNetwork', () => jest.fn());
const mockSearchQueryParam = jest.fn(() => 'type:chat category:abcd');
jest.mock('@hooks/useRootNavigationState', () => ({
    __esModule: true,
    default: (selector: (state: unknown) => unknown) =>
        selector({
            index: 0,
            routes: [
                {
                    name: 'SearchFullscreenNavigator',
                    state: {
                        index: 0,
                        routes: [
                            {
                                name: 'Search_Root',
                                params: {q: mockSearchQueryParam()},
                            },
                        ],
                    },
                },
            ],
        }),
}));
jest.mock('@libs/actions/Search', () => ({
    ...jest.requireActual<typeof SearchActions>('@libs/actions/Search'),
    search: jest.fn(() => Promise.resolve(200)),
}));

jest.mock('@react-navigation/core', () => ({
    ...jest.requireActual<typeof CoreNavigation>('@react-navigation/core'),
    useNavigation: jest.fn(() => ({getState: jest.fn(() => undefined), isFocused: jest.fn(() => true)})),
}));

type ListProps = {onEndReached?: () => void; onSelectRow?: (item: SearchListItem) => void};

// Captures the list's handlers, since FlashList never lays out in tests.
const listProps: ListProps = {};
jest.mock('@components/Search/SearchList/BaseSearchList', () => ({
    __esModule: true,
    default: (props: ListProps) => {
        listProps.onEndReached = props.onEndReached;
        listProps.onSelectRow = props.onSelectRow;
        return null;
    },
}));

type WriteActionsRender = {
    filteredData: SearchData;
    applySelection: SearchSelectionActionsValue['applySelection'];
};
type WriteActionsProviderProps = Parameters<typeof SearchWriteActionsProviderModule.default>[0];

// The rows <Search> hands this provider are the rows selection can reach.
const mockRenderWriteActions = jest.fn<void, [WriteActionsRender]>();
jest.mock('@components/Search/SearchWriteActionsProvider', () => {
    const {createElement} = jest.requireActual<typeof React>('react');
    const {useSearchSelectionActions} = jest.requireActual<typeof SearchContext>('@components/Search/SearchContext');
    const {default: SearchWriteActionsProvider} = jest.requireActual<typeof SearchWriteActionsProviderModule>('@components/Search/SearchWriteActionsProvider');
    function MockSearchWriteActionsProvider(props: WriteActionsProviderProps) {
        const {applySelection} = useSearchSelectionActions();
        mockRenderWriteActions({filteredData: props.filteredData, applySelection});
        return createElement(SearchWriteActionsProvider, props);
    }
    return {__esModule: true, default: MockSearchWriteActionsProvider};
});

function lastWriteActionsRender() {
    return mockRenderWriteActions.mock.lastCall?.[0];
}

function renderedRowKeys() {
    return lastWriteActionsRender()?.filteredData.map((row) => row.keyForList) ?? [];
}

const mockIsFocused = jest.fn(() => true);
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof reactNavigationNativeImport>('@react-navigation/native'),
    useNavigationState: () => {},
    useIsFocused: () => mockIsFocused(),
}));

type TestNavigationContainerProps = {initialState: reactNavigationNativeImport.InitialState};

type SearchTestRootParamList = {
    [NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR]: reactNavigationNativeImport.NavigatorScreenParams<SearchFullscreenNavigatorParamList>;
};

const RootStack = createRootStackNavigator<SearchTestRootParamList>();
const SearchStack = createPlatformStackNavigator<SearchFullscreenNavigatorParamList>();
const mockUseNetwork = jest.mocked(useNetwork);
const mockUseResponsiveLayout = jest.mocked(useResponsiveLayout);
const mockSearch = jest.mocked(search);

const FAILED_QUERY = 'type:chat category:abcd';
const failedQueryJSON = SearchQueryUtils.buildSearchQueryJSON(FAILED_QUERY);

const EXPENSE_QUERY = 'type:expense';
const expenseQueryJSON = SearchQueryUtils.buildSearchQueryJSON(EXPENSE_QUERY);

const SUBMITTER_ACCOUNT_ID = 1;

// A full page of results: pagination only starts once the loaded results fill one page.
function buildExpenseSnapshotData(firstIndex = 1): SearchResults['data'] {
    const data: Record<string, unknown> = {
        personalDetailsList: {[SUBMITTER_ACCOUNT_ID]: {accountID: SUBMITTER_ACCOUNT_ID, avatar: '', displayName: 'Submitter', login: 'submitter@expensify.com'}},
    };

    for (let index = firstIndex; index < firstIndex + CONST.SEARCH.RESULTS_PAGE_SIZE; index++) {
        const id = String(index);
        data[`report_${id}`] = {
            accountID: SUBMITTER_ACCOUNT_ID,
            chatReportID: '9999',
            currency: 'USD',
            ownerAccountID: SUBMITTER_ACCOUNT_ID,
            policyID: 'A1B2C3',
            reportID: id,
            reportName: 'Expense Report',
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            total: -5000,
            type: CONST.REPORT.TYPE.EXPENSE,
        };
        data[`transactions_${id}`] = {
            amount: -5000,
            category: '',
            comment: {comment: ''},
            created: '2024-12-21',
            currency: 'USD',
            merchant: 'Coffee',
            modifiedCreated: '',
            modifiedCurrency: '',
            modifiedMerchant: '',
            reportID: id,
            tag: '',
            transactionID: id,
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test-only: the rows only carry the fields the list reads, not the full Transaction/Report shapes
    return data as SearchResults['data'];
}

const expenseSnapshotData = buildExpenseSnapshotData();
const expenseSecondPageData = buildExpenseSnapshotData(CONST.SEARCH.RESULTS_PAGE_SIZE + 1);

function getExpenseSnapshot(isLoading: boolean) {
    return {
        data: expenseSnapshotData,
        search: {
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            offset: 0,
            hash: expenseQueryJSON?.hash,
            sortBy: expenseQueryJSON?.sortBy,
            sortOrder: expenseQueryJSON?.sortOrder,
            state: CONST.SEARCH.SNAPSHOT_STATE.LOADED,
            isLoading,
            hasMoreResults: true,
        },
    };
}

function TestSearchFullscreenNavigator() {
    return (
        <SearchStack.Navigator defaultCentralScreen={SCREENS.SEARCH.ROOT}>
            <SearchStack.Screen
                name={SCREENS.SEARCH.ROOT}
                component={SearchPage}
                initialParams={{q: SearchQueryUtils.buildSearchQueryString(failedQueryJSON)}}
                options={{animation: Animations.NONE}}
            />
        </SearchStack.Navigator>
    );
}

function TestNavigationContainer({initialState}: TestNavigationContainerProps) {
    return (
        <NavigationContainer
            ref={navigationRef}
            initialState={initialState}
        >
            <RootStack.Navigator>
                <RootStack.Screen
                    name={NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR}
                    component={TestSearchFullscreenNavigator}
                />
            </RootStack.Navigator>
        </NavigationContainer>
    );
}

function getSearchPage(query = SearchQueryUtils.buildSearchQueryString(failedQueryJSON)) {
    return (
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, PlaybackContextProvider, FullScreenBlockingViewContextProvider]}>
            <PortalProvider>
                <SearchContextProvider>
                    <TestNavigationContainer
                        initialState={{
                            index: 0,
                            routes: [
                                {
                                    name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR,
                                    state: {
                                        index: 0,
                                        routes: [
                                            {
                                                name: SCREENS.SEARCH.ROOT,
                                                params: {q: query},
                                            },
                                        ],
                                    },
                                },
                            ],
                        }}
                    />
                </SearchContextProvider>
            </PortalProvider>
        </ComposeProviders>
    );
}

const renderPage = (query = SearchQueryUtils.buildSearchQueryString(failedQueryJSON)) => render(getSearchPage(query));

describe('SearchPageNarrow', () => {
    beforeAll(() => {
        mockUseResponsiveLayout.mockReturnValue(createMock<ReturnType<typeof useResponsiveLayout>>({shouldUseNarrowLayout: true, isSmallScreenWidth: true}));

        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [
                ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                ONYXKEYS.COLLECTION.SNAPSHOT,
                ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS,
                ONYXKEYS.COLLECTION.REPORT_ACTIONS_PAGES,
                ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS,
            ],
        });
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    beforeEach(() => {
        mockUseNetwork.mockReturnValue({isOffline: false} as ReturnType<typeof useNetwork>);
        mockSearchQueryParam.mockReturnValue(FAILED_QUERY);
        mockIsFocused.mockReturnValue(true);
        listProps.onEndReached = undefined;
        listProps.onSelectRow = undefined;
        mockRenderWriteActions.mockReset();
    });

    it('SearchPageNarrow renders correctly', async () => {
        renderPage();

        await act(async () => {
            jest.advanceTimersByTime(0);
        });

        expect(screen.getByTestId('SearchPageNarrow')).toBeTruthy();

        const searchInput = screen.getByPlaceholderText('Search for something...', {includeHiddenElements: true});
        expect(searchInput).toBeTruthy();
    });

    it('retries an already failed search snapshot once on a fresh mount', async () => {
        // Given a snapshot left errored by a request that failed in an earlier session
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.SNAPSHOT}${failedQueryJSON?.hash}`, {
                errors: {error: 'Something went wrong'},
                search: {
                    type: CONST.SEARCH.DATA_TYPES.CHAT,
                    offset: 0,
                    hash: failedQueryJSON?.hash,
                    sortBy: failedQueryJSON?.sortBy,
                    sortOrder: failedQueryJSON?.sortOrder,
                    isLoading: false,
                    hasMoreResults: false,
                },
            });
        });

        // When the page mounts
        renderPage();

        await act(async () => {
            jest.advanceTimersByTime(0);
        });

        // Then the query is requested again, because without that attempt the page renders its error view on every
        // mount with nothing in flight
        expect(mockSearch).toHaveBeenCalledTimes(1);
    });

    // Reproduces the reload case: the errored snapshot survives but the in-memory response code does not,
    // so the persisted code is the only thing left that can tell the two failure kinds apart.
    const setFailedSnapshot = (responseJsonCode: number) =>
        act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.SNAPSHOT}${failedQueryJSON?.hash}`, {
                errors: {error: 'Something went wrong'},
                search: {
                    type: CONST.SEARCH.DATA_TYPES.CHAT,
                    offset: 0,
                    hash: failedQueryJSON?.hash,
                    isLoading: false,
                    hasMoreResults: false,
                    state: CONST.SEARCH.SNAPSHOT_STATE.LOADED,
                    responseJsonCode,
                },
            });
        });

    it('hides the retry button on a fresh mount when the persisted response marks the query invalid', async () => {
        await setFailedSnapshot(CONST.JSON_CODE.INVALID_SEARCH_QUERY);

        renderPage();

        await act(async () => {
            jest.runAllTimers();
        });

        expect(screen.getByText("That search isn't valid. Try adjusting your search criteria.")).toBeTruthy();
        expect(screen.queryByText('Try again')).toBeNull();
    });

    it('drops a persisted retryable failure on a fresh mount instead of showing the error view', async () => {
        // Given a snapshot errored with a retryable response code
        await setFailedSnapshot(CONST.JSON_CODE.EXP_ERROR);

        // When the page mounts
        renderPage();

        await act(async () => {
            jest.runAllTimers();
        });

        // Then no error view is shown, because leaving the stored failure in place is what turned one failed
        // request into a dead end only the Try again button could escape
        expect(screen.queryByText('Try again')).toBeNull();
    });

    it('shows the error page with a retry button when the server rejected the query with a code other than invalid query', async () => {
        // Given the page already requested the query, so an error that lands afterwards is its own and is kept
        renderPage();

        await act(async () => {
            jest.runAllTimers();
        });

        // When the server answers with a failure code that is not INVALID_SEARCH_QUERY
        await setFailedSnapshot(CONST.JSON_CODE.EXP_ERROR);

        // Then the request really failed, so the error copy shows rather than the stale-results copy
        expect(screen.getByText('Oops... Something went wrong')).toBeTruthy();
        expect(screen.getByText('Try again')).toBeTruthy();
        expect(screen.queryByText('Refresh needed')).toBeNull();
    });

    it('shows the refresh copy when the request failed without a server response code', async () => {
        renderPage();

        await act(async () => {
            jest.runAllTimers();
        });

        // When the request failed before the server could answer, which failureData records as NO_RESPONSE
        await setFailedSnapshot(CONST.JSON_CODE.NO_RESPONSE);

        // Then the results are only out of date, so the refresh copy shows
        expect(screen.getByText('Refresh needed')).toBeTruthy();
        expect(screen.getByText('Refresh')).toBeTruthy();
        expect(screen.queryByText('Oops... Something went wrong')).toBeNull();
    });

    it('renders the empty state when a response without data reached the terminal loaded state', async () => {
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.SNAPSHOT}${failedQueryJSON?.hash}`, {
                search: {
                    type: CONST.SEARCH.DATA_TYPES.CHAT,
                    offset: 0,
                    hash: failedQueryJSON?.hash,
                    isLoading: false,
                    hasMoreResults: false,
                    hasResults: false,
                    state: CONST.SEARCH.SNAPSHOT_STATE.LOADED,
                },
            });
        });

        const renderedPage = renderPage();

        await act(async () => {
            jest.runAllTimers();
        });

        expect(renderedPage.UNSAFE_queryByType(SearchLoadingSkeleton)).toBeNull();
        expect(renderedPage.UNSAFE_getByType(EmptySearchView)).toBeTruthy();
    });

    it('renders the loading skeleton while the snapshot request state is loading', async () => {
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.SNAPSHOT}${failedQueryJSON?.hash}`, {
                search: {
                    type: CONST.SEARCH.DATA_TYPES.CHAT,
                    offset: 0,
                    hash: failedQueryJSON?.hash,
                    isLoading: true,
                    hasMoreResults: false,
                    hasResults: false,
                    state: CONST.SEARCH.SNAPSHOT_STATE.LOADING,
                },
            });
        });

        const renderedPage = renderPage();

        await act(async () => {
            jest.advanceTimersByTime(0);
        });

        expect(renderedPage.UNSAFE_getByType(SearchLoadingSkeleton)).toBeTruthy();
    });
    it('loads the next page after a request that was in flight when the list hit its end resolves', async () => {
        mockSearchQueryParam.mockReturnValue(EXPENSE_QUERY);
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.SNAPSHOT}${expenseQueryJSON?.hash}`, getExpenseSnapshot(false));
        });

        renderPage(EXPENSE_QUERY);
        await act(async () => {
            jest.advanceTimersByTime(0);
        });

        expect(listProps.onEndReached).toBeDefined();

        // Mount refresh still in flight when the end of the list is reached.
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.SNAPSHOT}${expenseQueryJSON?.hash}`, {search: {isLoading: true}});
        });
        await act(async () => {
            listProps.onEndReached?.();
        });
        await act(async () => {
            jest.advanceTimersByTime(0);
        });

        const wasSearchedAtNextPage = () => mockSearch.mock.calls.some(([params]) => params?.offset === CONST.SEARCH.RESULTS_PAGE_SIZE);
        expect(wasSearchedAtNextPage()).toBe(false);

        // Refresh lands.
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.SNAPSHOT}${expenseQueryJSON?.hash}`, {search: {isLoading: false}});
        });
        await act(async () => {
            jest.advanceTimersByTime(0);
        });

        expect(wasSearchedAtNextPage()).toBe(true);
    });
    it('does not fire a pending page once the screen is no longer focused', async () => {
        mockSearchQueryParam.mockReturnValue(EXPENSE_QUERY);
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.SNAPSHOT}${expenseQueryJSON?.hash}`, getExpenseSnapshot(false));
        });

        renderPage(EXPENSE_QUERY);
        await act(async () => {
            jest.advanceTimersByTime(0);
        });

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.SNAPSHOT}${expenseQueryJSON?.hash}`, {search: {isLoading: true}});
        });
        await act(async () => {
            listProps.onEndReached?.();
        });
        await act(async () => {
            jest.advanceTimersByTime(0);
        });

        // User navigates away while the refresh is still on the wire.
        mockIsFocused.mockReturnValue(false);

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.SNAPSHOT}${expenseQueryJSON?.hash}`, {search: {isLoading: false}});
        });
        await act(async () => {
            jest.advanceTimersByTime(0);
        });

        expect(mockSearch.mock.calls.some(([params]) => params?.offset === CONST.SEARCH.RESULTS_PAGE_SIZE)).toBe(false);
    });
    it('does not request a queued page the refreshed snapshot no longer has', async () => {
        mockSearchQueryParam.mockReturnValue(EXPENSE_QUERY);
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.SNAPSHOT}${expenseQueryJSON?.hash}`, getExpenseSnapshot(false));
        });
        renderPage(EXPENSE_QUERY);
        await act(async () => {
            jest.advanceTimersByTime(0);
        });
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.SNAPSHOT}${expenseQueryJSON?.hash}`, {search: {isLoading: true}});
        });
        await act(async () => {
            listProps.onEndReached?.();
        });
        await act(async () => {
            jest.advanceTimersByTime(0);
        });

        // Refresh lands and the result set no longer has a further page.
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.SNAPSHOT}${expenseQueryJSON?.hash}`, {search: {isLoading: false, hasMoreResults: false}});
        });
        await act(async () => {
            jest.advanceTimersByTime(0);
        });

        expect(mockSearch.mock.calls.some(([params]) => params?.offset === CONST.SEARCH.RESULTS_PAGE_SIZE)).toBe(false);
    });
    it('re-requests the paginated page after a first-page response replaces the loaded results', async () => {
        mockSearchQueryParam.mockReturnValue(EXPENSE_QUERY);
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.SNAPSHOT}${expenseQueryJSON?.hash}`, getExpenseSnapshot(false));
        });

        renderPage(EXPENSE_QUERY);
        await act(async () => {
            jest.advanceTimersByTime(0);
        });

        await act(async () => {
            listProps.onEndReached?.();
        });
        await act(async () => {
            jest.advanceTimersByTime(0);
        });

        // The second page lands.
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.SNAPSHOT}${expenseQueryJSON?.hash}`, {
                data: expenseSecondPageData,
                search: {offset: CONST.SEARCH.RESULTS_PAGE_SIZE, isLoading: false},
            });
        });
        await act(async () => {
            jest.advanceTimersByTime(0);
        });

        mockSearch.mockClear();

        // Switching Spend sub-tabs remounts against this snapshot and refreshes it from the first page.
        // That response replaces the results rather than appending, so the second page is gone again.
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.SNAPSHOT}${expenseQueryJSON?.hash}`, getExpenseSnapshot(false));
        });
        await act(async () => {
            jest.advanceTimersByTime(0);
        });
        await act(async () => {
            listProps.onEndReached?.();
        });
        await act(async () => {
            jest.advanceTimersByTime(0);
        });

        expect(mockSearch.mock.calls.some(([params]) => params?.offset === CONST.SEARCH.RESULTS_PAGE_SIZE)).toBe(true);
    });
    it('re-requests the paginated page when a first-page response lands after the page it displaces', async () => {
        mockSearchQueryParam.mockReturnValue(EXPENSE_QUERY);
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.SNAPSHOT}${expenseQueryJSON?.hash}`, getExpenseSnapshot(false));
        });

        renderPage(EXPENSE_QUERY);
        await act(async () => {
            jest.advanceTimersByTime(0);
        });

        await act(async () => {
            listProps.onEndReached?.();
        });
        await act(async () => {
            jest.advanceTimersByTime(0);
        });

        // The second page lands first, so the cursor reaches the page that was asked for.
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.SNAPSHOT}${expenseQueryJSON?.hash}`, {
                data: expenseSecondPageData,
                search: {offset: CONST.SEARCH.RESULTS_PAGE_SIZE, isLoading: false},
            });
        });
        await act(async () => {
            jest.advanceTimersByTime(0);
        });

        mockSearch.mockClear();

        // An older first-page refresh responds last and replaces the results again. The list has not moved,
        // so onEndReached does not fire. The page has to be asked for on its own.
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.SNAPSHOT}${expenseQueryJSON?.hash}`, getExpenseSnapshot(false));
        });
        await act(async () => {
            jest.advanceTimersByTime(0);
        });

        expect(mockSearch.mock.calls.some(([params]) => params?.offset === CONST.SEARCH.RESULTS_PAGE_SIZE)).toBe(true);
    });
    it('holds a page reached while offline and requests it once back online', async () => {
        mockUseNetwork.mockReturnValue({isOffline: true} as ReturnType<typeof useNetwork>);
        mockSearchQueryParam.mockReturnValue(EXPENSE_QUERY);
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.SNAPSHOT}${expenseQueryJSON?.hash}`, getExpenseSnapshot(false));
        });

        renderPage(EXPENSE_QUERY);
        await act(async () => {
            jest.advanceTimersByTime(0);
        });

        await act(async () => {
            listProps.onEndReached?.();
        });
        await act(async () => {
            jest.advanceTimersByTime(0);
        });

        // Nothing goes on the wire offline: the request would only fail and leave an error on the snapshot.
        const wasSearchedAtNextPage = () => mockSearch.mock.calls.some(([params]) => params?.offset === CONST.SEARCH.RESULTS_PAGE_SIZE);
        expect(wasSearchedAtNextPage()).toBe(false);

        // Back online, the reconnect refresh runs and settles.
        mockUseNetwork.mockReturnValue({isOffline: false} as ReturnType<typeof useNetwork>);
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.SNAPSHOT}${expenseQueryJSON?.hash}`, {search: {isLoading: true}});
        });
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.SNAPSHOT}${expenseQueryJSON?.hash}`, {search: {isLoading: false}});
        });
        await act(async () => {
            jest.advanceTimersByTime(0);
        });

        expect(wasSearchedAtNextPage()).toBe(true);
    });

    describe('a to-do search, which reads live Onyx rows instead of the snapshot', () => {
        const TODO_EMAIL = 'submitter@expensify.com';
        const TODO_POLICY_ID = 'todoPolicy';
        // Without a CurrentUserPersonalDetailsProvider, the screen builds its suggested searches for this ID.
        const TODO_ACCOUNT_ID = CONST.DEFAULT_NUMBER_ID;
        // From the screen's own builder, since a hand-written query hashes differently and isn't a to-do search.
        const TODO_QUERY = getSuggestedSearches(TODO_ACCOUNT_ID, undefined, false, undefined)[CONST.SEARCH.SEARCH_KEYS.SUBMIT].searchQuery;
        const todoQueryJSON = SearchQueryUtils.buildSearchQueryJSON(TODO_QUERY);

        // An open expense report with no expenses is a Submit to-do.
        const buildTodoReport = (index: number) =>
            createMock<Report>({
                reportID: `todo_${index}`,
                chatReportID: `chat_todo_${index}`,
                policyID: TODO_POLICY_ID,
                ownerAccountID: TODO_ACCOUNT_ID,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                type: CONST.REPORT.TYPE.EXPENSE,
                reportName: 'Draft report',
                currency: 'USD',
                total: 0,
            });

        const seedTodoReports = async (count: number) => {
            await act(async () => {
                await Onyx.set(ONYXKEYS.SESSION, {accountID: TODO_ACCOUNT_ID, email: TODO_EMAIL});
                await Onyx.set(
                    `${ONYXKEYS.COLLECTION.POLICY}${TODO_POLICY_ID}`,
                    createMock<Policy>({id: TODO_POLICY_ID, name: 'Todo policy', type: CONST.POLICY.TYPE.TEAM, role: CONST.POLICY.ROLE.USER, owner: TODO_EMAIL, outputCurrency: 'USD'}),
                );
                // An empty draft only counts once transactions have loaded, and an untouched collection never loads.
                await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}unrelated`, createMock<Transaction>({transactionID: 'unrelated', reportID: 'not_a_todo', amount: -1, currency: 'USD'}));
                await Promise.all(Array.from({length: count}, (_value, index) => Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}todo_${index + 1}`, buildTodoReport(index + 1))));
            });
            mockSearchQueryParam.mockReturnValue(TODO_QUERY);
        };

        const seedTodoSnapshot = (hasMoreResults: boolean, overrides: Record<string, unknown> = {}) =>
            act(async () => {
                await Onyx.set(`${ONYXKEYS.COLLECTION.SNAPSHOT}${todoQueryJSON?.hash}`, {
                    search: {
                        type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
                        offset: 0,
                        hash: todoQueryJSON?.hash,
                        isLoading: false,
                        state: CONST.SEARCH.SNAPSHOT_STATE.LOADED,
                        hasMoreResults,
                        ...overrides,
                    },
                });
            });

        // The real search() parks the snapshot in its loading state while a page is on the wire; the
        // live row cap holds there until the answer lands, so the mock has to write it too.
        const searchWritesLoadingState = () =>
            mockSearch.mockImplementation((params?: Parameters<typeof search>[0]) => {
                if ((params?.offset ?? 0) <= 0) {
                    return Promise.resolve(200);
                }
                return Onyx.merge(`${ONYXKEYS.COLLECTION.SNAPSHOT}${todoQueryJSON?.hash}`, {search: {state: CONST.SEARCH.SNAPSHOT_STATE.LOADING, isLoading: true}}).then(() => 200);
            });

        const answerTodoPage = (pageOffset: number, hasMoreResults = false) =>
            act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.SNAPSHOT}${todoQueryJSON?.hash}`, {
                    search: {offset: pageOffset, isLoading: false, state: CONST.SEARCH.SNAPSHOT_STATE.LOADED, hasMoreResults},
                });
            });

        beforeEach(() => {
            // clearAllMocks keeps mockImplementation overrides, so pin the default back down per test.
            mockSearch.mockImplementation(() => Promise.resolve(200));
        });

        it('asks for its first page exactly once', async () => {
            await seedTodoReports(3);

            renderPage(TODO_QUERY);
            await act(async () => {
                jest.advanceTimersByTime(0);
            });

            expect(mockSearch).toHaveBeenCalledTimes(1);
            expect(mockSearch).toHaveBeenCalledWith(expect.objectContaining({offset: 0, searchKey: CONST.SEARCH.SEARCH_KEYS.SUBMIT}));
        });

        it('asks the server for the next page when the list reaches its end', async () => {
            // The cursor only pages once the device already holds a full page of live rows.
            await seedTodoReports(CONST.SEARCH.RESULTS_PAGE_SIZE + 10);
            await seedTodoSnapshot(true);

            renderPage(TODO_QUERY);
            await act(async () => {
                jest.advanceTimersByTime(0);
            });
            mockSearch.mockClear();

            await act(async () => {
                listProps.onEndReached?.();
            });
            await act(async () => {
                jest.advanceTimersByTime(0);
            });

            expect(mockSearch).toHaveBeenCalledWith(expect.objectContaining({offset: CONST.SEARCH.RESULTS_PAGE_SIZE}));
        });

        it('shows the next rows only once the server answers their page, and ignores ends meanwhile', async () => {
            const rowCount = CONST.SEARCH.RESULTS_PAGE_SIZE + 20;
            await seedTodoReports(rowCount);
            await seedTodoSnapshot(true);
            searchWritesLoadingState();

            renderPage(TODO_QUERY);
            await act(async () => {
                jest.advanceTimersByTime(0);
            });
            mockSearch.mockClear();

            await act(async () => {
                listProps.onEndReached?.();
            });
            await act(async () => {
                jest.advanceTimersByTime(0);
            });

            // The page is on the wire: the cap holds at the rows already answered.
            expect(renderedRowKeys()).toHaveLength(CONST.SEARCH.RESULTS_PAGE_SIZE);

            // onEndReached refires under the loading footer; the second page must not chase past the one in flight.
            await act(async () => {
                listProps.onEndReached?.();
            });
            await act(async () => {
                jest.advanceTimersByTime(0);
            });
            expect(mockSearch).toHaveBeenCalledTimes(1);

            await answerTodoPage(CONST.SEARCH.RESULTS_PAGE_SIZE);
            await act(async () => {
                jest.advanceTimersByTime(0);
            });

            expect(renderedRowKeys()).toHaveLength(rowCount);
            expect(mockSearch).toHaveBeenCalledTimes(1);
        });

        it('pages in live rows past the cap locally once the server reports no more pages', async () => {
            const rowCount = CONST.SEARCH.RESULTS_PAGE_SIZE + 20;
            await seedTodoReports(rowCount);
            await seedTodoSnapshot(false);

            renderPage(TODO_QUERY);
            await act(async () => {
                jest.advanceTimersByTime(0);
            });

            expect(renderedRowKeys()).toHaveLength(CONST.SEARCH.RESULTS_PAGE_SIZE);
            mockSearch.mockClear();

            await act(async () => {
                listProps.onEndReached?.();
            });
            await act(async () => {
                jest.advanceTimersByTime(0);
            });

            // The Onyx scan still holds rows past the cap: reveal another page without the server.
            expect(renderedRowKeys()).toHaveLength(rowCount);
            expect(mockSearch).not.toHaveBeenCalled();

            // Nothing left to reveal, so a further end changes nothing.
            await act(async () => {
                listProps.onEndReached?.();
            });
            await act(async () => {
                jest.advanceTimersByTime(0);
            });
            expect(renderedRowKeys()).toHaveLength(rowCount);
        });

        it('retries the failed page offset instead of skipping ahead past it', async () => {
            await seedTodoReports(CONST.SEARCH.RESULTS_PAGE_SIZE * 2 + 20);
            // The live response drops errors, so a failed page only leaves its response code behind.
            await seedTodoSnapshot(true, {offset: CONST.SEARCH.RESULTS_PAGE_SIZE, responseJsonCode: 500});

            renderPage(TODO_QUERY);
            await act(async () => {
                jest.advanceTimersByTime(0);
            });
            mockSearch.mockClear();

            await act(async () => {
                listProps.onEndReached?.();
            });
            await act(async () => {
                jest.advanceTimersByTime(0);
            });

            expect(mockSearch).toHaveBeenCalledWith(expect.objectContaining({offset: CONST.SEARCH.RESULTS_PAGE_SIZE}));
            expect(mockSearch.mock.calls.some(([params]) => params?.offset === CONST.SEARCH.RESULTS_PAGE_SIZE * 2)).toBe(false);
        });

        it('saves the page it has for report navigation to page on from', async () => {
            await seedTodoReports(CONST.SEARCH.RESULTS_PAGE_SIZE + 10);
            await seedTodoSnapshot(true);

            renderPage(TODO_QUERY);
            await act(async () => {
                jest.advanceTimersByTime(0);
            });
            await act(async () => {
                listProps.onEndReached?.();
            });
            await act(async () => {
                jest.advanceTimersByTime(0);
            });

            const report = lastWriteActionsRender()?.filteredData.at(0);
            await act(async () => {
                if (!report) {
                    return;
                }
                listProps.onSelectRow?.(report);
            });

            expect(await getOnyxValue(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY)).toEqual(expect.objectContaining({offset: CONST.SEARCH.RESULTS_PAGE_SIZE}));
        });

        it('holds a page reached offline and requests it once back online', async () => {
            await seedTodoReports(CONST.SEARCH.RESULTS_PAGE_SIZE + 10);
            await seedTodoSnapshot(true);

            // Offline before the list mounts, so the paging closure sees it.
            mockUseNetwork.mockReturnValue({isOffline: true} as ReturnType<typeof useNetwork>);
            renderPage(TODO_QUERY);
            await act(async () => {
                jest.advanceTimersByTime(0);
            });
            mockSearch.mockClear();

            await act(async () => {
                listProps.onEndReached?.();
            });
            await act(async () => {
                jest.advanceTimersByTime(0);
            });

            // Nothing goes on the wire offline: the request would only fail and leave an error on the snapshot.
            expect(mockSearch).not.toHaveBeenCalled();

            mockUseNetwork.mockReturnValue({isOffline: false} as ReturnType<typeof useNetwork>);
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.SNAPSHOT}${todoQueryJSON?.hash}`, {search: {isLoading: true}});
            });
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.SNAPSHOT}${todoQueryJSON?.hash}`, {search: {isLoading: false}});
            });
            await act(async () => {
                jest.advanceTimersByTime(0);
            });

            expect(mockSearch).toHaveBeenCalledWith(expect.objectContaining({offset: CONST.SEARCH.RESULTS_PAGE_SIZE}));
        });
    });
});
