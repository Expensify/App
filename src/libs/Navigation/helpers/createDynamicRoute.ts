import Navigation from '@libs/Navigation/Navigation';
import type {DynamicRouteSuffix, Route} from '@src/ROUTES';
import isDynamicRouteSuffix from './isDynamicRouteSuffix';

/** Adds dynamic route name to the current URL and returns it */
const createDynamicRoute = (dynamicRouteSuffix: DynamicRouteSuffix): Route => {
    if (!isDynamicRouteSuffix(dynamicRouteSuffix)) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
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
