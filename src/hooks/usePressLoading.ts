import {useFocusEffect} from '@react-navigation/native';
import {useCallback, useState} from 'react';

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
    startWithLoading: (runAfterPaint: () => void) => Promise<void>;
};

/**
 * Shows a spinner the moment a button is pressed, so the interaction feels responsive and the INP metric improves.
 *
 * On many submit buttons nothing visible happens for a while after the press, because the handler runs a
 * Onyx update that forces many components on the page to re-render before the new state appears.
 * This hook shows the loading and lets React paint it first, then runs the real work, so the user gets immediate
 * feedback instead of an unresponsive button. When a loading state already exists, pass it in as isLoading so the
 * spinner is guaranteed to render before the heavy work starts.
 */
function usePressLoading({isLoading = false, resetOnFocus = true}: UsePressLoadingOptions = {}): UsePressLoadingReturn {
    const [isPressed, setIsPressed] = useState(false);

    // Resetting here hands the loading state over from the local press flag to the external isLoading once it turns true.
    if (isPressed && isLoading) {
        setIsPressed(false);
    }
    // Defer the work by one macrotask so React can commit isPressed and paint the spinner before the consumer code that may block the JS thread runs.
    const startWithLoading = async (runAfterPaint: () => void) => {
        setIsPressed(true);
        await new Promise((resolve) => {
            setTimeout(resolve, 0);
        });
        try {
            runAfterPaint();
        } catch (error) {
            setIsPressed(false);
            throw error;
        }
    };

    useFocusEffect(
        useCallback(() => {
            if (!resetOnFocus) {
                return;
            }
            setIsPressed(false);
        }, [resetOnFocus]),
    );

    return {isLoading: isPressed || isLoading, startWithLoading};
}

export default usePressLoading;
