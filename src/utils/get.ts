function get<T extends Record<string, unknown>, U>(obj: T, path: string | string[], defValue?: U): T | U | undefined {
    // If path is not defined or it has false value
    if (!path || path.length === 0) {
        return undefined;
    }
    // Check if path is string or array. Regex : ensure that we do not have '.' and brackets.
    // Regex explained: https://regexr.com/58j0k
    const pathArray = Array.isArray(path) ? path : path.match(/([^[.\]])+/g);
    // Find value
    const result = pathArray?.reduce((prevObj, key) => prevObj && (prevObj[key] as T), obj);
    // If found value is undefined return default value; otherwise return the value
    return result ?? defValue;
}

export default get;
