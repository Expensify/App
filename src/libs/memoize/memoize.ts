import moize from 'moize';
import type {Memoize, MemoizeConfig, MemoizeInstance} from './types';

const DEFAULT_CONFIG: MemoizeConfig = {
    cacheMode: 'array',
    equalityCheck: 'shallow',
    maxSize: 1,
};

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
    // If cacheMode is map we need to implement it
    throw new Error('Map cache mode is not implemented yet');
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
