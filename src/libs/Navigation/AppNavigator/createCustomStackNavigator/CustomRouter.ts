import {ParamListBase, PartialState, RouterConfigOptions, StackNavigationState, StackRouter} from '@react-navigation/native';
import {ResponsiveStackNavigatorRouterOptions} from '@libs/Navigation/AppNavigator/types';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

type MutableState = {
    index: number;
    stale: true;
};

type State = Omit<PartialState<StackNavigationState<ParamListBase>>, 'stale'> & MutableState;

const isAtLeastOneCentralPaneNavigatorInState = (state: State): boolean => !!state.routes.find((r) => r.name === NAVIGATORS.CENTRAL_PANE_NAVIGATOR);

/**
 * @param state - react-navigation state
 * @returns
 */
const getTopMostReportIDFromRHP = (state: State): string => {
    if (!state) {
        return '';
    }
    const topmostRightPane = [...state.routes].reverse().find((route) => route.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR);

    if (topmostRightPane) {
        // TODO: fix TS issue
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return getTopMostReportIDFromRHP(topmostRightPane.state);
    }

    const topmostRoute = state.routes[state.routes.length - 1];

    if (topmostRoute.state) {
        // TODO: fix TS issue
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return getTopMostReportIDFromRHP(topmostRoute.state);
    }

    // TODO: fix TS issue
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (topmostRoute.params?.reportID) {
        // TODO: fix TS issue
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return topmostRoute.params.reportID;
    }

    return '';
};
/**
 * Adds report route without any specific reportID to the state.
 * The report screen will self set proper reportID param based on the helper function findLastAccessedReport (look at ReportScreenWrapper for more info)
 */
const addCentralPaneNavigatorRoute = (state: State) => {
    const reportID = getTopMostReportIDFromRHP(state);
    const centralPaneNavigatorRoute = {
        name: NAVIGATORS.CENTRAL_PANE_NAVIGATOR,
        state: {
            routes: [
                {
                    name: SCREENS.REPORT,
                    params: {
                        reportID,
                    },
                },
            ],
        },
    };
    state.routes.splice(1, 0, centralPaneNavigatorRoute);
    // eslint-disable-next-line no-param-reassign
    state.index = state.routes.length - 1;
};

function CustomRouter(options: ResponsiveStackNavigatorRouterOptions) {
    const stackRouter = StackRouter(options);

    return {
        ...stackRouter,
        getRehydratedState(partialState: State, {routeNames, routeParamList, routeGetIdList}: RouterConfigOptions) {
            // Make sure that there is at least one CentralPaneNavigator (ReportScreen by default) in the state if this is a wide layout
            if (!isAtLeastOneCentralPaneNavigatorInState(partialState) && !options.getIsSmallScreenWidth()) {
                // If we added a route we need to make sure that the state.stale is true to generate new key for this route
                // eslint-disable-next-line no-param-reassign
                partialState.stale = true;
                addCentralPaneNavigatorRoute(partialState);
            }
            const state = stackRouter.getRehydratedState(partialState, {routeNames, routeParamList, routeGetIdList});
            return state;
        },
    };
}

export default CustomRouter;
