import {StackRouter, RouterConfigOptions, ParamListBase, StackNavigationState, PartialState} from '@react-navigation/native';
import NAVIGATORS from '../../../../NAVIGATORS';
import {ResponsiveStackNavigatorRouterOptions} from '../types';

type MutableState = {
    index: number;
    stale: true;
};

type State = Omit<PartialState<StackNavigationState<ParamListBase>>, 'stale'> & MutableState;

const isAtLeastOneCentralPaneNavigatorInState = (state: State): boolean => !!state.routes.find((r) => r.name === NAVIGATORS.CENTRAL_PANE_NAVIGATOR);

/**
 * Adds report route without any specific reportID to the state.
 * The report screen will self set proper reportID param based on the helper function findLastAccessedReport (look at ReportScreenWrapper for more info)
 */
const addCentralPaneNavigatorRoute = (state: State) => {
    state.routes.splice(1, 0, {name: NAVIGATORS.CENTRAL_PANE_NAVIGATOR});
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
