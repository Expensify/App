import setFifoEntry from '@libs/NavigationFocusReturn/fifoMap';

describe('setFifoEntry', () => {
    it('appends a new key at the tail', () => {
        const map = new Map<string, number>();
        setFifoEntry(map, 'a', 1, 3);
        setFifoEntry(map, 'b', 2, 3);
        setFifoEntry(map, 'c', 3, 3);
        expect(Array.from(map.keys())).toEqual(['a', 'b', 'c']);
    });

    it('moves a re-set key to the tail so FIFO eviction drops the truly-oldest, not a recently-active key', () => {
        const map = new Map<string, number>();
        setFifoEntry(map, 'a', 1, 3);
        setFifoEntry(map, 'b', 2, 3);
        setFifoEntry(map, 'c', 3, 3);
        setFifoEntry(map, 'a', 99, 3); // re-set 'a' — should move to tail.
        expect(Array.from(map.keys())).toEqual(['b', 'c', 'a']);
        expect(map.get('a')).toBe(99);
    });

    it('evicts the oldest entry when size exceeds maxSize', () => {
        const map = new Map<string, number>();
        setFifoEntry(map, 'a', 1, 3);
        setFifoEntry(map, 'b', 2, 3);
        setFifoEntry(map, 'c', 3, 3);
        setFifoEntry(map, 'd', 4, 3);
        expect(Array.from(map.keys())).toEqual(['b', 'c', 'd']);
        expect(map.has('a')).toBe(false);
    });

    it('respects the move-to-tail invariant under eviction — a recently re-set key survives an eviction that would otherwise drop it', () => {
        const map = new Map<string, number>();
        setFifoEntry(map, 'a', 1, 3);
        setFifoEntry(map, 'b', 2, 3);
        setFifoEntry(map, 'c', 3, 3);
        setFifoEntry(map, 'a', 99, 3); // 'a' moves to tail; oldest is now 'b'.
        setFifoEntry(map, 'd', 4, 3); // eviction drops 'b', not 'a'.
        expect(Array.from(map.keys())).toEqual(['c', 'a', 'd']);
        expect(map.has('b')).toBe(false);
    });

    it('treats maxSize <= 0 as a zero-element cap, evicting on every insert so the map never retains entries', () => {
        const map = new Map<string, number>();
        setFifoEntry(map, 'a', 1, 0);
        expect(map.size).toBe(0);
        setFifoEntry(map, 'b', 2, 0);
        expect(map.size).toBe(0);
    });
});
