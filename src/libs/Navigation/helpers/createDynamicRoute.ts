import {findFocusedRoute, getPathFromState} from '@react-navigation/native';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import type {DynamicRoute, Route} from '@src/ROUTES';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

/** Adds dynamic route name to the current URL and returns it */
const createDynamicRoute = (dynamicRouteName: DynamicRoute): Route => {
    if (!Object.values(DYNAMIC_ROUTES).includes(dynamicRouteName)) {
        throw new Error(`The route name ${dynamicRouteName} is not supported in createDynamicRoute`);
    }
    const activeRoute = Navigation.getActiveRoute();
    const [path, params] = activeRoute.split('?');
    let dynamicRoute = path.endsWith('/') ? `${path}${dynamicRouteName}` : `${path}/${dynamicRouteName}`;
    if (params) {
        dynamicRoute += `?${params}`;
    }
    return dynamicRoute as Route;
};

export default createDynamicRoute;
