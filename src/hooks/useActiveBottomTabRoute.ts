import {useContext} from 'react';
import ActiveBottomTabRouteContext from '@libs/Navigation/AppNavigator/Navigators/ActiveBottomTabRouteContext';

function useActiveBottomTabRoute() {
    return useContext(ActiveBottomTabRouteContext);
}

export default useActiveBottomTabRoute;
