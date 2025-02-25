import type {NavigationState, PartialState} from '@react-navigation/native';
import {SIDEBAR_TO_SPLIT} from '@libs/Navigation/linkingConfig/RELATIONS';
import type {NavigationPartialRoute, SplitNavigatorBySidebar, SplitNavigatorParamListType, SplitNavigatorSidebarScreen} from '@libs/Navigation/types';

type ExtractRouteType<T extends SplitNavigatorSidebarScreen> = Extract<keyof SplitNavigatorParamListType[(typeof SIDEBAR_TO_SPLIT)[T]], string>;

// The function getPathFromState that we are using in some places isn't working correctly without defined index.
const getRoutesWithIndex = (routes: NavigationPartialRoute[]): PartialState<NavigationState> => ({routes, index: routes.length - 1});

function getInitialSplitNavigatorState<T extends SplitNavigatorSidebarScreen>(
    splitNavigatorSidebarRoute: NavigationPartialRoute<T>,
    route?: NavigationPartialRoute<ExtractRouteType<T>>,
    splitNavigatorParams?: Record<string, string>,
): NavigationPartialRoute<SplitNavigatorBySidebar<T>> {
    const routes = [];

    routes.push(splitNavigatorSidebarRoute);

    if (route) {
        routes.push(route);
    }
    return {
        name: SIDEBAR_TO_SPLIT[splitNavigatorSidebarRoute.name],
        state: getRoutesWithIndex(routes),
        params: splitNavigatorParams,
    };
}

export default getInitialSplitNavigatorState;
