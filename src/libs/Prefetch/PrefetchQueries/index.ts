/**
 * Native-only prefetching via `react-native-nitro-fetch` is unavailable on web, so no commands are prefetched.
 * Keeping this empty also prevents the `prefetchKey` request header from being added on web, which would otherwise
 * trigger a CORS preflight on cross-origin requests.
 */
const PrefetchQueries = new Set<string>();

export default PrefetchQueries;
