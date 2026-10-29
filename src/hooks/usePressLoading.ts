import Log from '@libs/Log';

import {NavigationContext} from '@react-navigation/core';
import {useContext, useEffect, useRef, useState} from 'react';

type UsePressLoadingOptions = {
    /** External loading flag (e.g. driven by Onyx). Defaults to false. */
    isLoading?: boolean;
    /** Reset the pressed state when the screen regains navigation focus. Defaults to true. */
    resetOnFocus?: boolean;
};

/**
 * Paints the loading state, then runs `runAfterPaint` one macrotask later, so a JS-blocking handler still gives
 * immediate feedback. The promise it gives back resolves once the work settles.
 */
type StartWithLoading = (runAfterPaint: () => void | Promise<void>) => Promise<void>;

type UsePressLoadingReturn = {
    /** True while the button press is pending or the external loading flag is set, so the spinner stays visible. */
    isLoading: boolean;
    /** Call instead of a bare press handler to show the spinner immediately on press. */
    startWithLoading: StartWithLoading;
};

/** Shows a spinner the moment a button is pressed, before the real work runs. */
function usePressLoading({isLoading = false, resetOnFocus = true}: UsePressLoadingOptions = {}): UsePressLoadingReturn {
    const [isPressed, setIsPressed] = useState(false);
    // The press in flight, set synchronously so a second press before React commits isPressed is ignored
    const activePressRef = useRef<symbol | null>(null);
    const navigationContext = useContext(NavigationContext);

    // Hands the loading state over from the pressed flag to the external isLoading once it turns true
    if (isPressed && isLoading) {
        setIsPressed(false);
    }

    const release = (press: symbol, shouldClear: boolean) => {
        if (activePressRef.current !== press) {
            return;
        }
        activePressRef.current = null;
        if (shouldClear) {
            setIsPressed(false);
        }
    };

    // Defer the work by one macrotask so React can commit isPressed and paint the spinner before the consumer code that may block the JS thread runs.
    const startWithLoading: StartWithLoading = async (runAfterPaint) => {
        if (activePressRef.current) {
            return;
        }
        const press = Symbol('press');
        activePressRef.current = press;
        setIsPressed(true);
        await new Promise((resolve) => {
            setTimeout(resolve, 0);
        });
        try {
            await runAfterPaint();
        } catch (error) {
            release(press, true);
            Log.alert('[usePressLoading] Press handler failed', {error: String(error)});
            return;
        }
        requestAnimationFrame(() => release(press, navigationContext?.isFocused() ?? true));
    };

    useEffect(() => {
        if (!resetOnFocus || !isPressed || !navigationContext) {
            return;
        }
        return navigationContext.addListener('focus', () => {
            activePressRef.current = null;
            setIsPressed(false);
        });
    }, [resetOnFocus, isPressed, navigationContext]);

    return {isLoading: isPressed || isLoading, startWithLoading};
}

export default usePressLoading;
export type {StartWithLoading};
