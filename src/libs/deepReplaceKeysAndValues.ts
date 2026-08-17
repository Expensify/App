type ReplaceableValue = Record<string, unknown> | unknown[] | string | number | boolean | undefined | null;

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
function deepReplaceKeysAndValues(target: string, oldVal: string, newVal: string): string;
function deepReplaceKeysAndValues(target: unknown[], oldVal: string, newVal: string): unknown[];
function deepReplaceKeysAndValues(target: Record<string, unknown>, oldVal: string, newVal: string): Record<string, unknown>;
function deepReplaceKeysAndValues(target: number, oldVal: string, newVal: string): number;
function deepReplaceKeysAndValues(target: boolean, oldVal: string, newVal: string): boolean;
function deepReplaceKeysAndValues(target: null, oldVal: string, newVal: string): null;
function deepReplaceKeysAndValues(target: undefined, oldVal: string, newVal: string): undefined;
function deepReplaceKeysAndValues(target: Record<string, unknown> | undefined, oldVal: string, newVal: string): Record<string, unknown> | undefined;
function deepReplaceKeysAndValues(target: ReplaceableValue, oldVal: string, newVal: string): ReplaceableValue;
function deepReplaceKeysAndValues(target: ReplaceableValue, oldVal: string, newVal: string): ReplaceableValue {
    return transformReplaceableValue(target, oldVal, newVal);
}

export default deepReplaceKeysAndValues;

export type {ReplaceableValue};
