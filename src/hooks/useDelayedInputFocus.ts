import {useFocusEffect} from '@react-navigation/native';
import type {MutableRefObject} from 'react';
import {useCallback} from 'react';
import type {TextInput} from 'react-native';
import CONST from '@src/CONST';

/**
 * Focus a text input when a screen is navigated to, after the specified time delay has elapsed.
 */
export default function useDelayedInputFocus(inputRef: MutableRefObject<TextInput>, delay: number = CONST.ANIMATED_TRANSITION) {
    useFocusEffect(
        useCallback(() => {
            const timeoutRef = setTimeout(() => inputRef.current?.focus(), delay);
            return () => clearTimeout(timeoutRef);
        }, [delay, inputRef]),
    );
}
