import type {DynamicRouteSuffix, Route} from '@src/ROUTES';

import findAllMatchingDynamicSuffixes from './findAllMatchingDynamicSuffixes';
import getPathWithoutDynamicSuffix from './getPathWithoutDynamicSuffix';

/**
 * Removes the given dynamic suffix from the end of a path, if present.
 *
 * Supported suffix types: static (`/edit`), parametric (`/:reportID`),
 * and parametric with optional params (`/:reportID/:reportActionID?`).
 *
 * If the suffix doesn't match the tail of the path, returns the path as-is.
 *
 * @param path - The full path, with or without a leading slash.
 * @param dynamicRouteSuffix - The dynamic route pattern to remove from the end of the path.
 * @returns The path without the given dynamic suffix.
 */
function stripDynamicRouteSuffixFromPath(path: string, dynamicRouteSuffix: DynamicRouteSuffix): Route {
    const pathWithoutLeadingSlash = path.replaceAll(/^\/+/g, '');
    const match = findAllMatchingDynamicSuffixes(pathWithoutLeadingSlash).find((m) => m.pattern === dynamicRouteSuffix);
    if (match) {
        return getPathWithoutDynamicSuffix(match.pathUsedForMatching, match.actualSuffix, match.pattern);
    }

    return pathWithoutLeadingSlash as Route;
}

export default stripDynamicRouteSuffixFromPath;
