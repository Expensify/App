import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import type {InitialState} from '@react-navigation/native';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import FullScreenBlockingViewContextProvider from '@components/FullScreenBlockingViewContextProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {PlaybackContextProvider} from '@components/VideoPlayerContexts/PlaybackContext';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import createRootStackNavigator from '@libs/Navigation/AppNavigator/createRootStackNavigator';
import navigationRef from '@libs/Navigation/navigationRef';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import type {AuthScreensParamList, SearchFullscreenNavigatorParamList} from '@libs/Navigation/types';
// eslint-disable-next-line no-restricted-imports, no-restricted-syntax
import * as SearchQueryUtils from '@libs/SearchQueryUtils';
import SearchPage from '@pages/Search/SearchPage';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());

type TestNavigationContainerProps = {initialState: InitialState};

const RootStack = createRootStackNavigator<AuthScreensParamList>();
const SearchStack = createPlatformStackNavigator<SearchFullscreenNavigatorParamList>();

function TestSearchFullscreenNavigator() {
    return (
        <SearchStack.Navigator defaultCentralScreen={SCREENS.SEARCH.ROOT}>
            <SearchStack.Screen
                name={SCREENS.SEARCH.ROOT}
                component={SearchPage}
                initialParams={{q: SearchQueryUtils.buildSearchQueryString()}}
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

const renderPage = () => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, PlaybackContextProvider, FullScreenBlockingViewContextProvider]}>
            <PortalProvider>
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
                                        },
                                    ],
                                },
                            },
                        ],
                    }}
                />
            </PortalProvider>
        </ComposeProviders>,
    );
};

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

    it('NavigationTabBar should be hidden when the search input is focused', async () => {
        renderPage();

        expect(screen.getByTestId('SearchPageNarrow')).toBeTruthy();

        // Initially, there are two NavigationTabBars on screen: one from TopLevelNavigationTabBar and one from SearchPageNarrow.
        let navigationTabBars = screen.getAllByTestId('NavigationTabBar');
        expect(navigationTabBars).toHaveLength(2);

        const searchAutocompleteInput = await screen.findByTestId('search-autocomplete-text-input');
        expect(searchAutocompleteInput).toBeTruthy();

        // When the search input is focused, the NavigationTabBar from SearchPageNarrow will unmount, and the one from TopLevelNavigationTabBar will be hidden.
        // eslint-disable-next-line testing-library/no-unnecessary-act
        await act(async () => {
            fireEvent(searchAutocompleteInput, 'focus');
        });

        await waitFor(() => {
            navigationTabBars = screen.getAllByTestId('NavigationTabBar');
            expect(navigationTabBars).toHaveLength(1);
        });

        await waitFor(() => {
            const topLevelNavigationTabBar = screen.getByTestId('TopLevelNavigationTabBar');
            expect(topLevelNavigationTabBar).toHaveStyle({pointerEvents: 'none', opacity: 0});
        });

        // The original state is restored after the search input is canceled.
        // eslint-disable-next-line testing-library/no-unnecessary-act
        await act(async () => {
            fireEvent.press(await screen.findByText('Cancel'));
        });

        await waitFor(() => {
            navigationTabBars = screen.getAllByTestId('NavigationTabBar');
            expect(navigationTabBars).toHaveLength(2);
        });

        await waitFor(() => {
            const topLevelNavigationTabBar = screen.getByTestId('TopLevelNavigationTabBar');
            expect(topLevelNavigationTabBar).toHaveStyle({pointerEvents: 'auto', opacity: 1});
        });
    });
});
