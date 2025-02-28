import React from 'react';
import type {SearchFullscreenNavigatorParamList} from '@libs/Navigation/types';
import * as SearchQueryUtils from '@libs/SearchQueryUtils';
import FreezeWrapper from '@navigation/AppNavigator/FreezeWrapper';
import createPlatformStackNavigator from '@navigation/PlatformStackNavigation/createPlatformStackNavigator';
import SCREENS from '@src/SCREENS';
import type ReactComponentModule from '@src/types/utils/ReactComponentModule';

const loadSearchPage = () => require<ReactComponentModule>('@pages/Search/SearchPage').default;
const loadSearchMoneyReportPage = () => require<ReactComponentModule>('@pages/Search/SearchMoneyRequestReportPage').default;

const Stack = createPlatformStackNavigator<SearchFullscreenNavigatorParamList>();

function SearchNavigator() {
    return (
        <FreezeWrapper>
            <Stack.Navigator
                screenOptions={{headerShown: false}}
                defaultCentralScreen={SCREENS.SEARCH.ROOT}
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

SearchNavigator.displayName = 'SearchNavigator';

export default SearchNavigator;
