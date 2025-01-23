import {useNavigationState} from '@react-navigation/native';
import getTopmostRouteName from '@libs/Navigation/helpers/getTopmostRouteName';
import SCREENS from '@src/SCREENS';

/** Determine if the current route is the home screen */
function useIsCurrentRouteHome() {
    const activeRoute = useNavigationState(getTopmostRouteName);
    const isActiveRouteHome = activeRoute === SCREENS.HOME;
    return isActiveRouteHome;
}

export default useIsCurrentRouteHome;
