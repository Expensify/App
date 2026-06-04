/**
 * Type guard that narrows a value to a non-null object.
 * Used to filter out non-object entries (e.g. raw strings/numbers) that
 * `parseArrayAttribute` can yield for malformed chart data.
 */
function isNonNullObject<T extends object>(value: unknown): value is T {
    return typeof value === 'object' && value !== null;
}

export default isNonNullObject;
