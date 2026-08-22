type ReplaceableValue = Record<string, unknown> | unknown[] | string | number | boolean | undefined | null;

/**
 * Recursively replaces keys and values in one erased nested value.
 */
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
        // Object.entries infers entryValue as any, so keep it from propagating into recursion and assignments.
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
 * Recursively replaces keys and values in an optional request-data record.
 */
function deepReplaceKeysAndValues(target: Record<string, unknown> | undefined, oldVal: string, newVal: string): Record<string, unknown> | undefined {
    if (!target) {
        return target;
    }

    const newObj: Record<string, unknown> = {};
    for (const [key, entryValue] of Object.entries(target)) {
        const newKey = key.replace(oldVal, newVal);

        if (entryValue instanceof File || entryValue instanceof Blob) {
            newObj[newKey] = entryValue;
            continue;
        }

        if (typeof entryValue === 'object') {
            newObj[newKey] = transformReplaceableValue(entryValue, oldVal, newVal);
            continue;
        }

        if (entryValue === oldVal) {
            newObj[newKey] = newVal;
            continue;
        }

        if (typeof entryValue === 'string') {
            newObj[newKey] = entryValue.replace(oldVal, newVal);
            continue;
        }

        newObj[newKey] = entryValue;
    }

    return newObj;
}

export default deepReplaceKeysAndValues;

export type {ReplaceableValue};
