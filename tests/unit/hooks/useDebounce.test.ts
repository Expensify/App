import {act, renderHook} from '@testing-library/react-native';

import useDebounce from '@hooks/useDebounce';

describe('useDebounce', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    it('invokes the debounced function after the wait period elapses', () => {
        const mockFn = jest.fn();
        const wait = 300;

        const {result} = renderHook(() => useDebounce(mockFn, wait));

        act(() => {
            result.current('arg1');
        });

        expect(mockFn).not.toHaveBeenCalled();

        act(() => {
            jest.advanceTimersByTime(wait);
        });

        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(mockFn).toHaveBeenCalledWith('arg1');
    });

    it('cancels a pending debounced call on unmount by default', () => {
        const mockFn = jest.fn();
        const wait = 300;

        const {result, unmount} = renderHook(() => useDebounce(mockFn, wait));

        act(() => {
            result.current('arg1');
        });

        act(() => {
            unmount();
        });

        expect(mockFn).not.toHaveBeenCalled();
    });

    it('flushes a pending debounced call exactly once on unmount when shouldExecuteOnUnmount is true', () => {
        const mockFn = jest.fn();
        const wait = 300;

        const {result, unmount} = renderHook(() => useDebounce(mockFn, wait, {shouldExecuteOnUnmount: true}));

        act(() => {
            result.current('arg1');
        });

        expect(mockFn).not.toHaveBeenCalled();

        act(() => {
            unmount();
        });

        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(mockFn).toHaveBeenCalledWith('arg1');
    });
});
