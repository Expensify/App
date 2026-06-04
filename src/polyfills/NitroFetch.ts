/**
 * Use Nitro's fetch implementation for every bare `fetch(...)` on native.
 * On web, NitroFetch still uses the vanilla global fetch implementation.
 */
import {fetch as nitroFetch, Headers as NitroHeaders, Request as NitroRequest, Response as NitroResponse} from 'react-native-nitro-fetch';

// nitro-fetch is a native HTTP client that can only handle http(s) requests; it cannot read local files
// (file://, blob:, data:, content:, or scheme-less absolute paths such as the rewritten iOS spreadsheet import path).
// So we route only http(s) requests through nitro-fetch and fall back to the original fetch for everything else.
const originalFetch = globalThis.fetch;
const HTTP_SCHEME_REGEX = /^https?:/i;

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
    if (HTTP_SCHEME_REGEX.test(getRequestUrl(input))) {
        return nitroFetch(input, init);
    }
    return originalFetch(input, init);
}) as typeof fetch;

globalThis.Headers = NitroHeaders;
globalThis.Request = NitroRequest;
globalThis.Response = NitroResponse;
