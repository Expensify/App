import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {DynamicRouteSuffix} from '@src/ROUTES';

/**
 * Checks if a suffix matches any dynamic route path in DYNAMIC_ROUTES.
 */
function isDynamicRouteSuffix(suffix: string): suffix is DynamicRouteSuffix {
    return Object.values(DYNAMIC_ROUTES).some((route) => route.path === suffix);
}

export default isDynamicRouteSuffix;
