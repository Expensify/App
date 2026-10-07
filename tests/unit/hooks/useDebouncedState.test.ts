import {act, renderHook} from '@testing-library/react-native';

import useDebouncedState from '@hooks/useDebouncedState';

import CONST from '@src/CONST';

describe('useDebouncedState', () => {
    let latestDebouncedValue = '';

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
    describe('onDebouncedValueChange', () => {
        it('should fire once per distinct debounced value, before the debounced state updates', () => {
            // Given a callback that records the debounced state seen at call time
            const seenDebouncedValues: string[] = [];
            const {result} = renderHook(() => {
                const state = useDebouncedState<string>('', CONST.TIMING.USE_DEBOUNCED_STATE_DELAY, {
                    onDebouncedValueChange: () => seenDebouncedValues.push(latestDebouncedValue),
                });
                latestDebouncedValue = state[1];
                return state;
            });

            // When the debounce timer fires for a new value
            act(() => {
                result.current[2]('john');
            });
            act(() => {
                jest.advanceTimersByTime(CONST.TIMING.USE_DEBOUNCED_STATE_DELAY);
            });

            // Then the callback ran while the render still held the previous value
            expect(seenDebouncedValues).toEqual(['']);
            expect(result.current[1]).toBe('john');
        });

        it('should not fire when the debounced value is unchanged', () => {
            // Given a callback
            const onDebouncedValueChange = jest.fn();
            const {result} = renderHook(() => useDebouncedState<string>('', CONST.TIMING.USE_DEBOUNCED_STATE_DELAY, {onDebouncedValueChange}));

            // When the same value is set twice and the initial value is re-set
            act(() => {
                result.current[2]('john');
            });
            act(() => {
                jest.advanceTimersByTime(CONST.TIMING.USE_DEBOUNCED_STATE_DELAY);
            });
            act(() => {
                result.current[2]('john');
            });
            act(() => {
                jest.advanceTimersByTime(CONST.TIMING.USE_DEBOUNCED_STATE_DELAY);
            });

            // Then it fired exactly once
            expect(onDebouncedValueChange).toHaveBeenCalledTimes(1);
            expect(onDebouncedValueChange).toHaveBeenCalledWith('john');
        });

        it('should skip the callback for rapid intermediate values', () => {
            // Given a callback
            const onDebouncedValueChange = jest.fn();
            const {result} = renderHook(() => useDebouncedState<string>('', CONST.TIMING.USE_DEBOUNCED_STATE_DELAY, {onDebouncedValueChange}));

            // When values change faster than the delay
            act(() => {
                result.current[2]('j');
            });
            act(() => {
                jest.advanceTimersByTime(50);
                result.current[2]('jo');
            });
            act(() => {
                jest.advanceTimersByTime(CONST.TIMING.USE_DEBOUNCED_STATE_DELAY);
            });

            // Then only the final value is reported
            expect(onDebouncedValueChange).toHaveBeenCalledTimes(1);
            expect(onDebouncedValueChange).toHaveBeenCalledWith('jo');
        });

        it('should still update the debounced value when the callback throws', () => {
            // Given a callback that throws, e.g. a telemetry failure
            const onDebouncedValueChange = jest.fn(() => {
                throw new Error('callback failed');
            });
            const {result} = renderHook(() => useDebouncedState<string>('', CONST.TIMING.USE_DEBOUNCED_STATE_DELAY, {onDebouncedValueChange}));

            // When the debounce timer fires for a new value
            act(() => {
                result.current[2]('john');
            });
            act(() => {
                jest.advanceTimersByTime(CONST.TIMING.USE_DEBOUNCED_STATE_DELAY);
            });

            // Then the callback was called and the consumer is not stuck on the stale debounced value
            expect(onDebouncedValueChange).toHaveBeenCalledWith('john');
            expect(result.current[1]).toBe('john');
        });
    });
});
