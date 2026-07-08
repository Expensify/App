import {act, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import FullScreenBlockingViewContextProvider from '@components/FullScreenBlockingViewContextProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {SearchContextProvider} from '@components/Search/SearchContextProvider';
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
        (useResponsiveLayout as jest.Mock).mockReturnValue({shouldUseNarrowLayout: true, isSmallScreenWidth: true});

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

    it('does not retry an already failed search snapshot', async () => {
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.SNAPSHOT}${failedQueryJSON?.hash}`, {
                errors: {error: 'Something went wrong'},
                search: {
                    type: CONST.SEARCH.DATA_TYPES.CHAT,
                    offset: 0,
                    hash: 929718687,
                    isLoading: false,
                    hasMoreResults: false,
                },
            });
        });

        renderPage();

        await act(async () => {
            jest.advanceTimersByTime(0);
        });

        expect(mockSearch).not.toHaveBeenCalled();
    });
});
