import {useNavigationState} from '@react-navigation/native';
import {isFullScreenName} from '@libs/Navigation/helpers/isNavigatorName';

// Visible directly means not through the overlay. So the full screen (split navigator or search) has to be the last route on the root stack.
function useIsNavigationTabBarVisibleDirectly() {
    const isNavigationTabBarVisibleDirectly = useNavigationState((state) => isFullScreenName(state?.routes.at(-1)?.name));
    return isNavigationTabBarVisibleDirectly;
}

export default useIsNavigationTabBarVisibleDirectly;
