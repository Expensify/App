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

    it('should not restart delay when the same value is set repeatedly while pending', () => {
        // Given a hook initialized with an empty string
        const {result} = renderHook(() => useDebouncedState(''));

        // When a value is set and then re-set halfway through the delay
        act(() => {
            result.current[2]('john');
        });
        act(() => {
            jest.advanceTimersByTime(150);
            result.current[2]('john');
        });
        act(() => {
            jest.advanceTimersByTime(CONST.TIMING.USE_DEBOUNCED_STATE_DELAY - 150);
        });

        // Then debounced value settles without waiting an extra full delay
        expect(result.current[1]).toBe('john');
    });

    it('should restart the pending timer with the new delay when the delay changes', () => {
        // Given a hook with a long delay and a pending value
        const {result, rerender} = renderHook(({delay}: {delay: number}) => useDebouncedState('', delay), {initialProps: {delay: 1000}});
        act(() => {
            result.current[2]('john');
        });
        act(() => {
            jest.advanceTimersByTime(500);
        });

        // When the delay is shortened while the value is still pending
        rerender({delay: 100});
        act(() => {
            jest.advanceTimersByTime(99);
        });

        // Then the debounced value waits for the full new delay, not the old one
        expect(result.current[1]).toBe('');
        act(() => {
            jest.advanceTimersByTime(1);
        });
        expect(result.current[1]).toBe('john');
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

        it('should not fire when the hook unmounts while a value is pending', () => {
            // Given a callback and a pending value
            const onDebouncedValueChange = jest.fn();
            const {result, unmount} = renderHook(() => useDebouncedState<string>('', CONST.TIMING.USE_DEBOUNCED_STATE_DELAY, {onDebouncedValueChange}));
            act(() => {
                result.current[2]('john');
            });

            // When the hook unmounts before the delay elapses
            unmount();
            act(() => {
                jest.advanceTimersByTime(CONST.TIMING.USE_DEBOUNCED_STATE_DELAY);
            });

            // Then the pending value is dropped and no change is reported, since nothing will render it
            expect(onDebouncedValueChange).not.toHaveBeenCalled();
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
