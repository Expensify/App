import {useContext} from 'react';
import ActiveRouteContext from '@libs/Navigation/AppNavigator/Navigators/ActiveRouteContext';

function useActiveRoute(): string {
    return useContext(ActiveRouteContext);
}

export default useActiveRoute;
