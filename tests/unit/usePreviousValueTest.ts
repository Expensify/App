import {renderHook} from '@testing-library/react-native';
import usePreviousValue from '@hooks/usePreviousValue';

describe('usePreviousValue', () => {
    it('returns undefined on the first render', () => {
        const {result} = renderHook((value: number) => usePreviousValue(value), {initialProps: 1});
        expect(result.current).toBeUndefined();
    });

    it('returns the value from the previous render on subsequent renders', () => {
        const {result, rerender} = renderHook((value: number) => usePreviousValue(value), {initialProps: 1});
        expect(result.current).toBeUndefined();

        rerender(2);
        expect(result.current).toBe(1);

        rerender(3);
        expect(result.current).toBe(2);

        rerender(4);
        expect(result.current).toBe(3);
    });

    it('returns the value before the most-recent change; stable rerenders do not advance it', () => {
        const {result, rerender} = renderHook((value: string) => usePreviousValue(value), {initialProps: 'a'});
        rerender('b');
        expect(result.current).toBe('a');
        rerender('b');
        expect(result.current).toBe('a');
        rerender('b');
        expect(result.current).toBe('a');
        rerender('c');
        expect(result.current).toBe('b');
    });

    it('handles object references by identity', () => {
        const first = {id: 1};
        const second = {id: 2};
        const {result, rerender} = renderHook((value: {id: number}) => usePreviousValue(value), {initialProps: first});
        expect(result.current).toBeUndefined();
        rerender(second);
        expect(result.current).toBe(first);
    });

    it('starts fresh after remount', () => {
        const {result, rerender, unmount} = renderHook((value: number) => usePreviousValue(value), {initialProps: 1});
        rerender(2);
        expect(result.current).toBe(1);
        unmount();

        const remounted = renderHook((value: number) => usePreviousValue(value), {initialProps: 10});
        expect(remounted.result.current).toBeUndefined();
    });
});
