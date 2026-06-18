import {useFocusEffect} from '@react-navigation/native';
import {useCallback, useState} from 'react';

type UsePressLoadingOptions = {
    /** External loading flag (e.g. driven by Onyx) */
    isLoading?: boolean;
    /** Reset the pressed state when the screen regains navigation focus. Defaults to true. */
    resetOnFocus?: boolean;
};

type UsePressLoading = {
    /** Whenever the button has been pressed and the spinner should be visible */
    isLoading: boolean;
    /** Call instead of a bare press handler to show the spinner immediately on press. */
    startWithLoading: (work: () => void) => void;
};

/** Shows a spinner immediately on press, bridging the gap before external loading state kicks in. */
function usePressLoading({isLoading = false, resetOnFocus = true}: UsePressLoadingOptions = {}): UsePressLoading {
    const [isPressed, setIsPressed] = useState(false);

    if (isPressed && isLoading) {
        setIsPressed(false);
    }

    const startWithLoading = (onPress: () => void) => {
        setIsPressed(true);
        setTimeout(() => {
            try {
                onPress();
            } catch (error) {
                setIsPressed(false);
                throw error;
            }
        }, 0);
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
export type {UsePressLoadingOptions, UsePressLoading};
