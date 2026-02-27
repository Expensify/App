import Navigation from '@libs/Navigation/Navigation';
import type {DynamicRouteSuffix, Route} from '@src/ROUTES';
import isDynamicRouteSuffix from './isDynamicRouteSuffix';

const combinePathAndSuffix = (path: string, suffix: string): Route => {
    const [basePath, params] = path.split('?');
    let newPath = basePath.endsWith('/') ? `${basePath}${suffix}` : `${basePath}/${suffix}`;

    if (params) {
        newPath += `?${params}`;
    }
    return newPath as Route;
};

/** Adds dynamic route name to the current URL and returns it */
const createDynamicRoute = (dynamicRouteSuffix: DynamicRouteSuffix): Route => {
    if (!isDynamicRouteSuffix(dynamicRouteSuffix)) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw new Error(`The route name ${dynamicRouteSuffix} is not supported in createDynamicRoute`);
    }

    const activeRoute = Navigation.getActiveRoute();
    return combinePathAndSuffix(activeRoute, dynamicRouteSuffix);
};

export default createDynamicRoute;
