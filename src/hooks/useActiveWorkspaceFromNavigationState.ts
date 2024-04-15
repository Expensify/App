import {useNavigationState} from '@react-navigation/native';
import Log from '@libs/Log';
import type {BottomTabNavigatorParamList} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';

/**
 *  Get the currently selected policy ID stored in the navigation state. This hook should only be called only from screens in BottomTab.
 */
function useActiveWorkspaceFromNavigationState() {
    // The last policyID value is always stored in the last route in BottomTabNavigator.
    const activeWorkpsaceID = useNavigationState<BottomTabNavigatorParamList, string | undefined>((state) => {
        // SCREENS.HOME is a screen located in the BottomTabNavigator, if it's not in state.routeNames it means that this hook was called from a screen in another navigator.
        if (!state.routeNames.includes(SCREENS.HOME)) {
            Log.warn('useActiveWorkspaceFromNavigationState should be called only from BottomTab screens');
        }

        return state.routes.at(-1)?.params?.policyID;
    });

    return activeWorkpsaceID;
}

export default useActiveWorkspaceFromNavigationState;
