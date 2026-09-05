import {act, renderHook} from '@testing-library/react-native';

import usePressLoading from '@hooks/usePressLoading';

import type {NavigationProp, ParamListBase} from '@react-navigation/native';
import type {ReactNode} from 'react';

import {NavigationContext} from '@react-navigation/core';
import {createElement} from 'react';

/** Lets the deferred macrotask and the awaited work settle. */
const flush = async () => {
    await act(async () => {
        jest.advanceTimersByTime(1);
        await Promise.resolve();
    });
};

/** Stands in for a screen's navigation object, so a test can fire the 'focus' event the hook subscribes to. */
const createNavigationStub = () => {
    const focusListeners = new Set<() => void>();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const navigation = {
        addListener: (event: string, callback: () => void) => {
            if (event !== 'focus') {
                return () => {};
            }
            focusListeners.add(callback);
            return () => {
                focusListeners.delete(callback);
            };
        },
    } as unknown as NavigationProp<ParamListBase>;

    return {
        wrapper: ({children}: {children: ReactNode}) => createElement(NavigationContext.Provider, {value: navigation}, children),
        emitFocus: () => {
            for (const listener of focusListeners) {
                listener();
            }
        },
    };
};

/** A handler that navigates away and so never settles, leaving the pressed state for the focus reset to clear. */
const navigateAway = () => new Promise<void>(() => {});

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

    it('clears on settle when isLoading is undefined at press time, even if it turns true later', async () => {
        // Given a consumer that passes an isLoading which has not resolved to a boolean yet, as `someOnyxValue?.isLoading`
        // does before Onyx writes anything
        const {result, rerender} = renderHook((props: {isLoading?: boolean} = {}) => usePressLoading(props));

        // When a synchronous handler runs to completion
        act(() => {
            result.current.startWithLoading(() => {});
        });
        await flush();

        // Then undefined counted as "nobody will take this over", so the pressed state cleared instead of waiting
        expect(result.current.isLoading).toBe(false);

        // And a flag arriving afterwards drives the state on its own, rather than resuming a hand-over that never started
        rerender({isLoading: true});
        expect(result.current.isLoading).toBe(true);
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

    it('clears the loading state and rethrows when the work fails with no external isLoading', async () => {
        // Given a handler that rejects on the branch most consumers are on, with no flag to hand over to
        const {result} = renderHook(() => usePressLoading());
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

        // Then the catch clears the pressed state before rethrowing, so the button does not stay stuck
        expect(caught).toBe(error);
        expect(result.current.isLoading).toBe(false);
    });

    it('clears a pending pressed state when the screen regains focus', async () => {
        // Given a press whose handler navigates away, so nothing settles to clear the pressed state
        const {wrapper, emitFocus} = createNavigationStub();
        const {result} = renderHook(() => usePressLoading(), {wrapper});
        act(() => {
            result.current.startWithLoading(navigateAway);
        });
        await flush();
        expect(result.current.isLoading).toBe(true);

        // When the user comes back and the screen regains focus
        act(() => {
            emitFocus();
        });

        // Then the button is pressable again, instead of spinning for the rest of the session
        expect(result.current.isLoading).toBe(false);
    });

    it('leaves the pressed state alone on focus when resetOnFocus is off', async () => {
        // Given a consumer that opted out of the focus reset
        const {wrapper, emitFocus} = createNavigationStub();
        const {result} = renderHook(() => usePressLoading({resetOnFocus: false}), {wrapper});
        act(() => {
            result.current.startWithLoading(navigateAway);
        });
        await flush();

        // When the screen regains focus
        act(() => {
            emitFocus();
        });

        // Then nothing was subscribed, so the pressed state survives
        expect(result.current.isLoading).toBe(true);
    });

    it('skips the focus reset instead of throwing when there is no navigation context', async () => {
        // Given a component rendered outside a NavigationContainer, where useFocusEffect would throw.
        // This is the reason the hook reads NavigationContext directly rather than using useNavigation.
        let renderHookResult: ReturnType<typeof renderHook<ReturnType<typeof usePressLoading>, unknown>> | undefined;
        expect(() => {
            renderHookResult = renderHook(() => usePressLoading());
        }).not.toThrow();

        // Then presses still work, just without a focus reset to fall back on
        act(() => {
            renderHookResult?.result.current.startWithLoading(() => {});
        });
        expect(renderHookResult?.result.current.isLoading).toBe(true);

        await flush();
        expect(renderHookResult?.result.current.isLoading).toBe(false);
    });
});
