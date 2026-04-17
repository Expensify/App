/**
 * Use Nitro's fetch implementation for every bare `fetch(...)` on native (shared with dependencies that call the global).
 * Web resolves to NitroFetch.web.ts so the native module is not bundled for the browser.
 */
import {fetch as nitroFetch, Headers as NitroHeaders, Request as NitroRequest, Response as NitroResponse} from 'react-native-nitro-fetch';

// Nitro mirrors the Fetch API at runtime; DOM lib types (e.g. HeadersIterator) are stricter than Nitro's declarations.
globalThis.fetch = nitroFetch as typeof globalThis.fetch;
globalThis.Headers = NitroHeaders as unknown as typeof globalThis.Headers;
globalThis.Request = NitroRequest as unknown as typeof globalThis.Request;
globalThis.Response = NitroResponse as unknown as typeof globalThis.Response;
