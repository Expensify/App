import 'react-native-url-polyfill/auto';
import CONST from '@src/CONST';
import type {Route} from '@src/ROUTES';

function addLeadingForwardSlash(url: string): string {
    if (!url.startsWith('/')) {
        return `/${url}`;
    }
    return url;
}

/**
 * Get path from URL string
 */
function getPathFromURL(url: string): string {
    try {
        const parsedUrl = new URL(url);
        const path = parsedUrl.pathname + parsedUrl.search + parsedUrl.hash;
        return path.substring(1); // Remove the leading '/'
    } catch (error) {
        console.error('Error parsing URL:', error);
        return ''; // Return empty string for invalid URLs
    }
}

/**
 * Determine if two urls have the same origin
 */
function hasSameExpensifyOrigin(url1: string, url2: string): boolean {
    const removeW3 = (host: string) => host.replaceAll(/^www\./gi, '');
    try {
        const parsedUrl1 = new URL(url1);
        const parsedUrl2 = new URL(url2);

        return removeW3(parsedUrl1.host) === removeW3(parsedUrl2.host);
    } catch (error) {
        // Handle invalid URLs or other parsing errors
        console.error('Error parsing URLs:', error);
        return false;
    }
}

/**
 * Appends or updates a query parameter in a given URL.
 */
function appendParam(url: string, paramName: string, paramValue: string) {
    // If parameter exists, replace it
    if (url.includes(`${paramName}=`)) {
        const regex = new RegExp(`${paramName}=([^&]*)`);
        return url.replace(regex, `${paramName}=${paramValue}`) as Route;
    }

    // If parameter doesn't exist, append it
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${paramName}=${paramValue}` as Route;
}

function hasURL(text: string) {
    const urlPattern = /((https|http)?:\/\/[^\s]+)/g;

    return urlPattern.test(text);
}

function extractUrlDomain(url: string): string | undefined {
    const match = String(url).match(CONST.REGEX.DOMAIN_BASE);
    return match?.[1];
}

function getSearchParamFromUrl(currentUrl: string, param: string) {
    return currentUrl ? new URL(currentUrl).searchParams.get(param) : null;
}

type UrlWithParams<TBase extends string> = `${TBase}${'' | `?${string}` | `&${string}`}`;
type UrlParams = {backTo?: string; forwardTo?: string} & Record<string, string | number | undefined>;
/**
 * Generate a URL with properly encoded query parameters.
 *
 * @param baseUrl - The base URL.
 * @param params - Object containing key-value pairs for query parameters.
 * @returns A URL string with encoded query parameters.
 */
function getUrlWithParams<TBase extends string, TParams extends UrlParams>(baseUrl: TBase, params: TParams): UrlWithParams<TBase> {
    const [path, existingQuery] = baseUrl.split('?', 2);
    const searchParams = new URLSearchParams(existingQuery || '');

    for (const [key, value] of Object.entries(params)) {
        if (value) {
            searchParams.set(key, String(value));
        }
    }

    const queryString = searchParams.toString();
    return (queryString ? `${path}?${queryString}` : path) as UrlWithParams<TBase>;
}

export {getSearchParamFromUrl, hasSameExpensifyOrigin, getPathFromURL, appendParam, hasURL, addLeadingForwardSlash, extractUrlDomain, getUrlWithParams};
