import React from 'react';
import type {PlatformStackNavigationOptions, PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {AuthScreensParamList, SearchFullscreenNavigatorParamList} from '@libs/Navigation/types';
import * as SearchQueryUtils from '@libs/SearchQueryUtils';
import createSearchFullscreenNavigator from '@navigation/AppNavigator/createSearchFullscreenNavigator';
import FreezeWrapper from '@navigation/AppNavigator/FreezeWrapper';
import useRootNavigatorScreenOptions from '@navigation/AppNavigator/useRootNavigatorScreenOptions';
import type NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import type ReactComponentModule from '@src/types/utils/ReactComponentModule';

const loadSearchPage = () => require<ReactComponentModule>('@pages/Search/SearchPage').default;
const loadSearchMoneyReportPage = () => require<ReactComponentModule>('@pages/Search/SearchMoneyRequestReportPage').default;

const Stack = createSearchFullscreenNavigator<SearchFullscreenNavigatorParamList>();

function SearchFullscreenNavigator({route}: PlatformStackScreenProps<AuthScreensParamList, typeof NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR>) {
    const rootNavigatorScreenOptions = useRootNavigatorScreenOptions();
    const searchRootScreenOptions: PlatformStackNavigationOptions = {
        ...rootNavigatorScreenOptions.fullScreen,
        web: {
            ...rootNavigatorScreenOptions.fullScreen.web,
            cardStyleInterpolator: undefined,
        },
    };
    return (
        <FreezeWrapper>
            <Stack.Navigator
                screenOptions={searchRootScreenOptions}
                defaultCentralScreen={SCREENS.SEARCH.ROOT}
                parentRoute={route}
            >
                <Stack.Screen
                    name={SCREENS.SEARCH.ROOT}
                    getComponent={loadSearchPage}
                    initialParams={{q: SearchQueryUtils.buildSearchQueryString()}}
                />
                <Stack.Screen
                    name={SCREENS.SEARCH.MONEY_REQUEST_REPORT}
                    getComponent={loadSearchMoneyReportPage}
                />
            </Stack.Navigator>
        </FreezeWrapper>
    );
}

SearchFullscreenNavigator.displayName = 'SearchFullscreenNavigator';

export default SearchFullscreenNavigator;
