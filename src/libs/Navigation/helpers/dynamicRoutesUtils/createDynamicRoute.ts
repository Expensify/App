import Navigation from '@libs/Navigation/Navigation';
import type {Route} from '@src/ROUTES';
import combineDynamicRoutePathAndSuffix from './combineDynamicRoutePathAndSuffix';
import isDynamicRouteSuffix from './isDynamicRouteSuffix';
import splitPathAndQuery from './splitPathAndQuery';

/** Adds dynamic route name (with optional query params) to the current URL and returns it */
const createDynamicRoute = (dynamicRouteSuffixWithParams: string): Route => {
    const [suffixPath] = splitPathAndQuery(dynamicRouteSuffixWithParams);

    if (!suffixPath || !isDynamicRouteSuffix(suffixPath)) {
        throw new Error(`The route name ${suffixPath} is not supported in createDynamicRoute`);
    }

    const activeRoute = Navigation.getActiveRoute();
    return combineDynamicRoutePathAndSuffix(activeRoute, dynamicRouteSuffixWithParams);
};
export default createDynamicRoute;
