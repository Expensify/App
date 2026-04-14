import Navigation from '@libs/Navigation/Navigation';
import type {Route} from '@src/ROUTES';
import combineDynamicRoutePathAndSuffix from './combineDynamicRoutePathAndSuffix';
import isDynamicRouteSuffix from './isDynamicRouteSuffix';
import splitPathAndQuery from './splitPathAndQuery';

/** Adds dynamic route name (with optional query params) to the current URL and returns it */
const createDynamicRoute = (dynamicRouteSuffixWithParams: string, basePath?: string): Route => {
    const [suffixPath] = splitPathAndQuery(dynamicRouteSuffixWithParams);

    if (!suffixPath || !isDynamicRouteSuffix(suffixPath)) {
        throw new Error(`The route name ${suffixPath} is not supported in createDynamicRoute`);
    }

    const routePath = basePath ?? Navigation.getActiveRoute();
    return combineDynamicRoutePathAndSuffix(routePath, dynamicRouteSuffixWithParams);
};
export default createDynamicRoute;
