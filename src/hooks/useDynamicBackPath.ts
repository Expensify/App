import getPathWithoutDynamicSuffix from '@libs/Navigation/helpers/dynamicRoutesUtils/getPathWithoutDynamicSuffix';
import matchPathPattern from '@libs/Navigation/helpers/dynamicRoutesUtils/matchPathPattern';
import splitPathAndQuery from '@libs/Navigation/helpers/dynamicRoutesUtils/splitPathAndQuery';
import getPathFromState from '@libs/Navigation/helpers/getPathFromState';
import type {State} from '@libs/Navigation/types';
import type {DynamicRouteSuffix, Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import useRootNavigationState from './useRootNavigationState';

/**
 * Returns the back path for a dynamic route by removing the dynamic suffix from the current URL.
 * Supports both static suffixes (exact string match) and parametric suffixes (pattern matching).
 * Only removes the suffix if it's the last segment(s) of the path.
 * @param dynamicRouteSuffix - The dynamic route suffix to remove from the current URL.
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

    // Remove leading slashes for consistent processing
    const pathWithoutLeadingSlash = path.replace(/^\/+/, '');
    const [normalizedPath] = splitPathAndQuery(pathWithoutLeadingSlash);

    if (!normalizedPath) {
        return pathWithoutLeadingSlash as Route;
    }

    // Fast path: exact string match (static suffixes)
    if (normalizedPath.endsWith(`/${dynamicRouteSuffix}`)) {
        return getPathWithoutDynamicSuffix(pathWithoutLeadingSlash, dynamicRouteSuffix);
    }

    // Parametric path: take the last N segments and try pattern matching
    const patternSegmentCount = dynamicRouteSuffix.split('/').filter(Boolean).length;
    const pathSegments = normalizedPath.split('/').filter(Boolean);

    if (patternSegmentCount > 0 && patternSegmentCount <= pathSegments.length) {
        const tailSegments = pathSegments.slice(-patternSegmentCount);
        const tailCandidate = tailSegments.join('/');
        const match = matchPathPattern(tailCandidate, dynamicRouteSuffix);

        if (match) {
            return getPathWithoutDynamicSuffix(pathWithoutLeadingSlash, tailCandidate, dynamicRouteSuffix);
        }
    }

    // No match found - the suffix is not at the end of the current path.
    return pathWithoutLeadingSlash as Route;
}

export default useDynamicBackPath;
