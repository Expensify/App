function mapToObject<T>(map?: Map<string, T>): Record<string, T> {
    if (!map) {
        return {};
    }
    const object: Record<string, T> = {};
    for (const [key, value] of map) {
        object[key] = value;
    }
    return object;
}

export default mapToObject;
