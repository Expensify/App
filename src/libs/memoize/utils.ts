import {deepEqual, shallowEqual} from 'fast-equals';
import {DEFAULT_OPTIONS} from './const';
import type {CacheOpts, ClientOptions, Options} from './types';

function getEqualityComparator(opts: CacheOpts) {
    switch (opts.equality) {
        case 'deep':
            return deepEqual;
        case 'shallow':
            return shallowEqual;
        default:
            return opts.equality;
    }
}

function mergeOptions(options?: ClientOptions): Options {
    if (!options) {
        return DEFAULT_OPTIONS;
    }
    return {...DEFAULT_OPTIONS, ...options};
}

export {mergeOptions, getEqualityComparator};
