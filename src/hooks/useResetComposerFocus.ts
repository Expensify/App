import {useIsFocused} from '@react-navigation/native';
import type {MutableRefObject} from 'react';
import {useEffect, useRef} from 'react';
import type {TextInput} from 'react-native';

export default function useResetComposerFocus(inputRef: MutableRefObject<TextInput | null>) {
    const isFocused = useIsFocused();
    const shouldResetFocus = useRef(false);

    useEffect(() => {
        if (!isFocused || !shouldResetFocus.current) {
            return;
        }
        inputRef.current?.focus(); // focus input again
        shouldResetFocus.current = false;
    }, [isFocused, inputRef]);

    return {isFocused, shouldResetFocus};
}
