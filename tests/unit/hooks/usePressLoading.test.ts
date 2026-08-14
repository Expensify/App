import {act, renderHook} from '@testing-library/react-native';

import usePressLoading from '@hooks/usePressLoading';

/** Lets the deferred macrotask and the awaited work settle. */
const flush = async () => {
    await act(async () => {
        jest.advanceTimersByTime(1);
        await Promise.resolve();
    });
};

describe('usePressLoading', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('shows the loading state immediately on press, before the work runs', async () => {
        // Given a hook with no external loading flag
        const {result} = renderHook(() => usePressLoading());
        const work = jest.fn();

        // When a press starts
        act(() => {
            result.current.startWithLoading(work);
        });

        // Then the loading state is already set and the work has not run yet
        expect(result.current.isLoading).toBe(true);
        expect(work).not.toHaveBeenCalled();

        await flush();
        expect(work).toHaveBeenCalledTimes(1);
    });

    it('clears the loading state once the work settles when there is no external isLoading', async () => {
        // Given a handler that returns without navigating and without driving an external flag,
        // as a validation bail-out does
        const {result} = renderHook(() => usePressLoading());

        // When it is pressed and the work settles
        act(() => {
            result.current.startWithLoading(() => {});
        });
        await flush();

        // Then the consumer becomes usable again instead of staying disabled forever
        expect(result.current.isLoading).toBe(false);
    });

    it('holds the loading state until an external isLoading takes over, without a gap', async () => {
        // Given a consumer whose loading flag is driven externally (e.g. by Onyx)
        const {result, rerender} = renderHook((props: {isLoading?: boolean} = {}) => usePressLoading(props), {initialProps: {isLoading: false}});

        // When a synchronous handler runs to completion
        act(() => {
            result.current.startWithLoading(() => {});
        });
        await flush();

        // Then the flag stays set while the external one is still on its way. Clearing here would blink
        // the spinner off during exactly the wait it exists to cover, and reopen the press guard with it.
        expect(result.current.isLoading).toBe(true);

        // And once the external flag arrives, it owns the state
        rerender({isLoading: true});
        expect(result.current.isLoading).toBe(true);

        // And when the external flag clears, so does the loading state
        rerender({isLoading: false});
        expect(result.current.isLoading).toBe(false);
    });

    it('clears the loading state and rethrows when the work fails', async () => {
        // Given a handler that rejects
        const {result} = renderHook(() => usePressLoading({isLoading: false}));
        const error = new Error('boom');
        let caught: unknown;

        // When it is pressed
        await act(async () => {
            result.current
                .startWithLoading(() => Promise.reject(error))
                .catch((caughtError: unknown) => {
                    caught = caughtError;
                });
            jest.advanceTimersByTime(1);
        });

        // Then the error reaches the caller and the consumer is usable again
        expect(caught).toBe(error);
        expect(result.current.isLoading).toBe(false);
    });
});
