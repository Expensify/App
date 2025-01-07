import {useIsFocused} from '@react-navigation/native';
import type {MutableRefObject} from 'react';
import {useEffect, useRef} from 'react';
import {InteractionManager} from 'react-native';
import type {TextInput} from 'react-native';

export default function useResetComposerFocus(inputRef: MutableRefObject<TextInput | null>) {
    const isFocused = useIsFocused();
    const shouldResetFocusRef = useRef(false);

    useEffect(() => {
        if (!isFocused || !shouldResetFocusRef.current) {
            return;
        }
        const interactionTask = InteractionManager.runAfterInteractions(() => {
            inputRef.current?.focus(); // focus input again
            shouldResetFocusRef.current = false;
        });
        return () => {
            interactionTask.cancel();
        };
    }, [isFocused, inputRef]);

    return {isFocused, shouldResetFocusRef};
}
