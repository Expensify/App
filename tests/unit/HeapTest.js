"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Heap_1 = require("../../src/libs/Heap");
describe('Heap', function () {
    var heap;
    beforeEach(function () {
        heap = new Heap_1.Heap(function (a, b) { return a - b; });
    });
    it('should be empty on creation', function () {
        expect(heap.isEmpty()).toBe(true);
        expect(heap.size()).toBe(0);
        expect(heap.peek()).toBeNull();
        expect(heap.pop()).toBeNull();
    });
    it('should push and peek values', function () {
        heap.push(5).push(3).push(8);
        expect(heap.size()).toBe(3);
        expect(heap.peek()).toBe(3);
    });
    it('should pop values in order', function () {
        heap.push(10).push(1).push(7);
        expect(heap.pop()).toBe(1);
        expect(heap.pop()).toBe(7);
        expect(heap.pop()).toBe(10);
        expect(heap.pop()).toBeNull();
        expect(heap.isEmpty()).toBe(true);
    });
    it('should clear the heap', function () {
        heap.push(2).push(4);
        heap.clear();
        expect(heap.size()).toBe(0);
        expect(heap.isEmpty()).toBe(true);
        expect(heap.peek()).toBeNull();
    });
    it('should handle duplicate values', function () {
        heap.push(2).push(2).push(2);
        expect(heap.size()).toBe(3);
        expect(heap.pop()).toBe(2);
        expect(heap.pop()).toBe(2);
        expect(heap.pop()).toBe(2);
        expect(heap.isEmpty()).toBe(true);
    });
    it('should iterate and empty the heap', function () {
        heap.push(3).push(1).push(2);
        var values = Array.from(heap);
        expect(values).toEqual([1, 2, 3]);
        expect(heap.isEmpty()).toBe(true);
    });
    it('should throw error if compare is not a function', function () {
        // @ts-expect-error We are testing invalid input
        expect(function () { return new Heap_1.Heap(); }).toThrow();
    });
});
