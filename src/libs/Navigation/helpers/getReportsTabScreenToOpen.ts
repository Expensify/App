import type {NavigatorScreenParams} from '@react-navigation/native';
import {getPreservedNavigatorState} from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';
import type {AuthScreensParamList, NavigationPartialRoute, SearchFullscreenNavigatorParamList, State} from '@libs/Navigation/types';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import type {SearchTypeMenuSection} from '@libs/SearchUIUtils';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import type {SaveSearch} from '@src/types/onyx';

export default function getReportsTabScreenToOpen(
    rootState: State<AuthScreensParamList>,
    typeMenuSections: SearchTypeMenuSection[],
    savedSearches: SaveSearch | undefined,
): NavigatorScreenParams<SearchFullscreenNavigatorParamList> {
    const lastSearchNavigator = rootState.routes.findLast((route) => route.name === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);
    const lastSearchNavigatorState = lastSearchNavigator && lastSearchNavigator.key ? getPreservedNavigatorState(lastSearchNavigator?.key) : undefined;
    const lastSearchRoute = lastSearchNavigatorState?.routes.at(-1) as NavigationPartialRoute<keyof SearchFullscreenNavigatorParamList> | undefined;

    if (lastSearchRoute?.name === SCREENS.SEARCH.ROOT && lastSearchRoute?.params) {
        const params = lastSearchRoute.params as SearchFullscreenNavigatorParamList[typeof SCREENS.SEARCH.ROOT];
        return {screen: SCREENS.SEARCH.ROOT, params};
    }

    const nonExploreTypeQuery = typeMenuSections.at(0)?.menuItems.at(0)?.searchQuery;
    const savedSearchQuery = Object.values(savedSearches ?? {}).at(0)?.query;
    return {screen: SCREENS.SEARCH.ROOT, params: {q: nonExploreTypeQuery ?? savedSearchQuery ?? buildCannedSearchQuery()}};
}
