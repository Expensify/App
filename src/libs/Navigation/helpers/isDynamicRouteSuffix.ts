import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {DynamicRouteSuffix} from '@src/ROUTES';

/**
 * Checks if a suffix matches any dynamic route path in DYNAMIC_ROUTES.
 */
function isDynamicRouteSuffix(suffix: string): suffix is DynamicRouteSuffix {
    const dynamicRouteSuffixes: string[] = Object.values(DYNAMIC_ROUTES).map((route) => route.path);
    return dynamicRouteSuffixes.includes(suffix);
}

export default isDynamicRouteSuffix;
