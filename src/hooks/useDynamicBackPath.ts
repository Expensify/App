import stripDynamicRouteSuffixFromPath from '@libs/Navigation/helpers/dynamicRoutesUtils/stripDynamicRouteSuffixFromPath';
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
 * @param isEnabled - Pass false from a caller that discards the result, to skip the work behind it. Serializing the
 * navigation tree and matching every suffix against it runs on each navigation event, for each mounted caller.
 * @returns The back path for the dynamic route.
 */
function useDynamicBackPath(dynamicRouteSuffix: DynamicRouteSuffix, isEnabled = true): Route {
    const path = useRootNavigationState((state) => {
        if (!isEnabled || !state) {
            return undefined;
        }

        return getPathFromState(state as State);
    });

    if (!path) {
        return ROUTES.HOME;
    }

    return stripDynamicRouteSuffixFromPath(path, dynamicRouteSuffix);
}

export default useDynamicBackPath;
