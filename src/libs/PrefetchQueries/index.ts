/**
 * Native-only prefetching via `react-native-nitro-fetch` is unavailable on web, so no commands are prefetched.
 * Keeping this empty also prevents the `prefetchKey` request header from being added on web, which would otherwise
 * trigger a CORS preflight on cross-origin requests.
 */
const PREFETCH_QUERIES = new Set<string>();

export default PREFETCH_QUERIES;
