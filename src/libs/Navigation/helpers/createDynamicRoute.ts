import {findFocusedRoute, useNavigationState} from '@react-navigation/native';
import type {Route} from '@src/ROUTES';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

/** Adds dynamic route name to the current URL and returns it */
const createDynamicRoute = (dynamicRouteName: string): Route => {
    if (!Object.values(DYNAMIC_ROUTES).includes(dynamicRouteName)) {
        throw new Error(`The route name ${dynamicRouteName} is not supported in createDynamicRoute`);
    }
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const state = useNavigationState((focusedRoute) => findFocusedRoute(focusedRoute));
    const activeRoute = state?.path ?? '';
    const [path, params] = activeRoute.split('?');
    let dynamicRoute = path.endsWith('/') ? `${path}${dynamicRouteName}` : `${path}/${dynamicRouteName}`;
    if (params) {
        dynamicRoute += `?${params}`;
    }
    return dynamicRoute as Route;
};

export default createDynamicRoute;
