import getPathFromState from '@libs/Navigation/helpers/getPathFromState';
import splitPathAndQuery from '@libs/Navigation/helpers/splitPathAndQuery';
import type {State} from '@libs/Navigation/types';
import type {DynamicRouteSuffix, Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import useRootNavigationState from './useRootNavigationState';

/**
 * Returns the back path for a dynamic route by removing the dynamic suffix from the current URL.
 * Only removes the suffix if it's the last segment of the path (ignoring trailing slashes and query parameters).
 * @param dynamicRouteSuffix The dynamic route suffix to remove from the current path
 * @returns The back path without the dynamic route suffix, or HOME if path is null/undefined
 */
function useDynamicBackPath(dynamicRouteSuffix: DynamicRouteSuffix): Route {
    const path = useRootNavigationState((state) => {
        if (!state) {
            return undefined;
        }

        return getPathFromState(state as State);
    });

    if (!path) {
        return ROUTES.HOME;
    }

    // Remove leading slashes for consistent processing
    const pathWithoutLeadingSlash = path.replace(/^\/+/, '');

    const [normalizedPath, query] = splitPathAndQuery(pathWithoutLeadingSlash);

    if (normalizedPath?.endsWith(`/${dynamicRouteSuffix}`)) {
        const backPathWithoutQuery = normalizedPath.slice(0, -(dynamicRouteSuffix.length + 1));
        const backPath = `${backPathWithoutQuery}${query ? `?${query}` : ''}`;

        return backPath as Route;
    }

    // If suffix is not the last segment, return the original path
    return pathWithoutLeadingSlash as Route;
}

export default useDynamicBackPath;
