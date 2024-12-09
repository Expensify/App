import {useNavigationState} from '@react-navigation/native';
import Log from '@libs/Log';
import type {BottomTabNavigatorParamList} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';

/**
 *  Get the currently selected policy ID stored in the navigation state. This hook should only be called only from screens in BottomTab.
 *  Differences between this hook and useActiveWorkspace:
 *  - useActiveWorkspaceFromNavigationState reads the active workspace id directly from the navigation state, it's a bit slower than useActiveWorkspace and it can be called only from BottomTabScreens.
 *    It allows to read a value of policyID immediately after the update.
 *  - useActiveWorkspace allows to read the current policyID anywhere, it's faster because it doesn't require searching in the navigation state.
 */
function useActiveWorkspaceFromNavigationState() {
    // The last policyID value is always stored in the last route in BottomTabNavigator.
    const activeWorkspaceID = useNavigationState<BottomTabNavigatorParamList, string | undefined>((state) => {
        // SCREENS.HOME is a screen located in the BottomTabNavigator, if it's not in state.routeNames it means that this hook was called from a screen in another navigator.
        if (!state.routeNames.includes(SCREENS.HOME)) {
            Log.warn('useActiveWorkspaceFromNavigationState should be called only from BottomTab screens');
        }

        const params = state.routes.at(-1)?.params ?? {};

        if ('policyID' in params) {
            return params?.policyID;
        }
    });

    return activeWorkspaceID;
}

export default useActiveWorkspaceFromNavigationState;
