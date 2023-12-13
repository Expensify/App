import {RouterConfigOptions, StackNavigationState, StackRouter} from '@react-navigation/native';
import {ParamListBase} from '@react-navigation/routers';
import getIsSmallScreenWidth from '@libs/getIsSmallScreenWidth';
import getMatchingCentralPaneRouteForState from '@libs/Navigation/getMatchingCentralPaneRouteForState';
import getTopmostBottomTabRoute from '@libs/Navigation/getTopmostBottomTabRoute';
import getTopmostCentralPaneRoute from '@libs/Navigation/getTopmostCentralPaneRoute';
import TAB_TO_CENTRAL_PANE_MAPPING from '@libs/Navigation/TAB_TO_CENTRAL_PANE_MAPPING';
import {RootStackParamList, State} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';
import type {ResponsiveStackNavigatorRouterOptions} from './types';

/**
 * Adds report route without any specific reportID to the state.
 * The report screen will self set proper reportID param based on the helper function findLastAccessedReport (look at ReportScreenWrapper for more info)
 *
 * @param state - react-navigation state
 */
const addCentralPaneNavigatorRoute = (state: State<RootStackParamList>) => {
    const matchingCentralPaneRoute = getMatchingCentralPaneRouteForState(state);

    const bottomTabRoute = state.routes.filter((route) => route.name === NAVIGATORS.BOTTOM_TAB_NAVIGATOR);
    const centralPaneRoutes = state.routes.filter((route) => route.name === NAVIGATORS.CENTRAL_PANE_NAVIGATOR);

    // TODO-IDEAL Both RHP and LHP add condition for the LHP
    const modalRoutes = state.routes.filter((route) => route.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR);

    const centralPaneNavigatorRoute = {
        name: NAVIGATORS.CENTRAL_PANE_NAVIGATOR,
        params: {
            screen: matchingCentralPaneRoute.name,
            params: matchingCentralPaneRoute.params,
        },
    };

    // @ts-expect-error Updating read only property
    // noinspection JSConstantReassignment
    state.routes = [...bottomTabRoute, ...centralPaneRoutes, centralPaneNavigatorRoute, ...modalRoutes]; // eslint-disable-line

    // @ts-expect-error Updating read only property
    // noinspection JSConstantReassignment
    state.index = state.routes.length - 1; // eslint-disable-line
};

function CustomRouter(options: ResponsiveStackNavigatorRouterOptions) {
    const stackRouter = StackRouter(options);

    return {
        ...stackRouter,
        getRehydratedState(partialState: StackNavigationState<RootStackParamList>, {routeNames, routeParamList, routeGetIdList}: RouterConfigOptions): StackNavigationState<ParamListBase> {
            const isSmallScreenWidth = getIsSmallScreenWidth();
            // Make sure that there is at least one CentralPaneNavigator (ReportScreen by default) in the state if this is a wide layout
            const topmostCentralPaneRoute = getTopmostCentralPaneRoute(partialState);
            const topmostBottomTabRoute = getTopmostBottomTabRoute(partialState);

            const isBottomTabMatchingCentralPane = topmostCentralPaneRoute && TAB_TO_CENTRAL_PANE_MAPPING[topmostBottomTabRoute.name].includes(topmostCentralPaneRoute.name);

            if (!isSmallScreenWidth && !isBottomTabMatchingCentralPane) {
                // If we added a route we need to make sure that the state.stale is true to generate new key for this route
                // @ts-expect-error Updating read only property
                // noinspection JSConstantReassignment
                partialState.stale = true; // eslint-disable-line
                addCentralPaneNavigatorRoute(partialState);
            }
            const state = stackRouter.getRehydratedState(partialState, {routeNames, routeParamList, routeGetIdList});
            return state;
        },
    };
}

export default CustomRouter;
