import type {Entries} from 'type-fest';

// eslint-disable-next-line @typescript-eslint/no-restricted-types
function typedEntries<T extends object>(obj: T): Entries<T> {
    return Object.entries(obj) as Entries<T>;
}

function hasMethod<T extends string>(value: unknown, methodName: T): value is Record<T, (...args: unknown[]) => unknown> {
    return value != null && typeof (value as Record<string, unknown>)[methodName] === 'function';
}

export default {
    typedEntries,
    hasMethod,
};
