import {RouterConfigOptions, StackNavigationState, StackRouter} from '@react-navigation/native';
import {ParamListBase} from '@react-navigation/routers';
import getIsSmallScreenWidth from '@libs/getIsSmallScreenWidth';
import getMatchingCentralPaneRouteForState from '@libs/Navigation/getMatchingCentralPaneRouteForState';
import getTopmostBottomTabRoute from '@libs/Navigation/getTopmostBottomTabRoute';
import getTopmostCentralPaneRoute from '@libs/Navigation/getTopmostCentralPaneRoute';
import TAB_TO_CENTRAL_PANE_MAPPING from '@libs/Navigation/TAB_TO_CENTRAL_PANE_MAPPING';
import {RootStackParamList, State} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import type {ResponsiveStackNavigatorRouterOptions} from './types';

const isAtLeastOneInState = (state: State, screenName: string): boolean => !!state.routes.find((route) => route.name === screenName);

/**
 * Adds report route without any specific reportID to the state.
 * The report screen will self set proper reportID param based on the helper function findLastAccessedReport (look at ReportScreenWrapper for more info)
 *
 * @param state - react-navigation state
 */
const addCentralPaneNavigatorRoute = (state: State<RootStackParamList>) => {
    // We only add the route if the bottom tab state is defined therefore matchingCentralPaneRoute will be defined.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const matchingCentralPaneRoute = getMatchingCentralPaneRouteForState(state)!;

    const bottomTabRoute = state.routes.filter((route) => route.name === NAVIGATORS.BOTTOM_TAB_NAVIGATOR);
    const centralPaneRoutes = state.routes.filter((route) => route.name === NAVIGATORS.CENTRAL_PANE_NAVIGATOR);
    const fullScreenRoutes = state.routes.filter((route) => route.name === NAVIGATORS.FULL_SCREEN_NAVIGATOR);

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
    state.routes = [...bottomTabRoute, ...centralPaneRoutes, centralPaneNavigatorRoute, ...fullScreenRoutes, ...modalRoutes]; // eslint-disable-line

    // @ts-expect-error Updating read only property
    // noinspection JSConstantReassignment
    state.index = state.routes.length - 1; // eslint-disable-line
};

const mapScreenNameToSettingsScreenName: Record<string, string> = {
    // [SCREENS.SETTINGS.PROFILE.CONTACT_METHODS]: SCREENS.SETTINGS.PROFILE,
};

const handleSettingsOpened = (state: State) => {
    const rhpNav = state.routes.find((route) => route.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR);
    if (!rhpNav?.state?.routes[0]) {
        return;
    }
    const screen = rhpNav.state.routes[0];
    // check if we are on settings screen
    if (screen.name !== 'Settings') {
        return;
    }
    // check if we already have settings home route
    if (isAtLeastOneInState(state, NAVIGATORS.FULL_SCREEN_NAVIGATOR)) {
        return;
    }

    const settingsScreenName = screen?.state?.routes[0].name;

    if (!settingsScreenName) {
        return;
    }

    const settingsHomeRouteName = mapScreenNameToSettingsScreenName[settingsScreenName] || SCREENS.SETTINGS.PROFILE.ROOT;

    const fullScreenRoute = {
        name: NAVIGATORS.FULL_SCREEN_NAVIGATOR,
        state: {
            routes: [
                {
                    name: SCREENS.SETTINGS.ROOT,
                },
                {
                    name: SCREENS.SETTINGS_CENTRAL_PANE,
                    state: {
                        routes: [
                            {
                                name: settingsHomeRouteName,
                            },
                        ],
                    },
                },
            ],
        },
    };
    state.routes.splice(2, 0, fullScreenRoute);
    // eslint-disable-next-line no-param-reassign, @typescript-eslint/non-nullable-type-assertion-style
    (state.index as number) = state.routes.length - 1;
    // eslint-disable-next-line no-param-reassign, @typescript-eslint/non-nullable-type-assertion-style
    (state.stale as boolean) = true;
};

function CustomRouter(options: ResponsiveStackNavigatorRouterOptions) {
    const stackRouter = StackRouter(options);

    return {
        ...stackRouter,
        getRehydratedState(partialState: StackNavigationState<RootStackParamList>, {routeNames, routeParamList, routeGetIdList}: RouterConfigOptions): StackNavigationState<ParamListBase> {
            // Make sure that there is at least one CentralPaneNavigator (ReportScreen by default) in the state if this is a wide layout
            const topmostBottomTabRoute = getTopmostBottomTabRoute(partialState);
            const isSmallScreenWidth = getIsSmallScreenWidth();

            // If we log in there is a few rehydrations where the state for the bottomTab doesn't exist yet.
            // isSmallScreen is checked here to avoid calling check functions for optimazation purposes.
            if (topmostBottomTabRoute && !isSmallScreenWidth) {
                const topmostCentralPaneRoute = getTopmostCentralPaneRoute(partialState);
                const isBottomTabMatchingCentralPane = topmostCentralPaneRoute && TAB_TO_CENTRAL_PANE_MAPPING[topmostBottomTabRoute.name].includes(topmostCentralPaneRoute.name);

                if (!isBottomTabMatchingCentralPane) {
                    // If we added a route we need to make sure that the state.stale is true to generate new key for this route
                    // @ts-expect-error Updating read only property
                    // noinspection JSConstantReassignment
                    partialState.stale = true; // eslint-disable-line
                    addCentralPaneNavigatorRoute(partialState);
                }
            }
            handleSettingsOpened(partialState);
            const state = stackRouter.getRehydratedState(partialState, {routeNames, routeParamList, routeGetIdList});
            return state;
        },
    };
}

export default CustomRouter;
