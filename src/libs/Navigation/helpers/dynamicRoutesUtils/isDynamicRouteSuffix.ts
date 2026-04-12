import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {DynamicRouteSuffix} from '@src/ROUTES';

const dynamicRouteEntries = Object.values(DYNAMIC_ROUTES);
const dynamicRoutePaths = new Set<string>(dynamicRouteEntries.map((r) => r.path));

/**
 * Checks if a suffix matches any dynamic route path in DYNAMIC_ROUTES.
 */
function isDynamicRouteSuffix(suffix: string): suffix is DynamicRouteSuffix {
    return dynamicRoutePaths.has(suffix);
}

export {dynamicRoutePaths};
export default isDynamicRouteSuffix;
