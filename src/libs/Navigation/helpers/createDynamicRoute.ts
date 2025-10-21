import Navigation from '@libs/Navigation/Navigation';
import type {DynamicRouteSuffix, Route} from '@src/ROUTES';
import isDynamicSuffix from './isDynamicSuffix';

/** Adds dynamic route name to the current URL and returns it */
const createDynamicRoute = (dynamicRouteSuffix: DynamicRouteSuffix): Route => {
    if (!isDynamicSuffix(dynamicRouteSuffix)) {
        throw new Error(`The route name ${dynamicRouteSuffix} is not supported in createDynamicRoute`);
    }
    const activeRoute = Navigation.getActiveRoute();
    const [path, params] = activeRoute.split('?');
    let dynamicRoute = path.endsWith('/') ? `${path}${dynamicRouteSuffix}` : `${path}/${dynamicRouteSuffix}`;
    if (params) {
        dynamicRoute += `?${params}`;
    }
    return dynamicRoute as Route;
};

export default createDynamicRoute;
