import {WRITE_COMMANDS} from './API/types';

/**
 * The API commands that should be prefetched on app start using `react-native-nitro-fetch`'s `prefetchOnAppStart` function.
 */
const PREFETCH_QUERIES = new Set<string>([WRITE_COMMANDS.RECONNECT_APP]);

export default PREFETCH_QUERIES;
