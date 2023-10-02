import {useCallback, useRef} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import CONST from '../CONST';

/**
 * Focus a text input when a screen is navigated to, after the specified time delay has elapsed.
 *
 * @param {Object} inputRef
 * @param {Number} [delay]
 */
export default function useDelayedInputFocus(inputRef, delay = CONST.INPUT_FOCUS_DELAY) {
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
