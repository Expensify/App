import {useNavigationState} from '@react-navigation/native';
import getPathFromState from '@libs/Navigation/helpers/getPathFromState';
import splitPathAndQuery from '@libs/Navigation/helpers/splitPathAndQuery';
import type {DynamicRouteSuffix, Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';

/**
 * Returns the back path for a dynamic route by removing the dynamic suffix from the current URL.
 * Only removes the suffix if it's the last segment of the path (ignoring trailing slashes and query parameters).
 * @param dynamicRouteSuffix The dynamic route suffix to remove from the current path
 * @returns The back path without the dynamic route suffix, or HOME if path is null/undefined
 */
function useDynamicBackPath(dynamicRouteSuffix: DynamicRouteSuffix): Route {
    const path = useNavigationState((state) => getPathFromState(state));

    if (!path) {
        return ROUTES.HOME;
    }

    const [normalizedPath, query] = splitPathAndQuery(path);

    if (normalizedPath?.endsWith(`/${dynamicRouteSuffix}`)) {
        const backPathWithoutQuery = normalizedPath.slice(0, -(dynamicRouteSuffix.length + 1));
        const backPath = `${backPathWithoutQuery}${query ? `?${query}` : ''}`;

        return backPath as Route;
    }

    // If suffix is not the last segment, return the original path
    return path as Route;
}

export default useDynamicBackPath;
