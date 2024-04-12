import {useNavigationState} from '@react-navigation/native';
import type {BottomTabNavigatorParamList} from '@libs/Navigation/types';

/**
 *  Get the currently selected policy ID stored in the navigation state. This hook should only be called only from screens in BottomTab.
 */
function useActiveWorkspaceFromNavigationState() {
    // The last policyID value is always stored in the last route in BottomTabNavigator.
    const activeWorkpsaceID = useNavigationState<BottomTabNavigatorParamList, string | undefined>((state) => state.routes.at(-1)?.params?.policyID);

    return activeWorkpsaceID;
}

export default useActiveWorkspaceFromNavigationState;
