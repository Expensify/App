import {deepEqual, shallowEqual} from 'fast-equals';
import type {TakeFirst} from '@src/types/utils/TupleOperations';
import DEFAULT_OPTIONS from './const';
import type {ClientOptions, IsomorphicFn, KeyComparator, Options} from './types';

function getEqualityComparator<Fn extends IsomorphicFn, MaxArgs extends number, Key>(opts: Options<Fn, MaxArgs, Key>): KeyComparator<Key> {
    // Use the custom equality comparator if it is provided
    if (typeof opts.equality === 'function') {
        return opts.equality;
    }

    if (opts.equality === 'shallow') {
        return shallowEqual;
    }

    return deepEqual;
}

function mergeOptions<Fn extends IsomorphicFn, MaxArgs extends number, Key>(options?: ClientOptions<Fn, MaxArgs, Key>): Options<Fn, MaxArgs, Key> {
    if (!options) {
        return DEFAULT_OPTIONS;
    }
    return {...DEFAULT_OPTIONS, ...options};
}
function truncateArgs<T extends unknown[], MaxArgs extends number = T['length']>(args: T, maxArgs?: MaxArgs): TakeFirst<T, MaxArgs> {
    // Hot paths are declared explicitly to avoid the overhead of the slice method

    if (maxArgs === undefined) {
        return args as unknown as TakeFirst<T, MaxArgs>;
    }

    if (maxArgs >= args.length) {
        return args as unknown as TakeFirst<T, MaxArgs>;
    }

    if (maxArgs === 0) {
        return [] as unknown as TakeFirst<T, MaxArgs>;
    }

    if (maxArgs === 1) {
        return [args[0]] as unknown as TakeFirst<T, MaxArgs>;
    }

    if (maxArgs === 2) {
        return [args[0], args[1]] as unknown as TakeFirst<T, MaxArgs>;
    }

    if (maxArgs === 3) {
        return [args[0], args[1], args[2]] as unknown as TakeFirst<T, MaxArgs>;
    }

    return args.slice(0, maxArgs) as unknown as TakeFirst<T, MaxArgs>;
}

export {mergeOptions, getEqualityComparator, truncateArgs};
