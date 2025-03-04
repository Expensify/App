import React from 'react';
import type {SearchFullscreenNavigatorParamList} from '@libs/Navigation/types';
import * as SearchQueryUtils from '@libs/SearchQueryUtils';
import createSearchFullscreenNavigator from '@navigation/AppNavigator/createSearchFullscreenNavigator';
import FreezeWrapper from '@navigation/AppNavigator/FreezeWrapper';
import useRootNavigatorScreenOptions from '@navigation/AppNavigator/useRootNavigatorScreenOptions';
import SCREENS from '@src/SCREENS';
import type ReactComponentModule from '@src/types/utils/ReactComponentModule';

const loadSearchPage = () => require<ReactComponentModule>('@pages/Search/SearchPage').default;
const loadSearchMoneyReportPage = () => require<ReactComponentModule>('@pages/Search/SearchMoneyRequestReportPage').default;

const Stack = createSearchFullscreenNavigator<SearchFullscreenNavigatorParamList>();

function SearchFullscreenNavigator() {
    const rootNavigatorScreenOptions = useRootNavigatorScreenOptions();

    return (
        <FreezeWrapper>
            <Stack.Navigator
                screenOptions={rootNavigatorScreenOptions.fullScreen}
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

SearchFullscreenNavigator.displayName = 'SearchFullscreenNavigator';

export default SearchFullscreenNavigator;
