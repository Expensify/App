/**
 * @jest-environment jsdom
 */
import {renderHook} from '@testing-library/react-native';

import useCallbackRef, {useRefMirror} from '@hooks/useCallbackRef';

describe('useCallbackRef', () => {
    it('returns a callback whose identity is stable across re-renders', () => {
        const {result, rerender} = renderHook(({fn}: {fn: (n: number) => number}) => useCallbackRef(fn), {
            initialProps: {fn: (n: number) => n + 1},
        });
        const first = result.current;
        rerender({fn: (n: number) => n + 100});
        expect(result.current).toBe(first);
    });

    it('always invokes the latest callback (no stale closure)', () => {
        const {result, rerender} = renderHook(({fn}: {fn: (n: number) => number}) => useCallbackRef(fn), {
            initialProps: {fn: (n: number) => n + 1},
        });
        expect(result.current(10)).toBe(11);
        rerender({fn: (n: number) => n + 100});
        expect(result.current(10)).toBe(110);
    });

    it('forwards arguments and the return value', () => {
        const fn = (a: number, b: number) => a * b;
        const {result} = renderHook(() => useCallbackRef(fn));
        expect(result.current(3, 7)).toBe(21);
    });
});

describe('useRefMirror', () => {
    it('reflects the latest value after each render', () => {
        const {result, rerender} = renderHook(({value}: {value: string}) => useRefMirror(value), {
            initialProps: {value: 'a'},
        });
        expect(result.current.current).toBe('a');
        rerender({value: 'b'});
        expect(result.current.current).toBe('b');
    });

    it('returns the same ref object across renders (no remount)', () => {
        const {result, rerender} = renderHook(({value}: {value: string}) => useRefMirror(value), {
            initialProps: {value: 'a'},
        });
        const first = result.current;
        rerender({value: 'b'});
        expect(result.current).toBe(first);
    });
});
