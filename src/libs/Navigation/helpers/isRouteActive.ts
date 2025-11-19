import CONST from '@src/CONST';

/**
 * Removes redundant slashes and query params from a route path.
 */
function cleanRoutePath(routePath: string): string {
    return routePath.replace(CONST.REGEX.ROUTES.REDUNDANT_SLASHES, (match, p1) => (p1 ? '/' : '')).replace(/\?.*/, '');
}

/**
 * Normalizes a route path by trimming leading slashes and cleaning redundant parts.
 */
function normalizeRoutePath(routePath: string): string {
    const trimmedRoute = routePath.startsWith('/') ? routePath.substring(1) : routePath;
    return cleanRoutePath(trimmedRoute);
}

/**
 * Determines whether the provided route path matches the current active route.
 */
function isRouteActive(activeRoute: string, routePath: string): boolean {
    return normalizeRoutePath(activeRoute) === normalizeRoutePath(routePath);
}

export {cleanRoutePath, normalizeRoutePath, isRouteActive};
