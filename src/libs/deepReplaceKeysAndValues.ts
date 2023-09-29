type ReplaceableValue = Record<string, unknown> | unknown[] | string | number | boolean | undefined | null;

/**
 * @param obj the object to transform
 * @param oldVal the value to search for
 * @param newVal the replacement value
 */
function deepReplaceKeysAndValues<T extends ReplaceableValue>(obj: T, oldVal: string, newVal: string): T {
    if (!obj) {
        return obj;
    }

    if (typeof obj === 'string') {
        return obj.replace(oldVal, newVal) as T;
    }

    if (typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map((item) => deepReplaceKeysAndValues(item as T, oldVal, newVal)) as T;
    }

    const newObj: Record<string, unknown> = {};
    Object.entries(obj).forEach(([key, val]) => {
        const newKey = key.replace(oldVal, newVal);

        if (typeof val === 'object') {
            newObj[newKey] = deepReplaceKeysAndValues(val as T, oldVal, newVal);
            return;
        }

        if (val === oldVal) {
            newObj[newKey] = newVal;
            return;
        }

        if (typeof val === 'string') {
            newObj[newKey] = val.replace(oldVal, newVal);
            return;
        }

        newObj[newKey] = val;
    });

    return newObj as T;
}

export default deepReplaceKeysAndValues;
