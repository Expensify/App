import {WRITE_COMMANDS} from './API/types';

/**
 * The API commands that should be prefetched on app start using `react-native-nitro-fetch`'s `prefetchOnAppStart` function.
 */
const PREFETCH_QUERIES = new Set<string>([WRITE_COMMANDS.RECONNECT_APP]);

/**
 * The name of the header key that contains the prefetch key.
 * This is used by `react-native-nitro-fetch`'s `prefetchOnAppStart` function, to register and store prefetched requests.
 */
const PREFETCH_HEADER_KEY = 'prefetchKey';

export {PREFETCH_QUERIES, PREFETCH_HEADER_KEY};
