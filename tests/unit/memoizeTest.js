"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var memoize_1 = require("../../src/libs/memoize");
describe('memoize test', function () {
    it('should return the memoized result', function () {
        var add = function (a, b) { return a + b; };
        var memoizedAdd = (0, memoize_1.default)(add);
        var result1 = memoizedAdd(2, 3);
        var result2 = memoizedAdd(2, 3);
        expect(result1).toBe(5);
        expect(result2).toBe(5);
    });
    it('should not call original function if the same arguments are passed', function () {
        var fn = jest.fn();
        var memoizedFn = (0, memoize_1.default)(fn);
        memoizedFn(2, 3);
        memoizedFn(2, 3);
        memoizedFn(2, 3);
        expect(fn).toHaveBeenCalledTimes(1);
    });
    it('should recompute the result if different arguments are passed', function () {
        var fn = jest.fn();
        var memoizedFn = (0, memoize_1.default)(fn);
        memoizedFn(4, 20);
        memoizedFn('r2d2');
        expect(fn).toHaveBeenCalledTimes(2);
    });
    it('should handle deep comparison', function () {
        var fn = jest.fn();
        var memoizedFn = (0, memoize_1.default)(fn, { equality: 'deep' });
        memoizedFn({ a: 1, b: 'test' }, { c: 3, d: 'test' });
        memoizedFn({ a: 1, b: 'test' }, { c: 3, d: 'test' });
        expect(fn).toHaveBeenCalledTimes(1);
    });
    it('should handle custom key comparator', function () {
        var fn = jest.fn();
        var memoizedFn = (0, memoize_1.default)(fn, { equality: function () { return true; } });
        memoizedFn(1, 2);
        memoizedFn(1, 3);
        memoizedFn(1, 4);
        memoizedFn(1, 5);
        expect(fn).toHaveBeenCalledTimes(1);
    });
    it('should handle cache eviction', function () {
        var fn = jest.fn();
        var memoizedFn = (0, memoize_1.default)(fn, { maxSize: 1 });
        memoizedFn(1, 2);
        memoizedFn(1, 3);
        memoizedFn(1, 2);
        memoizedFn(1, 3);
        expect(fn).toHaveBeenCalledTimes(4);
    });
    it('should return cache snapshot', function () {
        var fn = function (a, b) { return a + b; };
        var memoizedFn = (0, memoize_1.default)(fn);
        memoizedFn(1, 2);
        memoizedFn(2, 3);
        expect(memoizedFn.cache.snapshot.keys()).toEqual([
            [1, 2],
            [2, 3],
        ]);
        expect(memoizedFn.cache.snapshot.values()).toEqual([3, 5]);
        expect(memoizedFn.cache.snapshot.entries()).toEqual([
            [[1, 2], 3],
            [[2, 3], 5],
        ]);
    });
});
