type ReplaceableValue = Record<string, unknown> | unknown[] | string | number | boolean | undefined | null;

/**
 * @param target the object or value to transform
 * @param oldVal the value to search for
 * @param newVal the replacement value
 */
function deepReplaceKeysAndValues<T extends ReplaceableValue>(target: T, oldVal: string, newVal: string): T {
    if (!target) {
        return target;
    }

    if (typeof target === 'string') {
        return target.replace(oldVal, newVal) as T;
    }

    if (typeof target !== 'object') {
        return target;
    }

    if (Array.isArray(target)) {
        return target.map((item) => deepReplaceKeysAndValues(item as T, oldVal, newVal)) as T;
    }

    const newObj: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(target)) {
        const newKey = key.replace(oldVal, newVal);

        if (val instanceof File || val instanceof Blob) {
            newObj[newKey] = val;
            continue;
        }

        if (typeof val === 'object') {
            newObj[newKey] = deepReplaceKeysAndValues(val as T, oldVal, newVal);
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

    return newObj as T;
}

export default deepReplaceKeysAndValues;

export type {ReplaceableValue};
