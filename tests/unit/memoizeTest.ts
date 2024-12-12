import memoize from '../../src/libs/memoize';

describe('memoize test', () => {
    it('should return the memoized result', () => {
        const add = (a: number, b: number) => a + b;
        const memoizedAdd = memoize(add);

        const result1 = memoizedAdd(2, 3);
        const result2 = memoizedAdd(2, 3);

        expect(result1).toBe(5);
        expect(result2).toBe(5);
    });

    it('should not call original function if the same arguments are passed', () => {
        const fn = jest.fn();
        const memoizedFn = memoize(fn);

        memoizedFn(2, 3);
        memoizedFn(2, 3);
        memoizedFn(2, 3);

        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should recompute the result if different arguments are passed', () => {
        const fn = jest.fn();
        const memoizedFn = memoize(fn);

        memoizedFn(4, 20);
        memoizedFn('r2d2');

        expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should handle deep comparison', () => {
        const fn = jest.fn();
        const memoizedFn = memoize(fn, {equality: 'deep'});

        memoizedFn({a: 1, b: 'test'}, {c: 3, d: 'test'});
        memoizedFn({a: 1, b: 'test'}, {c: 3, d: 'test'});

        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should handle custom key comparator', () => {
        const fn = jest.fn();
        const memoizedFn = memoize(fn, {equality: () => true});

        memoizedFn(1, 2);
        memoizedFn(1, 3);
        memoizedFn(1, 4);
        memoizedFn(1, 5);

        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should handle cache eviction', () => {
        const fn = jest.fn();
        const memoizedFn = memoize(fn, {maxSize: 1});

        memoizedFn(1, 2);
        memoizedFn(1, 3);
        memoizedFn(1, 2);
        memoizedFn(1, 3);

        expect(fn).toHaveBeenCalledTimes(4);
    });

    it('should return cache snapshot', () => {
        const fn = (a: number, b: number) => a + b;
        const memoizedFn = memoize(fn);

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
