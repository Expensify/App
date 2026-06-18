import usePaginatedData from '@hooks/usePaginatedData';

import {act, renderHook} from '@testing-library/react-native';

const buildData = (size: number) => Array.from({length: size}, (_, index) => index);

describe('usePaginatedData', () => {
    describe('initial render', () => {
        it('returns the first pageSize items on first render', () => {
            const data = buildData(50);
            const {result} = renderHook(() => usePaginatedData(data, 10));

            expect(result.current.paginatedData).toEqual(data.slice(0, 10));
        });

        it('reports hasMore=true when data exceeds the first page', () => {
            const {result} = renderHook(() => usePaginatedData(buildData(50), 10));

            expect(result.current.hasMore).toBe(true);
        });

        it('reports hasMore=false when data length equals pageSize exactly (boundary)', () => {
            const {result} = renderHook(() => usePaginatedData(buildData(10), 10));

            expect(result.current.hasMore).toBe(false);
        });

        it('returns empty paginatedData with hasMore=false when data is empty', () => {
            const {result} = renderHook(() => usePaginatedData<number>([], 10));

            expect(result.current.paginatedData).toEqual([]);
            expect(result.current.hasMore).toBe(false);

            act(() => result.current.loadMore());

            expect(result.current.paginatedData).toEqual([]);
            expect(result.current.hasMore).toBe(false);
        });
    });

    describe('loadMore semantics', () => {
        it('advances paginatedData by exactly one pageSize', () => {
            const data = buildData(50);
            const {result} = renderHook(() => usePaginatedData(data, 10));

            act(() => result.current.loadMore());

            expect(result.current.paginatedData).toEqual(data.slice(0, 20));
        });

        it('can be called repeatedly to walk through all pages', () => {
            const data = buildData(50);
            const {result} = renderHook(() => usePaginatedData(data, 10));

            act(() => result.current.loadMore());
            act(() => result.current.loadMore());
            act(() => result.current.loadMore());
            act(() => result.current.loadMore());

            expect(result.current.paginatedData).toEqual(data);
            expect(result.current.hasMore).toBe(false);
        });

        it('is a no-op once hasMore is false', () => {
            const data = buildData(20);
            const {result} = renderHook(() => usePaginatedData(data, 10));

            act(() => result.current.loadMore());
            expect(result.current.hasMore).toBe(false);

            act(() => result.current.loadMore());
            act(() => result.current.loadMore());

            expect(result.current.paginatedData).toEqual(data);
            expect(result.current.hasMore).toBe(false);
        });

        it('flips hasMore to false on the same render that exactly consumes the data', () => {
            const data = buildData(20);
            const {result} = renderHook(() => usePaginatedData(data, 10));

            expect(result.current.hasMore).toBe(true);

            act(() => result.current.loadMore());

            expect(result.current.paginatedData).toEqual(data);
            expect(result.current.hasMore).toBe(false);
        });
    });

    describe('resetKey behavior', () => {
        it('preserves currentPage when resetKey is unchanged across re-renders', () => {
            const data = buildData(50);
            const {result, rerender} = renderHook(({resetKey}) => usePaginatedData(data, 10, {resetKey}), {initialProps: {resetKey: 'a'}});

            act(() => result.current.loadMore());
            expect(result.current.paginatedData).toEqual(data.slice(0, 20));

            rerender({resetKey: 'a'});

            expect(result.current.paginatedData).toEqual(data.slice(0, 20));
        });

        it('resets paginatedData to the first page when resetKey changes', () => {
            const data = buildData(50);
            const {result, rerender} = renderHook(({resetKey}) => usePaginatedData(data, 10, {resetKey}), {initialProps: {resetKey: 'a'}});

            act(() => result.current.loadMore());
            expect(result.current.paginatedData).toEqual(data.slice(0, 20));

            rerender({resetKey: 'b'});

            expect(result.current.paginatedData).toEqual(data.slice(0, 10));
            expect(result.current.hasMore).toBe(true);
        });

        it('treats an omitted config as stable across renders (default resetKey is stable)', () => {
            const data = buildData(50);
            const {result, rerender} = renderHook(() => usePaginatedData(data, 10));

            act(() => result.current.loadMore());
            expect(result.current.paginatedData).toEqual(data.slice(0, 20));

            rerender(undefined);

            expect(result.current.paginatedData).toEqual(data.slice(0, 20));
        });

        it('returns a non-empty page 1 after a resetKey-driven reset', () => {
            const data = buildData(50);
            const {result, rerender} = renderHook(({resetKey}) => usePaginatedData(data, 10, {resetKey}), {initialProps: {resetKey: 'a'}});

            act(() => result.current.loadMore());

            rerender({resetKey: 'b'});

            expect(result.current.paginatedData).toEqual(data.slice(0, 10));
            expect(result.current.paginatedData.length).toBeGreaterThan(0);
        });
    });

    describe('skipPagination behavior', () => {
        it('returns the full data array as paginatedData when skipPagination is true', () => {
            const data = buildData(50);
            const {result} = renderHook(() => usePaginatedData(data, 10, {skipPagination: true}));

            expect(result.current.paginatedData).toEqual(data);
        });

        it('reports hasMore=false when skipPagination is true', () => {
            const {result} = renderHook(() => usePaginatedData(buildData(50), 10, {skipPagination: true}));

            expect(result.current.hasMore).toBe(false);
        });

        it('makes loadMore a no-op when skipPagination is true', () => {
            const data = buildData(50);
            const {result, rerender} = renderHook(({skipPagination}) => usePaginatedData(data, 10, {skipPagination}), {initialProps: {skipPagination: false}});

            act(() => result.current.loadMore());
            expect(result.current.paginatedData).toEqual(data.slice(0, 20));

            rerender({skipPagination: true});
            expect(result.current.paginatedData).toEqual(data);

            act(() => result.current.loadMore());

            rerender({skipPagination: false});
            expect(result.current.paginatedData).toEqual(data.slice(0, 20));
        });

        it('preserves currentPage when skipPagination toggles on then off (resetKey unchanged)', () => {
            const data = buildData(50);
            const {result, rerender} = renderHook(({skipPagination}) => usePaginatedData(data, 10, {skipPagination}), {initialProps: {skipPagination: false}});

            act(() => result.current.loadMore());
            expect(result.current.paginatedData).toEqual(data.slice(0, 20));

            rerender({skipPagination: true});
            expect(result.current.paginatedData).toEqual(data);

            rerender({skipPagination: false});
            expect(result.current.paginatedData).toEqual(data.slice(0, 20));
        });

        it('does not block a new resetKey from registering while skipPagination is true', () => {
            const data = buildData(50);
            const {result, rerender} = renderHook(({skipPagination, resetKey}) => usePaginatedData(data, 10, {resetKey, skipPagination}), {
                initialProps: {skipPagination: false, resetKey: 'a'},
            });

            act(() => result.current.loadMore());
            expect(result.current.paginatedData).toEqual(data.slice(0, 20));

            rerender({skipPagination: true, resetKey: 'b'});
            expect(result.current.paginatedData).toEqual(data);

            rerender({skipPagination: false, resetKey: 'a'});

            expect(result.current.paginatedData).toEqual(data.slice(0, 10));
            expect(result.current.hasMore).toBe(true);
        });
    });

    describe('pageSize edge cases', () => {
        it('returns an empty array with hasMore=false and a no-op loadMore when pageSize=0', () => {
            const data = buildData(50);
            const {result} = renderHook(() => usePaginatedData(data, 0));

            expect(result.current.paginatedData).toEqual([]);
            expect(result.current.hasMore).toBe(false);

            act(() => result.current.loadMore());

            expect(result.current.paginatedData).toEqual([]);
            expect(result.current.hasMore).toBe(false);
        });

        it('treats negative pageSize the same as pageSize=0', () => {
            const data = buildData(50);
            const {result} = renderHook(() => usePaginatedData(data, -5));

            expect(result.current.paginatedData).toEqual([]);
            expect(result.current.hasMore).toBe(false);

            act(() => result.current.loadMore());

            expect(result.current.paginatedData).toEqual([]);
            expect(result.current.hasMore).toBe(false);
        });
    });
});
