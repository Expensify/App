import moize from 'moize';
import type {Memoize, MemoizeConfig, MemoizeInstance} from './types';

const DEFAULT_CONFIG = {
    cacheMode: 'array',
    equalityCheck: 'shallow',
    maxSize: 1,
} satisfies MemoizeConfig;

const buildArrayCache: Memoize = (f, c) => {
    // If cacheMode is array we proceed with moize
    const moizeConfig = {
        isDeepEqual: c.equalityCheck === 'deep',
        isShallowEqual: c.equalityCheck === 'shallow',
        maxSize: c.maxSize,
    };

    const moized = moize(f, moizeConfig);

    return moized as MemoizeInstance<typeof f>;
};

const buildMapCache: Memoize = (f, c) => {
    const cache = new Map<string, ReturnType<typeof f>>();

    // Declaring here to not close over the config;
    const maxCacheSize = c.maxSize ?? DEFAULT_CONFIG.maxSize;

    function memoized(...params: Parameters<typeof f>) {
        const key = JSON.stringify(params);

        if (cache.has(key)) {
            return cache.get(key);
        }

        const result = f(...params) as ReturnType<typeof f>;
        cache.set(key, result);

        if (cache.size > maxCacheSize) {
            // Maps should keep insertion order, so we can safely delete the first key
            cache.delete(cache.keys().next().value as string);
        }

        return result;
    }

    memoized.set = (key: string, value: ReturnType<typeof f>) => {
        cache.set(key, value);
    };

    memoized.get = (key: string) => cache.get(key);

    memoized.clear = () => {
        cache.clear();
    };

    return memoized as MemoizeInstance<typeof f>;
};

const memoize: Memoize = (f, config = DEFAULT_CONFIG) => {
    switch (config.cacheMode) {
        case 'map':
            return buildMapCache(f, config);
        default:
            return buildArrayCache(f, config);
    }
};

// eslint-disable-next-line import/prefer-default-export
export {memoize};
