import type {Route} from '@src/ROUTES';
import splitPathAndQuery from './splitPathAndQuery';

/**
 * Returns the path without a dynamic route suffix while preserving query parameters.
 *
 * @param fullPath - The full URL path possibly containing query params (e.g., '/settings/wallet/verify-account?param=value')
 * @param dynamicSuffix - The dynamic suffix to strip (e.g., 'verify-account')
 * @returns The path without the suffix and with query params re-appended
 */
function getPathWithoutDynamicSuffix(fullPath: string, dynamicSuffix: string): Route {
    const [pathWithoutQuery, query] = splitPathAndQuery(fullPath);
    const pathWithoutDynamicSuffix = pathWithoutQuery?.slice(0, -(dynamicSuffix.length + 1)) ?? '';
    return `${pathWithoutDynamicSuffix}${query ? `?${query}` : ''}` as Route;
}

export default getPathWithoutDynamicSuffix;
