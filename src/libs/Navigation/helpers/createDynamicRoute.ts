import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import type {DynamicRouteSuffix, Route} from '@src/ROUTES';
import isDynamicRouteSuffix from './isDynamicRouteSuffix';
import splitPathAndQuery from './splitPathAndQuery';

const combinePathAndSuffix = (path: string, suffix: string): Route => {
    const [normalizedPath, query] = splitPathAndQuery(path);

    // This should never happen as the path should always be defined
    if (!normalizedPath) {
        Log.warn('[createDynamicRoute.ts] Path is undefined or empty, returning suffix only', {path, suffix});
        return suffix as Route;
    }

    let newPath = normalizedPath === '/' ? `/${suffix}` : `${normalizedPath}/${suffix}`;

    if (query) {
        newPath += `?${query}`;
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
