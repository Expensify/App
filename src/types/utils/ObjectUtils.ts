import type {Entries, ValueOf} from 'type-fest';

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

function getObjectKeys<T extends Record<string, unknown>>(obj: T): Array<keyof T> {
    return Object.keys(obj) as Array<keyof T>;
}

function getObjectValues<T extends Record<string, unknown>>(obj: T): Array<ValueOf<T>> {
    // Needed for functionality
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return Object.values(obj) as Array<ValueOf<T>>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isUnknownArray(value: unknown): value is unknown[] {
    return Array.isArray(value);
}

function hasKey<T extends Record<string, unknown>>(obj: T, key: PropertyKey): key is keyof T {
    return key in obj;
}

export default {
    typedEntries,
    typedFromEntries,
    typedKeys,
    hasMethod,
};
export {getObjectKeys, getObjectValues, hasKey, isRecord, isUnknownArray};
