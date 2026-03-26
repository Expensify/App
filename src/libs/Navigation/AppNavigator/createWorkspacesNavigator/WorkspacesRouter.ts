import type {RouterConfigOptions} from '@react-navigation/native';
import {StackRouter} from '@react-navigation/native';
import {getPreservedNavigatorState} from '@navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';
import type WorkspacesNavigatorRouterOptions from './types';

function WorkspacesRouter(options: WorkspacesNavigatorRouterOptions) {
    const stackRouter = StackRouter(options);

    return {
        ...stackRouter,
        getInitialState({routeNames, routeParamList, routeGetIdList}: RouterConfigOptions) {
            const preservedState = getPreservedNavigatorState(options.parentRoute.key);
            return preservedState ?? stackRouter.getInitialState({routeNames, routeParamList, routeGetIdList});
        },
    };
}

export default WorkspacesRouter;
