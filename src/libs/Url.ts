import escapeRegExp from 'lodash/escapeRegExp';
import 'react-native-url-polyfill/auto';
import CONST from '@src/CONST';

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
        return url.replace(regex, `${paramName}=${paramValue}`);
    }

    // If parameter doesn't exist, append it
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${paramName}=${paramValue}`;
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

function getSearchParamFromPath(path: string, param: string) {
    if (!path) {
        return null;
    }

    const [pathWithoutHash] = path.split('#', 2);
    const queryIndex = pathWithoutHash.indexOf('?');

    const safeDecode = (value: string) => {
        try {
            return decodeURIComponent(value);
        } catch {
            return value;
        }
    };

    const getParamFromQueryString = (queryString: string) => {
        if (!queryString) {
            return null;
        }

        const match = queryString.match(new RegExp(`(?:^|&)${escapeRegExp(param)}=([^&]*)`));
        const rawValue = match?.[1];

        if (!rawValue) {
            return null;
        }

        // Match previous behavior: decode the query value twice and truncate on decoded delimiters.
        const decodedValue = safeDecode(safeDecode(rawValue));
        const delimiterIndex = decodedValue.search(/[&/]/);

        if (delimiterIndex === -1) {
            return decodedValue;
        }

        return decodedValue.slice(0, delimiterIndex);
    };

    if (queryIndex !== -1) {
        const queryString = pathWithoutHash.slice(queryIndex + 1);
        const directParam = getParamFromQueryString(queryString);
        if (directParam !== null) {
            return directParam;
        }
    }

    // Fallback: extract params from encoded backTo segment (e.g., ".../search/<encoded>/amount")
    const encodedBackToMatch = pathWithoutHash.match(/\/search\/([^/]+)/);
    const encodedBackTo = encodedBackToMatch?.[1];
    if (!encodedBackTo) {
        return null;
    }

    const decodedBackTo = safeDecode(encodedBackTo);
    const backToQueryIndex = decodedBackTo.indexOf('?');
    if (backToQueryIndex === -1) {
        return null;
    }

    const backToQueryString = decodedBackTo.slice(backToQueryIndex + 1);
    return getParamFromQueryString(backToQueryString);
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

export {getSearchParamFromUrl, getSearchParamFromPath, hasSameExpensifyOrigin, getPathFromURL, appendParam, hasURL, addLeadingForwardSlash, extractUrlDomain, getUrlWithParams};
