import {NavigationContext} from '@react-navigation/core';
import {useContext, useEffect, useRef, useState} from 'react';

type UsePressLoadingOptions = {
    /**
     * External loading flag (e.g. driven by Onyx). Leave it undefined when there is none.
     */
    isLoading?: boolean;
    /** Reset the pressed state when the screen regains navigation focus. Defaults to true. */
    resetOnFocus?: boolean;
};

/**
 * Paints the loading state, then runs `runAfterPaint` one macrotask later, so a JS-blocking handler still gives
 * immediate feedback. Return the promise it gives back, so a throwing handler rejects up the chain.
 */
type StartWithLoading = (runAfterPaint: () => void | Promise<void>) => Promise<void>;

type UsePressLoadingReturn = {
    /** True while the button press is pending or the external loading flag is set, so the spinner stays visible. */
    isLoading: boolean;
    /** Call instead of a bare press handler to show the spinner immediately on press. */
    startWithLoading: StartWithLoading;
};

/**
 * Shows a spinner the moment a button is pressed, so the interaction feels responsive and the INP metric improves.
 *
 * Submit handlers often run an Onyx update that re-renders the whole page before anything appears, leaving the button
 * dead in the meantime. This paints the spinner first, then runs the real work. Pass any loading state that already
 * exists as isLoading, so the spinner is guaranteed to render before the heavy work starts.
 */
function usePressLoading({isLoading, resetOnFocus = true}: UsePressLoadingOptions = {}): UsePressLoadingReturn {
    const [isPressed, setIsPressed] = useState(false);
    // Bumped on every press and focus reset, so a stale invocation cannot clear the loading state of a newer one.
    const invocationRef = useRef(0);
    // Set synchronously on press, so a second press landing before React commits isPressed is ignored instead of running the work twice.
    const isRunningRef = useRef(false);

    const hasExternalLoading = isLoading !== undefined;

    if (isPressed && isLoading) {
        setIsPressed(false);
    }
    // Defer the work by one macrotask so React can commit isPressed and paint the spinner before the consumer code that may block the JS thread runs.
    const startWithLoading: StartWithLoading = async (runAfterPaint) => {
        if (isRunningRef.current) {
            return;
        }
        isRunningRef.current = true;
        invocationRef.current += 1;
        const invocation = invocationRef.current;
        setIsPressed(true);
        await new Promise((resolve) => {
            setTimeout(resolve, 0);
        });
        let result: void | Promise<void>;
        try {
            result = runAfterPaint();
            await result;
        } catch (error) {
            if (invocation === invocationRef.current) {
                isRunningRef.current = false;
                setIsPressed(false);
            }
            throw error;
        }
        if (invocation !== invocationRef.current) {
            return;
        }
        isRunningRef.current = false;
        if (!hasExternalLoading && result instanceof Promise) {
            setIsPressed(false);
        }
    };

    const navigationContext = useContext(NavigationContext);

    useEffect(() => {
        if (!resetOnFocus || !isPressed || !navigationContext) {
            return;
        }
        return navigationContext.addListener('focus', () => {
            invocationRef.current += 1;
            isRunningRef.current = false;
            setIsPressed(false);
        });
    }, [resetOnFocus, isPressed, navigationContext]);

    return {isLoading: isPressed || !!isLoading, startWithLoading};
}

export default usePressLoading;
export type {StartWithLoading};
