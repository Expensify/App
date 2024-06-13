import * as cacheBuilders from './cacheBuilder';
import type {ExternalMemoizeConfig, MemoizeConfig, MemoizedInterface, MemoizeFnPredicate} from './types';

const DEFAULT_CONFIG = {
    cacheMode: 'array',
    equalityCheck: 'shallow',
    maxSize: Infinity,
} as const;

/**
 * Utility which returns a memoized version of a function. If same arguments are passed to the memoized function, its return value will be retrieved from cache instead of calculating it from scratch.
 *
 * Possible options for cache structure:
 * - `map` - uses `Map` primitive under the hood (only `deep` comparison of keys possible)
 * - `array` - uses `Array` primitive under the hood (slower lookup but enables `shallow` comparison)
 * @param f - Function you want to memoize
 * @param config - See `MemoizeConfig` type for more details
 * @returns Memoized function. Just use it and your function input should be memoized. Static methods added for direct cache manipulation. See `MemoizedInterface` type for more details.
 */
function memoize<Fn extends MemoizeFnPredicate>(f: Fn, config: ExternalMemoizeConfig = DEFAULT_CONFIG): MemoizedInterface<Fn> {
    // Make sure default values are provided
    const preparedConfig = (config !== DEFAULT_CONFIG ? {...DEFAULT_CONFIG, ...config} : config) as MemoizeConfig;

    switch (preparedConfig.cacheMode) {
        case 'map':
            // FIXME - How to properly type this?
            return cacheBuilders.MapCacheBuilder(f, preparedConfig);

        default:
            // FIXME - How to properly type this?
            return cacheBuilders.ArrayCacheBuilder(f, preparedConfig);
    }
}

export default memoize;
