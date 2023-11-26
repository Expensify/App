export default function createCollection<T>(createKey: (item: T, index: number) => string, createItem: (index: number) => T, length = 500): Record<string, T> {
    const map: Record<string, T> = {};

    for (let i = 0; i < length; i++) {
        const item = createItem(i);
        const itemKey = createKey(item, i);
        map[itemKey] = item;
    }

    return map;
}
