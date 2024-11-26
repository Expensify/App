import type {NavigationState, PartialState} from '@react-navigation/native';
import LHN_TO_SPLIT_NAVIGATOR_NAME from '@libs/Navigation/linkingConfig/RELATIONS/LHN_TO_SPLIT_NAVIGATOR_MAPPING';
import type {NavigationPartialRoute, SplitNavigatorByLHN, SplitNavigatorParamListType, SplitNavigatorSidebarScreen} from '@libs/Navigation/types';

type ExtractRouteType<T extends SplitNavigatorSidebarScreen> = Extract<keyof SplitNavigatorParamListType[(typeof LHN_TO_SPLIT_NAVIGATOR_NAME)[T]], string>;

// The function getPathFromState that we are using in some places isn't working correctly without defined index.
const getRoutesWithIndex = (routes: NavigationPartialRoute[]): PartialState<NavigationState> => ({routes, index: routes.length - 1});

function createSplitNavigator<T extends SplitNavigatorSidebarScreen>(
    splitNavigatorLHN: NavigationPartialRoute<T>,
    route?: NavigationPartialRoute<ExtractRouteType<T>>,
    splitNavigatorParams?: Record<string, string>,
): NavigationPartialRoute<SplitNavigatorByLHN<T>> {
    const routes = [];

    routes.push(splitNavigatorLHN);

    if (route) {
        routes.push(route);
    }
    return {
        name: LHN_TO_SPLIT_NAVIGATOR_NAME[splitNavigatorLHN.name],
        state: getRoutesWithIndex(routes),
        params: splitNavigatorParams,
    };
}

export default createSplitNavigator;
