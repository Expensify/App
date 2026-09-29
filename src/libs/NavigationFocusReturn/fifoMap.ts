/** Delete-then-set on re-insert so FIFO eviction drops the truly-oldest, not a recently-active key. */
function setFifoEntry<K, V>(map: Map<K, V>, key: K, value: V, maxSize: number): void {
    map.delete(key);
    map.set(key, value);
    while (map.size > maxSize) {
        // `done` (not `value === undefined`) so a future caller storing `undefined` as a key wouldn't stall eviction.
        const next = map.keys().next();
        if (next.done) {
            break;
        }
        map.delete(next.value);
    }
}

export default setFifoEntry;
