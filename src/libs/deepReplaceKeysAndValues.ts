type ReplaceableValue = Record<string, unknown> | unknown[] | string | number | boolean | undefined | null;

type DeepReplaceResult<T> = unknown extends T
    ? unknown
    : T extends string
      ? string
      : T extends unknown[]
        ? Array<DeepReplaceResult<T[number]>>
        : T extends (...args: never[]) => unknown
          ? T
          : T extends abstract new (...args: never[]) => unknown
            ? T
            : T extends number | boolean | bigint | symbol | null | undefined | void
              ? T
              : Record<string, unknown>;

/**
 * Recursively replaces keys and values while preserving the broad type of recursive values.
 */
function transformReplaceableValue(target: ReplaceableValue, oldVal: string, newVal: string): ReplaceableValue;
function transformReplaceableValue(target: unknown, oldVal: string, newVal: string): unknown;
function transformReplaceableValue(target: unknown, oldVal: string, newVal: string): unknown {
    if (!target) {
        return target;
    }

    if (typeof target === 'string') {
        return target.replace(oldVal, newVal);
    }

    if (typeof target !== 'object') {
        return target;
    }

    if (Array.isArray(target)) {
        return target.map((item) => transformReplaceableValue(item, oldVal, newVal));
    }

    const newObj: Record<string, unknown> = {};
    for (const [key, entryValue] of Object.entries(target)) {
        const val: unknown = entryValue;
        const newKey = key.replace(oldVal, newVal);

        if (val instanceof File || val instanceof Blob) {
            newObj[newKey] = val;
            continue;
        }

        if (typeof val === 'object') {
            newObj[newKey] = transformReplaceableValue(val, oldVal, newVal);
            continue;
        }

        if (val === oldVal) {
            newObj[newKey] = newVal;
            continue;
        }

        if (typeof val === 'string') {
            newObj[newKey] = val.replace(oldVal, newVal);
            continue;
        }

        newObj[newKey] = val;
    }

    return newObj;
}

/**
 * @param target the object or value to transform
 * @param oldVal the value to search for
 * @param newVal the replacement value
 */
function deepReplaceKeysAndValues<T extends ReplaceableValue>(target: T, oldVal: string, newVal: string): DeepReplaceResult<T>;
function deepReplaceKeysAndValues(target: ReplaceableValue, oldVal: string, newVal: string): ReplaceableValue {
    return transformReplaceableValue(target, oldVal, newVal);
}

export default deepReplaceKeysAndValues;

export type {ReplaceableValue};
