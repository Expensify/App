import * as cacheBuilders from './cacheBuilder';
import type {ExternalMemoizeConfig, MemoizeConfig, MemoizedInterface} from './types';

const DEFAULT_CONFIG = {
    cacheMode: 'array',
    equalityCheck: 'shallow',
    maxSize: 1,
} as const;

function memoize<Fn extends () => unknown>(f: Fn, config: ExternalMemoizeConfig = DEFAULT_CONFIG): MemoizedInterface<Fn> {
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
