import type {NavigationState, PartialState} from '@react-navigation/native';
import type {NavigationPartialRoute, SplitNavigatorByLHN, SplitNavigatorLHNScreen, SplitNavigatorParamListType} from '@libs/Navigation/types';
import LHN_TO_SPLIT_NAVIGATOR_NAME from './LHN_TO_SPLIT_NAVIGATOR_MAPPING';

type ExtractRouteType<T extends SplitNavigatorLHNScreen> = Extract<keyof SplitNavigatorParamListType[(typeof LHN_TO_SPLIT_NAVIGATOR_NAME)[T]], string>;

// The function getPathFromState that we are using in some places isn't working correctly without defined index.
const getRoutesWithIndex = (routes: NavigationPartialRoute[]): PartialState<NavigationState> => ({routes, index: routes.length - 1});

function createSplitNavigator<T extends SplitNavigatorLHNScreen>(
    splitNavigatorLHN: NavigationPartialRoute<T>,
    route?: NavigationPartialRoute<ExtractRouteType<T>>,
    splitNavigatorParams?: SplitNavigatorParamListType[SplitNavigatorByLHN<T>],
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
