import {MinHeap} from '../../src/libs/MinHeap';

describe('MinHeap', () => {
    let heap: MinHeap<number>;

    beforeEach(() => {
        heap = new MinHeap<number>();
    });

    it('should be empty on creation', () => {
        expect(heap.isEmpty()).toBe(true);
        expect(heap.size()).toBe(0);
        expect(heap.peek()).toBeNull();
        expect(heap.pop()).toBeNull();
    });

    it('should push and peek values', () => {
        heap.push(5).push(3).push(8);
        expect(heap.size()).toBe(3);
        expect(heap.peek()).toBe(3);
    });

    it('should pop values in order', () => {
        heap.push(10).push(1).push(7);
        expect(heap.pop()).toBe(1);
        expect(heap.pop()).toBe(7);
        expect(heap.pop()).toBe(10);
        expect(heap.pop()).toBeNull();
        expect(heap.isEmpty()).toBe(true);
    });

    it('should clear the heap', () => {
        heap.push(2).push(4);
        heap.clear();
        expect(heap.size()).toBe(0);
        expect(heap.isEmpty()).toBe(true);
        expect(heap.peek()).toBeNull();
    });

    it('should handle duplicate values', () => {
        heap.push(2).push(2).push(2);
        expect(heap.size()).toBe(3);
        expect(heap.pop()).toBe(2);
        expect(heap.pop()).toBe(2);
        expect(heap.pop()).toBe(2);
        expect(heap.isEmpty()).toBe(true);
    });

    it('should iterate and empty the heap', () => {
        heap.push(3).push(1).push(2);
        const values = Array.from(heap);
        expect(values).toEqual([1, 2, 3]);
        expect(heap.isEmpty()).toBe(true);
    });

    it('should work with getCompareValue', () => {
        type Obj = {v: number};
        const objHeap = new MinHeap<Obj>((item) => item.v);
        objHeap.push({v: 5}).push({v: 2}).push({v: 7});
        expect(objHeap.pop()).toEqual({v: 2});
        expect(objHeap.pop()).toEqual({v: 5});
        expect(objHeap.pop()).toEqual({v: 7});
        expect(objHeap.pop()).toBeNull();
    });
});
