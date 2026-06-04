/**
 * Use Nitro's fetch implementation for every bare `fetch(...)` on native.
 * On web, NitroFetch still uses the vanilla global fetch implementation.
 */
import {fetch as nitroFetch, Headers as NitroHeaders, Request as NitroRequest, Response as NitroResponse} from 'react-native-nitro-fetch';

// nitro-fetch is a native HTTP client and cannot read local-scheme URLs (file://, blob:, data:).
// So we route only http(s) requests through nitro-fetch and fall back to the original fetch for local schemes.
const originalFetch = globalThis.fetch;
const LOCAL_SCHEME_REGEX = /^(file|blob|data|content):/i;

const getRequestUrl = (input: RequestInfo | URL): string => {
    if (typeof input === 'string') {
        return input;
    }
    if (input instanceof URL) {
        return input.href;
    }
    return input.url;
};

globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    if (LOCAL_SCHEME_REGEX.test(getRequestUrl(input))) {
        return originalFetch(input, init);
    }
    return nitroFetch(input, init);
}) as typeof fetch;

globalThis.Headers = NitroHeaders;
globalThis.Request = NitroRequest;
globalThis.Response = NitroResponse;
