import {useCallback, useState} from 'react';

/**
 * Bridges the gap between a button press and a loading state becoming visible.
 *
 * `startPressLoading` shows the spinner (`isPressed`) and defers the work by a tick, so React can paint
 * the spinner before the work runs and potentially blocks the JS thread. `isPressed` resets automatically
 * once the deferred work has been kicked off, handing the loading state back to `isLoading`.
 */
function usePressLoading() {
    const [isPressed, setIsPressed] = useState(false);

    const startPressLoading = useCallback((onPress: () => void) => {
        setIsPressed(true);
        // Defer so React commits isPressed=true (and paints the spinner) before consumer code blocks the main thread.
        setTimeout(() => {
            onPress();
            setIsPressed(false);
        }, 0);
    }, []);

    return {isPressed, startPressLoading};
}

export default usePressLoading;
