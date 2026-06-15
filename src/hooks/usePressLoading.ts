import {useCallback, useState} from 'react';

/**
 * Bridges the gap between a button press and the consumer-driven `isLoading` becoming visible.
 *
 * On press, `startPressLoading` shows the spinner (`isPressed`) and defers the work by a tick so React can paint
 * the spinner before the (possibly JS-blocking) work runs. `isPressed` then stays on until `isLoading` turns true.
 */
function usePressLoading(isLoading = false) {
    const [isPressed, setIsPressed] = useState(false);

    const startPressLoading = useCallback((onPress: () => void) => {
        setIsPressed(true);
        setTimeout(onPress, 0);
    }, []);

    if (isPressed && isLoading) {
        setIsPressed(false);
    }

    return {isPressed, startPressLoading};
}

export default usePressLoading;
