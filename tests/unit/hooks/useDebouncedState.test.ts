import {act, renderHook} from '@testing-library/react-native';
import useDebouncedState from '@hooks/useDebouncedState';
import CONST from '@src/CONST';

describe('useDebouncedState', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    it('should update immediate value synchronously while debounced value waits', () => {
        const {result} = renderHook(() => useDebouncedState(''));

        act(() => {
            result.current[2]('john');
        });

        expect(result.current[0]).toBe('john');
        expect(result.current[1]).toBe('');
    });

    it('should update debounced value after delay elapses', () => {
        const {result} = renderHook(() => useDebouncedState(''));

        act(() => {
            result.current[2]('john');
        });

        act(() => {
            jest.advanceTimersByTime(CONST.TIMING.USE_DEBOUNCED_STATE_DELAY);
        });

        expect(result.current[1]).toBe('john');
    });

    it('should debounce rapid changes and only emit final value', () => {
        const {result} = renderHook(() => useDebouncedState(''));

        // Simulate rapid typing
        act(() => {
            result.current[2]('j');
        });
        act(() => {
            jest.advanceTimersByTime(50);
            result.current[2]('jo');
        });
        act(() => {
            jest.advanceTimersByTime(50);
            result.current[2]('joh');
        });
        act(() => {
            jest.advanceTimersByTime(50);
            result.current[2]('john');
        });

        // Debounced value should still be empty
        expect(result.current[1]).toBe('');

        act(() => {
            jest.advanceTimersByTime(CONST.TIMING.USE_DEBOUNCED_STATE_DELAY);
        });

        // Only final value should be emitted
        expect(result.current[1]).toBe('john');
    });

    it('should cancel pending updates on unmount', () => {
        const {result, unmount} = renderHook(() => useDebouncedState(''));

        act(() => {
            result.current[2]('pending');
        });

        unmount();

        expect(() => {
            act(() => {
                jest.advanceTimersByTime(CONST.TIMING.USE_DEBOUNCED_STATE_DELAY);
            });
        }).not.toThrow();
    });
});
