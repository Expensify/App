import {NavigationContext} from '@react-navigation/core';
import {useContext, useEffect, useState} from 'react';

type UsePressLoadingOptions = {
    /** External loading flag (e.g. driven by Onyx) */
    isLoading?: boolean;
    /** Reset the pressed state when the screen regains navigation focus. Defaults to true. */
    resetOnFocus?: boolean;
};

type UsePressLoadingReturn = {
    /** True while the button press is pending or the external loading flag is set, so the spinner stays visible. */
    isLoading: boolean;
    /** Call instead of a bare press handler to show the spinner immediately on press. */
    startWithLoading: (runAfterPaint: () => void | Promise<void>) => Promise<void>;
};

/**
 * Shows a spinner the moment a button is pressed, so the interaction feels responsive and the INP metric improves.
 *
 * On many submit buttons nothing visible happens for a while after the press, because the handler runs a
 * Onyx update that forces many components on the page to re-render before the new state appears.
 * This hook shows the loading and lets React paint it first, then runs the real work, so the user gets immediate
 * feedback instead of an unresponsive button. When a loading state already exists, pass it in as isLoading so the
 * spinner is guaranteed to render before the heavy work starts.
 *
 * The pressed state is never cleared on success: it ends when isLoading turns true, when the screen regains focus, when the work throws, or
 * on unmount. A handler that neither navigates nor drives an external isLoading therefore keeps the spinner up for good.
 */
function usePressLoading({isLoading = false, resetOnFocus = true}: UsePressLoadingOptions = {}): UsePressLoadingReturn {
    const [isPressed, setIsPressed] = useState(false);

    // Resetting here hands the loading state over from the local press flag to the external isLoading once it turns true.
    if (isPressed && isLoading) {
        setIsPressed(false);
    }
    // Defer the work by one macrotask so React can commit isPressed and paint the spinner before the consumer code that may block the JS thread runs.
    // The work is awaited so a rejecting async handler also clears the pressed state.
    const startWithLoading = async (runAfterPaint: () => void | Promise<void>) => {
        setIsPressed(true);
        await new Promise((resolve) => {
            setTimeout(resolve, 0);
        });
        try {
            await runAfterPaint();
        } catch (error) {
            setIsPressed(false);
            throw error;
        }
    };

    // Reset on focus regain covers flows that navigate away and come back with no external isLoading to hand off to.
    // NavigationContext is read directly because useNavigation (and so useFocusEffect) throws with no NavigationContainer above it, and this
    // hook is also used by components that render outside one — there the reset is skipped, as there is nothing to focus.
    const navigationContext = useContext(NavigationContext);

    // Subscribed for the whole lifetime rather than only while a press is pending, so the listener is in place before deferred work can
    // navigate away. The updater keeps that free for consumers that are never pressed: returning the same value skips the re-render.
    useEffect(() => {
        if (!resetOnFocus || !navigationContext) {
            return;
        }
        return navigationContext.addListener('focus', () => setIsPressed((wasPressed) => (wasPressed ? false : wasPressed)));
    }, [resetOnFocus, navigationContext]);

    return {isLoading: isPressed || isLoading, startWithLoading};
}

export default usePressLoading;
