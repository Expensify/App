import {WRITE_COMMANDS} from '@libs/API/types';

/**
 * The API commands that should be prefetched on app start using `react-native-nitro-fetch`'s `prefetchOnAppStart` function.
 */
const PrefetchQueries = new Set<string>([WRITE_COMMANDS.RECONNECT_APP]);

export default PrefetchQueries;
