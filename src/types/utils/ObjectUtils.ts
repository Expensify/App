import type {Entries} from 'type-fest';

// eslint-disable-next-line @typescript-eslint/no-restricted-types
function typedEntries<T extends object>(obj: T): Entries<T> {
    return Object.entries(obj) as Entries<T>;
}

function typedFromEntries<TKey extends string, TValue>(entries: Iterable<readonly [TKey, TValue]>): Record<TKey, TValue> {
    // Object.fromEntries returns a string-keyed record; callers pass a complete entry list.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return Object.fromEntries(entries) as Record<TKey, TValue>;
}

function typedKeys<TKey extends string, TValue>(record: Record<TKey, TValue>): TKey[] {
    // The record's keys are exactly TKey by construction; Object.keys widens them to string.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return Object.keys(record) as TKey[];
}

function hasMethod<T extends string>(value: unknown, methodName: T): value is Record<T, (...args: unknown[]) => unknown> {
    return value != null && typeof (value as Record<string, unknown>)[methodName] === 'function';
}

export default {
    typedEntries,
    typedFromEntries,
    typedKeys,
    hasMethod,
};
