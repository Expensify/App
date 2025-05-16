import type {CommonActions, ParamListBase, RouterConfigOptions, StackActionType, StackNavigationState} from '@react-navigation/native';
import {StackRouter} from '@react-navigation/native';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import {updateLastAccessedWorkspaceSwitcher} from '@libs/actions/Policy/Policy';
import {handleSwitchPolicyIDFromSearchAction} from '@navigation/AppNavigator/createRootStackNavigator/GetStateForActionHandlers';
import type {RootStackNavigatorAction, SwitchPolicyIdActionType} from '@navigation/AppNavigator/createRootStackNavigator/types';
import CONST from '@src/CONST';
import {getPreservedNavigatorState} from '@navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';
import type SearchFullscreenNavigatorRouterOptions from './types';

function isSwitchPolicyIdAction(action: RootStackNavigatorAction): action is SwitchPolicyIdActionType {
    return action.type === CONST.NAVIGATION.ACTION_TYPE.SWITCH_POLICY_ID;
}

function SearchFullscreenRouter(options: SearchFullscreenNavigatorRouterOptions) {
    const stackRouter = StackRouter(options);
    const {setActiveWorkspaceID: setActiveWorkspaceIDUtils} = useActiveWorkspace();
    const setActiveWorkspaceID = (workspaceID: string | undefined) => {
        setActiveWorkspaceIDUtils?.(workspaceID);
        updateLastAccessedWorkspaceSwitcher(workspaceID);
    };

    return {
        ...stackRouter,
        getStateForAction(state: StackNavigationState<ParamListBase>, action: CommonActions.Action | StackActionType, configOptions: RouterConfigOptions) {
            if (isSwitchPolicyIdAction(action)) {
                return handleSwitchPolicyIDFromSearchAction(state, action, configOptions, stackRouter, setActiveWorkspaceID);
            }
            return stackRouter.getStateForAction(state, action, configOptions);
        },
        getInitialState({routeNames, routeParamList, routeGetIdList}: RouterConfigOptions) {
            const preservedState = getPreservedNavigatorState(options.parentRoute.key);
            return preservedState ?? stackRouter.getInitialState({routeNames, routeParamList, routeGetIdList});
        },
    };
}

export default SearchFullscreenRouter;
