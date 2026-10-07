/**
 * Use Nitro's fetch implementation for every bare `fetch(...)` on native.
 * On web, NitroFetch still uses the vanilla global fetch implementation.
 */
import {fetch as nitroFetch, Headers as NitroHeaders, Request as NitroRequest, Response as NitroResponse} from 'react-native-nitro-fetch';

globalThis.fetch = nitroFetch;
globalThis.Headers = NitroHeaders;
globalThis.Request = NitroRequest;
globalThis.Response = NitroResponse;
