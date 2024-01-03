import {useFocusEffect} from '@react-navigation/native';
import {MutableRefObject, useCallback, useRef} from 'react';
import {TextInput} from 'react-native';
import CONST from '@src/CONST';

/**
 * Focus a text input when a screen is navigated to, after the specified time delay has elapsed.
 */
export default function useDelayedInputFocus(inputRef: MutableRefObject<TextInput>, delay: number = CONST.ANIMATED_TRANSITION) {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useFocusEffect(
        useCallback(() => {
            timeoutRef.current = setTimeout(() => inputRef.current?.focus(), delay);
            return () => {
                if (!timeoutRef.current) {
                    return;
                }
                clearTimeout(timeoutRef.current);
            };
        }, [delay, inputRef]),
    );
}
