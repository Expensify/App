// This suite renders SearchPage without TestHelper, so it never loads @src/setup, where the app registers
// the API middlewares. The rendered page processes a search request, and the pipeline needs them registered.
import '@libs/Middleware/register';
import {act, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import FullScreenBlockingViewContextProvider from '@components/FullScreenBlockingViewContextProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {SearchContextProvider} from '@components/Search/SearchContextProvider';
import SearchLoadingSkeleton from '@components/Search/SearchLoadingSkeleton';
import {PlaybackContextProvider} from '@components/VideoPlayerContexts/PlaybackContext';

import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import {search} from '@libs/actions/Search';
import type * as SearchActions from '@libs/actions/Search';
import createRootStackNavigator from '@libs/Navigation/AppNavigator/createRootStackNavigator';
import navigationRef from '@libs/Navigation/navigationRef';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import type {SearchFullscreenNavigatorParamList} from '@libs/Navigation/types';
import * as SearchQueryUtils from '@libs/SearchQueryUtils';

import EmptySearchView from '@pages/Search/EmptySearchView';
import SearchPage from '@pages/Search/SearchPage';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import type * as CoreNavigation from '@react-navigation/core';
import type * as reactNavigationNativeImport from '@react-navigation/native';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';

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

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof reactNavigationNativeImport>('@react-navigation/native'),
    useNavigationState: () => {},
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
});
