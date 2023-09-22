import {useRef, useState, useCallback} from 'react';
import {useFocusEffect} from '@react-navigation/native';

import CONST from '../CONST';

/**
 * The hook for auto-focusing an input element when the component gains focus.
 * It ensures that the input element is properly initialized before attempting to focus.
 *
 * @returns {object} An object containing the inputRef and inputCallbackRef.
 */
export default function useAutoFocusInput() {
    const [isInputInitialized, setIsInputInitialized] = useState(false);

    const inputRef = useRef(null);

    useFocusEffect(
        useCallback(() => {
            const focusTimeout = setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                }

                return undefined;
            }, CONST.ANIMATED_TRANSITION);

            return () => {
                clearTimeout(focusTimeout);
            };
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [isInputInitialized]),
    );

    const inputCallbackRef = (ref) => {
        inputRef.current = ref;
        setIsInputInitialized(true);
    };

    return {inputRef, inputCallbackRef};
}
