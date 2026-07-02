/**
 * @jest-environment jsdom
 */
import {act, renderHook} from '@testing-library/react-native';
import useControlledState from '@hooks/useControlledState';
import Log from '@libs/Log';

jest.mock('@libs/Log', () => ({warn: jest.fn(), alert: jest.fn(), info: jest.fn()}));

describe('useControlledState', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Uncontrolled', () => {
        it('seeds the initial value from defaultValue', () => {
            const {result} = renderHook(() => useControlledState<number>(undefined, 10));
            expect(result.current[0]).toBe(10);
        });

        it('setValue updates internal state and fires onChange', () => {
            const onChange = jest.fn();
            const {result} = renderHook(() => useControlledState<number>(undefined, 0, onChange));
            act(() => result.current[1](42));
            expect(result.current[0]).toBe(42);
            expect(onChange).toHaveBeenCalledWith(42);
        });

        it('updater form sees the latest value', () => {
            const {result} = renderHook(() => useControlledState<number>(undefined, 0));
            act(() => {
                result.current[1]((n) => n + 1);
                result.current[1]((n) => n + 1);
            });
            expect(result.current[0]).toBe(2);
        });

        it('skips the update when the resolved value is Object.is-equal', () => {
            const onChange = jest.fn();
            const {result} = renderHook(() => useControlledState<number>(undefined, 5, onChange));
            act(() => result.current[1](5));
            expect(onChange).not.toHaveBeenCalled();
        });
    });

    describe('Controlled', () => {
        it('controlled value wins over internal state', () => {
            const {result} = renderHook(({c}: {c: number | undefined}) => useControlledState<number>(c, 0), {
                initialProps: {c: 7},
            });
            expect(result.current[0]).toBe(7);
        });

        it('setValue does not change internal state but still fires onChange', () => {
            const onChange = jest.fn();
            const {result, rerender} = renderHook(({c}: {c: number | undefined}) => useControlledState<number>(c, 0, onChange), {
                initialProps: {c: 1},
            });
            act(() => result.current[1](99));
            expect(onChange).toHaveBeenCalledWith(99);
            expect(result.current[0]).toBe(1);
            rerender({c: 99});
            expect(result.current[0]).toBe(99);
        });

        it('fires onChange again when the parent rejects the previous update (no cached requested value)', () => {
            const onChange = jest.fn();
            const {result} = renderHook(() => useControlledState<number>(1, 0, onChange));
            act(() => result.current[1](99));
            act(() => result.current[1](99));
            expect(onChange).toHaveBeenCalledTimes(2);
            expect(onChange).toHaveBeenNthCalledWith(2, 99);
        });

        it('functional updaters resolve from the committed value, so a toggle retry after a silent rejection re-fires', () => {
            const onChange = jest.fn();
            const {result} = renderHook(() => useControlledState<boolean>(false, false, onChange));
            act(() => result.current[1]((previous) => !previous));
            act(() => result.current[1]((previous) => !previous));
            expect(onChange).toHaveBeenCalledTimes(2);
            expect(onChange).toHaveBeenNthCalledWith(1, true);
            expect(onChange).toHaveBeenNthCalledWith(2, true);
        });
    });

    describe('Mode transitions', () => {
        it('warns in dev when transitioning controlled → uncontrolled', () => {
            const initialProps: {c: number | undefined} = {c: 1};
            const {rerender} = renderHook(({c}: {c: number | undefined}) => useControlledState<number>(c, 0), {initialProps});
            rerender({c: undefined});
            // eslint-disable-next-line @typescript-eslint/unbound-method -- Log is jest.mocked to a plain object whose `warn` is `jest.fn()`; static analysis sees the unmocked class method.
            expect(Log.warn).toHaveBeenCalledWith(expect.stringContaining('controlled'));
        });

        it('warns in dev when transitioning uncontrolled → controlled', () => {
            const initialProps: {c: number | undefined} = {c: undefined};
            const {rerender} = renderHook(({c}: {c: number | undefined}) => useControlledState<number>(c, 0), {initialProps});
            rerender({c: 1});
            // eslint-disable-next-line @typescript-eslint/unbound-method -- Log is jest.mocked to a plain object whose `warn` is `jest.fn()`; static analysis sees the unmocked class method.
            expect(Log.warn).toHaveBeenCalledWith(expect.stringContaining('uncontrolled'));
        });
    });

    describe('Stability', () => {
        it('returns a stable setValue across renders', () => {
            const {result, rerender} = renderHook(({c}: {c: number | undefined}) => useControlledState<number>(c, 0), {
                initialProps: {c: undefined},
            });
            const first = result.current[1];
            rerender({c: undefined});
            expect(result.current[1]).toBe(first);
        });
    });
});
