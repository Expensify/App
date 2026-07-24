/**
 * Use Nitro's fetch implementation for every bare `fetch(...)` on native.
 * On web, NitroFetch still uses the vanilla global fetch implementation.
 *
 * NitroFetch is an HTTP(S) network client and cannot read local resources, so any request to a
 * local URI scheme (e.g. a picked file, an attachment, or a blob) is routed to the platform's
 * native fetch, which reads those URIs correctly.
 */
import {fetch as nitroFetch, Headers as NitroHeaders, Request as NitroRequest, Response as NitroResponse} from 'react-native-nitro-fetch';

import isLocalFetchUri from './isLocalFetchUri';

// The platform's native fetch, captured before it is overridden below.
const nativeFetch = globalThis.fetch;

globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => (isLocalFetchUri(input) ? nativeFetch(input, init) : nitroFetch(input, init))) as typeof fetch;
globalThis.Headers = NitroHeaders;
globalThis.Request = NitroRequest;
globalThis.Response = NitroResponse;
