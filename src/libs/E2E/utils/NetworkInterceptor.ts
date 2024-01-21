/* eslint-disable @lwc/lwc/no-async-await */
import type {NetworkCacheMap} from '@libs/E2E/types';

const LOG_TAG = `[E2E][NetworkInterceptor]`;
// Requests with these headers will be ignored:
const IGNORE_REQUEST_HEADERS = ['X-E2E-Server-Request'];

let globalResolveIsNetworkInterceptorInstalled: () => void;
let globalRejectIsNetworkInterceptorInstalled: (error: Error) => void;
const globalIsNetworkInterceptorInstalledPromise = new Promise<void>((resolve, reject) => {
    globalResolveIsNetworkInterceptorInstalled = resolve;
    globalRejectIsNetworkInterceptorInstalled = reject;
});
let networkCache: NetworkCacheMap | null = null;

/**
 * This function hashes the arguments of fetch.
 */
function hashFetchArgs(args: Parameters<typeof fetch>) {
    const [url, options] = args;
    return JSON.stringify({url, options});
}

/**
 * The headers of a fetch request can be passed as an array of tuples or as an object.
 * This function converts the headers to an object.
 */
function getFetchRequestHeadersAsObject(fetchRequest: RequestInit): Record<string, string> {
    const headers: Record<string, string> = {};
    if (Array.isArray(fetchRequest.headers)) {
        fetchRequest.headers.forEach(([key, value]) => {
            headers[key] = value;
        });
    } else if (typeof fetchRequest.headers === 'object') {
        Object.entries(fetchRequest.headers).forEach(([key, value]) => {
            headers[key] = value;
        });
    }
    return headers;
}

/**
 * This function extracts the RequestInit from the arguments of fetch.
 * It is needed because the arguments can be passed in different ways.
 */
function fetchArgsGetRequestInit(args: Parameters<typeof fetch>): RequestInit {
    const [firstArg, secondArg] = args;
    if (typeof firstArg === 'string' || (typeof firstArg === 'object' && firstArg instanceof URL)) {
        if (secondArg == null) {
            return {};
        }
        return secondArg;
    }
    return firstArg;
}

function fetchArgsGetUrl(args: Parameters<typeof fetch>): string {
    const [firstArg] = args;
    if (typeof firstArg === 'string') {
        return firstArg;
    }
    if (typeof firstArg === 'object' && firstArg instanceof URL) {
        return firstArg.href;
    }
    if (typeof firstArg === 'object' && firstArg instanceof Request) {
        return firstArg.url;
    }
    throw new Error('Could not get url from fetch args');
}

export default function installNetworkInterceptor(
    getNetworkCache: () => Promise<NetworkCacheMap>,
    updateNetworkCache: (networkCache: NetworkCacheMap) => Promise<unknown>,
    shouldReturnRecordedResponse: boolean,
) {
    console.debug(LOG_TAG, 'installing with shouldReturnRecordedResponse:', shouldReturnRecordedResponse);
    const originalFetch = global.fetch;

    if (networkCache == null && shouldReturnRecordedResponse) {
        console.debug(LOG_TAG, 'fetching network cache …');
        getNetworkCache().then((newCache) => {
            networkCache = newCache;
            globalResolveIsNetworkInterceptorInstalled();
            console.debug(LOG_TAG, 'network cache fetched!');
        }, globalRejectIsNetworkInterceptorInstalled);
    } else {
        networkCache = {};
        globalResolveIsNetworkInterceptorInstalled();
    }

    // @ts-expect-error Fetch global types weirdly include URL
    global.fetch = async (...args: Parameters<typeof fetch>) => {
        const headers = getFetchRequestHeadersAsObject(fetchArgsGetRequestInit(args));
        const url = fetchArgsGetUrl(args);
        // Check if headers contain any of the ignored headers, or if react native metro server:
        if (IGNORE_REQUEST_HEADERS.some((header) => headers[header] != null) || url.includes('8081')) {
            return originalFetch(...args);
        }

        await globalIsNetworkInterceptorInstalledPromise;

        const hash = hashFetchArgs(args);
        if (shouldReturnRecordedResponse && networkCache?.[hash] != null) {
            console.debug(LOG_TAG, 'Returning recorded response for url:', url);
            const {response} = networkCache[hash];
            return Promise.resolve(response);
        }

        return originalFetch(...args)
            .then((res) => {
                if (networkCache != null) {
                    console.debug(LOG_TAG, 'Updating network cache for hash:');
                    networkCache[hash] = {
                        // @ts-expect-error TODO: The user could pass these differently, add better handling
                        url: args[0],
                        // @ts-expect-error TODO: The user could pass these differently, add better handling
                        options: args[1],
                        response: res,
                    };
                    // Send the network cache to the test server:
                    return updateNetworkCache(networkCache).then(() => res);
                }
                return res;
            })
            .then((res) => {
                console.debug(LOG_TAG, 'Network cache updated!');
                return res;
            });
    };
}
