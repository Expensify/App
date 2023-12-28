import {useContext} from 'react';
import ActiveRouteContext from '@libs/Navigation/AppNavigator/Navigators/ActiveRouteContext';

function useActiveRoute(): string {
    const ActiveRoute = useContext(ActiveRouteContext);

    return ActiveRoute;
}

export default useActiveRoute;
