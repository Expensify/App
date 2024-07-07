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

function truncateArgs<T extends unknown[]>(args: T, maxArgs?: number) {
    if (maxArgs === undefined) {
        return args;
    }

    if (maxArgs >= args.length) {
        return args;
    }

    // Hot paths are declared explicitly to avoid the overhead of the slice method
    if (maxArgs === 0) {
        return [];
    }

    if (maxArgs === 1) {
        return [args[0]];
    }

    if (maxArgs === 2) {
        return [args[0], args[1]];
    }

    if (maxArgs === 3) {
        return [args[0], args[1], args[2]];
    }

    return args.slice(0, maxArgs);
}

export {mergeOptions, getEqualityComparator, truncateArgs};
