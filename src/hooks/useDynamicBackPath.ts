import findMatchingDynamicSuffix from '@libs/Navigation/helpers/dynamicRoutesUtils/findMatchingDynamicSuffix';
import getPathWithoutDynamicSuffix from '@libs/Navigation/helpers/dynamicRoutesUtils/getPathWithoutDynamicSuffix';
import getPathFromState from '@libs/Navigation/helpers/getPathFromState';
import type {State} from '@libs/Navigation/types';
import type {DynamicRouteSuffix, Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import useRootNavigationState from './useRootNavigationState';

/**
 * Removes the given dynamic suffix from the end of the current URL to produce a "back" path.
 *
 * Supported suffix types: static (`/edit`), parametric (`/:reportID`),
 * and parametric with optional params (`/:reportID/:reportActionID?`).
 *
 * If the suffix doesn't match the tail of the current path, returns the path as-is.
 *
 * @param dynamicRouteSuffix - The dynamic route pattern to remove from the current URL.
 * @returns The back path for the dynamic route.
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

    const pathWithoutLeadingSlash = path.replaceAll(/^\/+/g, '');
    const match = findMatchingDynamicSuffix(pathWithoutLeadingSlash);
    if (match && match.pattern === dynamicRouteSuffix) {
        return getPathWithoutDynamicSuffix(pathWithoutLeadingSlash, match.actualSuffix, match.pattern);
    }

    return pathWithoutLeadingSlash as Route;
}

export default useDynamicBackPath;
