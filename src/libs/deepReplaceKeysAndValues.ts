// `object` intentionally accepts every non-null object variant reached by recursive traversal.
// A string-keyed `Record<string, unknown>` would reject valid object instances and change the preserved boundary.
// eslint-disable-next-line @typescript-eslint/no-restricted-types
function transformRecord(target: object, oldVal: string, newVal: string): Record<string, unknown> {
    const newObj: Record<string, unknown> = {};
    for (const [key, entryValue] of Object.entries(target)) {
        // Object.entries() returns any for an object input, so bind the value to unknown before transforming it.
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

    return transformRecord(target, oldVal, newVal);
}

function deepReplaceKeysAndValues(target: Record<string, unknown> | undefined, oldVal: string, newVal: string): Record<string, unknown> | undefined {
    if (!target) {
        return target;
    }

    return transformRecord(target, oldVal, newVal);
}

export default deepReplaceKeysAndValues;
