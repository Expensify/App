import {deepEqual, shallowEqual} from 'fast-equals';
import DEFAULT_OPTIONS from './const';
import type {ClientOptions, KeyComparator, Options} from './types';

function getEqualityComparator(opts: Options): KeyComparator {
    // Use the custom equality comparator if it is provided
    if (typeof opts.equality === 'function') {
        return opts.equality;
    }

    if (opts.equality === 'shallow') {
        return shallowEqual;
    }

    return deepEqual;
}

function mergeOptions(options?: ClientOptions): Options {
    if (!options) {
        return DEFAULT_OPTIONS;
    }
    return {...DEFAULT_OPTIONS, ...options};
}

export {mergeOptions, getEqualityComparator};
