import {useFocusEffect} from '@react-navigation/native';
import {useCallback, useRef} from 'react';
import CONST from '@src/CONST';

/**
 * Focus a text input when a screen is navigated to, after the specified time delay has elapsed.
 *
 * @param {Object} inputRef
 * @param {Number} [delay]
 */
export default function useDelayedInputFocus(inputRef, delay = CONST.ANIMATED_TRANSITION) {
    const timeoutRef = useRef(null);

    useFocusEffect(
        useCallback(() => {
            timeoutRef.current = setTimeout(() => inputRef.current && inputRef.current.focus(), delay);
            return () => {
                if (!timeoutRef.current) {
                    return;
                }
                clearTimeout(timeoutRef.current);
            };
        }, [delay, inputRef]),
    );
}
