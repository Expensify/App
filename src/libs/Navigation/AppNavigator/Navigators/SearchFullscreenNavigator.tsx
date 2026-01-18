import React from 'react';
import usePreloadFullScreenNavigators from '@libs/Navigation/AppNavigator/usePreloadFullScreenNavigators';
import useSplitNavigatorScreenOptions from '@libs/Navigation/AppNavigator/useSplitNavigatorScreenOptions';
import Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {AuthScreensParamList, SearchFullscreenNavigatorParamList} from '@libs/Navigation/types';
import * as SearchQueryUtils from '@libs/SearchQueryUtils';
import createSearchFullscreenNavigator from '@navigation/AppNavigator/createSearchFullscreenNavigator';
import FreezeWrapper from '@navigation/AppNavigator/FreezeWrapper';
import type NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import type ReactComponentModule from '@src/types/utils/ReactComponentModule';

const loadSearchPage = () => require<ReactComponentModule>('@pages/Search/SearchPage').default;
const loadSearchMoneyReportPage = () => require<ReactComponentModule>('@pages/Search/SearchMoneyRequestReportPage').default;

const Stack = createSearchFullscreenNavigator<SearchFullscreenNavigatorParamList>();

function SearchFullscreenNavigator({route}: PlatformStackScreenProps<AuthScreensParamList, typeof NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR>) {
    // These options can be used here because the full screen navigator has the same structure as the split navigator in terms of the central screens, but it does not have a sidebar.
    const {centralScreen: centralScreenOptions} = useSplitNavigatorScreenOptions();

    // This hook preloads the screens of adjacent tabs to make changing tabs faster.
    usePreloadFullScreenNavigators();

    return (
        <FreezeWrapper>
            <Stack.Navigator
                screenOptions={centralScreenOptions}
                defaultCentralScreen={SCREENS.SEARCH.ROOT}
                parentRoute={route}
            >
                <Stack.Screen
                    name={SCREENS.SEARCH.ROOT}
                    getComponent={loadSearchPage}
                    initialParams={{q: SearchQueryUtils.buildSearchQueryString()}}
                    options={{animation: Animations.NONE}}
                />
                <Stack.Screen
                    name={SCREENS.SEARCH.MONEY_REQUEST_REPORT}
                    getComponent={loadSearchMoneyReportPage}
                />
            </Stack.Navigator>
        </FreezeWrapper>
    );
}

export default SearchFullscreenNavigator;
