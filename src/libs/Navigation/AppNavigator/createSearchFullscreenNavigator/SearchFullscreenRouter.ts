import navigationRef from '@libs/Navigation/navigationRef';
import {getSearchRootParamsFromRootState} from '@libs/SearchQueryUtils';

import {getPreservedNavigatorState} from '@navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';

import SCREENS from '@src/SCREENS';

import type {ParamListBase, RouterConfigOptions, StackNavigationState} from '@react-navigation/native';

import {StackRouter} from '@react-navigation/native';

import type SearchFullscreenNavigatorRouterOptions from './types';

/**
 * Seeds the Search root of a freshly mounted Search navigator with the query of the last Search navigator.
 *
 * On native, a pushed tab navigator (for example from "Go to room") mounts every tab in the background, so its
 * Spend tab mounts with the default `q`. That default would then be reported as the current query and saved as
 * the last search by the Spend page underneath, which drops the user's filters. Starting from the last Search
 * navigator's query keeps them. When no Search navigator has a query, the initial state is returned unchanged.
 */
function getInitialStateWithLastSearchQuery(initialState: StackNavigationState<ParamListBase>): StackNavigationState<ParamListBase> {
    if (!navigationRef.isReady()) {
        return initialState;
    }

    const lastSearchRootParams = getSearchRootParamsFromRootState(navigationRef.getRootState(), false);
    if (!lastSearchRootParams) {
        return initialState;
    }

    return {
        ...initialState,
        routes: initialState.routes.map((route) => (route.name === SCREENS.SEARCH.ROOT ? {...route, params: lastSearchRootParams} : route)),
    };
}

function SearchFullscreenRouter(options: SearchFullscreenNavigatorRouterOptions) {
    const stackRouter = StackRouter(options);

    return {
        ...stackRouter,
        getInitialState({routeNames, routeParamList, routeGetIdList}: RouterConfigOptions) {
            const preservedState = getPreservedNavigatorState(options.parentRoute.key);
            return preservedState ?? getInitialStateWithLastSearchQuery(stackRouter.getInitialState({routeNames, routeParamList, routeGetIdList}));
        },
    };
}

export default SearchFullscreenRouter;
