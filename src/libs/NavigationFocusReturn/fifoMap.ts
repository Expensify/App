/** Delete-then-set on re-insert so FIFO eviction drops the truly-oldest, not a recently-active key. */
function setFifoEntry<K, V>(map: Map<K, V>, key: K, value: V, maxSize: number): void {
    map.delete(key);
    map.set(key, value);
    while (map.size > maxSize) {
        const oldest = map.keys().next().value;
        if (oldest === undefined) {
            break;
        }
        map.delete(oldest);
    }
}

export default setFifoEntry;
