/**
 * SafeString is a utility function that converts a value to a string.
 * It handles the problematic case of plain objects by converting them to JSON.
 * It helps with eslint rule https://typescript-eslint.io/rules/no-base-to-string
 * @param value - The value to convert to a string.
 * @returns The string representation of the value.
 */
export default function SafeString(value: unknown): string {
    if (value === undefined || value === null) {
        return '';
    }

    // Handle primitives explicitly so the final fallback never receives an object.
    const valueType = typeof value;
    if (valueType === 'string') {
        return value as string;
    }
    if (valueType === 'number' || valueType === 'boolean' || valueType === 'function' || valueType === 'bigint' || valueType === 'symbol') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
        const primitive = value as number | boolean | Function | bigint | symbol;
        return String(primitive);
    }

    if (valueType === 'object') {
        if (Array.isArray(value)) {
            try {
                return JSON.stringify(value);
            } catch {
                return '[object Array]';
            }
        }

        const obj = value as {toString: () => string};
        const hasCustomToString = obj.toString && obj.toString !== Object.prototype.toString;
        if (hasCustomToString) {
            return obj.toString();
        }

        if (value instanceof Map) {
            return '[object Map]';
        }

        if (value instanceof Set) {
            return '[object Set]';
        }

        try {
            return JSON.stringify(obj);
        } catch {
            return '[object Object]';
        }
    }
    // Unreachable fallback
    return '';
}
