import {act, renderHook} from '@testing-library/react-native';

import usePressLoading from '@hooks/usePressLoading';

import Log from '@libs/Log';

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

/** Lets the frame the hook waits for before deciding whether to clear on settle pass. */
const flushFrame = async () => {
    await act(async () => {
        jest.advanceTimersByTime(16);
    });
};

/** Stands in for a screen's navigation object, so a test can fire the 'focus' event the hook subscribes to. */
const createNavigationStub = () => {
    const focusListeners = new Set<() => void>();
    let isFocused = true;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const navigation = {
        isFocused: () => isFocused,
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
        blur: () => {
            isFocused = false;
        },
        emitFocus: () => {
            isFocused = true;
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
        jest.restoreAllMocks();
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

    it('ignores a second press that lands before the first one settles', async () => {
        // Given a hook whose first press is still waiting for its deferred work to run
        const {result} = renderHook(() => usePressLoading());
        const work = jest.fn();

        // When the button is pressed twice in the same tick, before React commits isPressed and disables it
        act(() => {
            result.current.startWithLoading(work);
            result.current.startWithLoading(work);
        });
        await flush();

        // Then the work runs once, so a fast double tap cannot submit twice
        expect(work).toHaveBeenCalledTimes(1);
    });

    it('accepts a new press once the previous one has settled', async () => {
        // Given a press that already ran to completion and released the guard
        const {result} = renderHook(() => usePressLoading());
        const work = jest.fn();
        act(() => {
            result.current.startWithLoading(work);
        });
        await flush();
        await flushFrame();

        // When the button is pressed again
        act(() => {
            result.current.startWithLoading(work);
        });
        await flush();

        // Then the second press runs too, so the guard only blocks overlapping presses
        expect(work).toHaveBeenCalledTimes(2);
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
        await flushFrame();

        // Then the consumer becomes usable again instead of staying disabled forever
        expect(result.current.isLoading).toBe(false);
    });

    it('keeps the loading state through the frame after settle so an external isLoading can take over without a gap', async () => {
        // Given a consumer whose loading flag is driven externally (e.g. by Onyx)
        const {result, rerender} = renderHook((props: {isLoading?: boolean} = {}) => usePressLoading(props), {initialProps: {isLoading: false}});

        // When a synchronous handler runs to completion
        act(() => {
            result.current.startWithLoading(() => {});
        });
        await flush();

        // Then the flag stays set until the next frame, which gives the external flag time to arrive.
        // Clearing right on settle would blink the spinner off and reopen the press guard with it.
        expect(result.current.isLoading).toBe(true);

        // And once the external flag arrives, it owns the state
        rerender({isLoading: true});
        expect(result.current.isLoading).toBe(true);

        // And when the external flag clears, so does the loading state
        rerender({isLoading: false});
        expect(result.current.isLoading).toBe(false);
    });

    it('clears the loading state after settle when an external isLoading never turns true', async () => {
        // Given a consumer with an external flag whose handler bails out before driving it, as a validation failure does
        const {result} = renderHook(() => usePressLoading({isLoading: false}));

        // When the handler runs to completion and the next frame passes
        act(() => {
            result.current.startWithLoading(() => {});
        });
        await flush();
        await flushFrame();

        // Then the spinner clears instead of hanging while it waits for a hand-over that is never coming
        expect(result.current.isLoading).toBe(false);
    });

    it('clears the loading state and logs instead of rejecting when the work fails', async () => {
        // Given a handler that rejects, where press callers drop the promise so a rejection would go unhandled
        const alertSpy = jest.spyOn(Log, 'alert').mockImplementation(() => {});
        const {result} = renderHook(() => usePressLoading({isLoading: false}));
        let pressPromise: Promise<void> | undefined;

        // When it is pressed
        await act(async () => {
            pressPromise = result.current.startWithLoading(() => Promise.reject(new Error('boom')));
            jest.advanceTimersByTime(1);
        });

        // Then the promise resolves, the failure is logged and the consumer is usable again
        await expect(pressPromise).resolves.toBeUndefined();
        expect(alertSpy).toHaveBeenCalledWith('[usePressLoading] Press handler failed', {error: 'Error: boom'});
        expect(result.current.isLoading).toBe(false);
    });

    it('clears the loading state and logs instead of rejecting when the work fails with no external isLoading', async () => {
        // Given a handler that rejects on the branch most consumers are on, with no flag to hand over to
        const alertSpy = jest.spyOn(Log, 'alert').mockImplementation(() => {});
        const {result} = renderHook(() => usePressLoading());
        let pressPromise: Promise<void> | undefined;

        // When it is pressed
        await act(async () => {
            pressPromise = result.current.startWithLoading(() => Promise.reject(new Error('boom')));
            jest.advanceTimersByTime(1);
        });

        // Then the catch clears the pressed state right away, so the button does not stay stuck, and nothing rejects
        await expect(pressPromise).resolves.toBeUndefined();
        expect(alertSpy).toHaveBeenCalledTimes(1);
        expect(result.current.isLoading).toBe(false);
    });

    it('clears the loading state and logs instead of rejecting when the work throws synchronously', async () => {
        // Given a handler that throws synchronously, which the deferral turns into a rejection inside the hook
        const alertSpy = jest.spyOn(Log, 'alert').mockImplementation(() => {});
        const {result} = renderHook(() => usePressLoading());
        let pressPromise: Promise<void> | undefined;

        // When it is pressed
        await act(async () => {
            pressPromise = result.current.startWithLoading(() => {
                throw new Error('boom');
            });
            jest.advanceTimersByTime(1);
        });

        // Then the throw is logged rather than escaping as an unhandled rejection, and the spinner is gone
        await expect(pressPromise).resolves.toBeUndefined();
        expect(alertSpy).toHaveBeenCalledWith('[usePressLoading] Press handler failed', {error: 'Error: boom'});
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

    it('holds the loading state after a synchronous handler that navigated away, until the screen regains focus', async () => {
        // Given a synchronous handler that navigates away, as a save-and-dismiss handler does
        const {wrapper, blur, emitFocus} = createNavigationStub();
        const {result} = renderHook(() => usePressLoading(), {wrapper});

        // When it is pressed and returns with the screen no longer focused
        act(() => {
            result.current.startWithLoading(() => {
                blur();
            });
        });
        await flush();

        // Then the spinner stays up, so it does not blink off and reopen the press guard during the transition
        expect(result.current.isLoading).toBe(true);

        // And the focus reset clears it once the user comes back
        act(() => {
            emitFocus();
        });
        expect(result.current.isLoading).toBe(false);
    });

    it('holds the loading state after a handler that navigates away in a deferred frame, until the screen regains focus', async () => {
        // Given a handler that navigates through setNavigationActionToMicrotaskQueue (microtask + rAF), as most form submits do
        const {wrapper, blur, emitFocus} = createNavigationStub();
        const {result} = renderHook(() => usePressLoading(), {wrapper});

        // When it is pressed, returns while the screen is still focused, and the deferred navigation runs in the next frame
        act(() => {
            result.current.startWithLoading(() => {
                Promise.resolve().then(() => requestAnimationFrame(blur));
            });
        });
        await flush();
        await flushFrame();

        // Then the spinner stays up, so the button label does not flash back while the screen transitions away
        expect(result.current.isLoading).toBe(true);

        // And the focus reset clears it once the user comes back
        act(() => {
            emitFocus();
        });
        expect(result.current.isLoading).toBe(false);
    });

    it('clears the loading state after a synchronous handler that stayed on a focused screen', async () => {
        // Given a synchronous handler that bails out without navigating, as a validation failure does
        const {wrapper} = createNavigationStub();
        const {result} = renderHook(() => usePressLoading(), {wrapper});

        // When it is pressed and returns
        act(() => {
            result.current.startWithLoading(() => {});
        });
        await flush();
        await flushFrame();

        // Then the button is usable again instead of spinning until some later focus event
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
        await flushFrame();
        expect(renderHookResult?.result.current.isLoading).toBe(false);
    });
});
