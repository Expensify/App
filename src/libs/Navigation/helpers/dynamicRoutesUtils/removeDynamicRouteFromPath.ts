import type {DynamicRouteSuffix, Route} from '@src/ROUTES';

import findAllMatchingDynamicSuffixes from './findAllMatchingDynamicSuffixes';
import getPathWithoutDynamicSuffix from './getPathWithoutDynamicSuffix';

/**
 * Removes the given dynamic suffix from the end of a path.
 *
 * @returns The path without the suffix, or undefined if the path does not end with it.
 */
function removeDynamicRouteFromPath(path: string, dynamicRouteSuffix: DynamicRouteSuffix): Route | undefined {
    const pathWithoutLeadingSlash = path.replaceAll(/^\/+/g, '');
    const match = findAllMatchingDynamicSuffixes(pathWithoutLeadingSlash).find((m) => m.pattern === dynamicRouteSuffix);
    if (!match) {
        return undefined;
    }

    return getPathWithoutDynamicSuffix(match.pathUsedForMatching, match.actualSuffix, match.pattern);
}

export default removeDynamicRouteFromPath;
