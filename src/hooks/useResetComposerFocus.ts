import {useIsFocused} from '@react-navigation/native';
import type {MutableRefObject} from 'react';
import {useEffect, useRef} from 'react';
import type {TextInput} from 'react-native';
import inputFocusResetHandler from '@libs/InputFocusResetHandler';

export default function useResetComposerFocus(inputRef: MutableRefObject<TextInput | null>) {
    const isFocused = useIsFocused();
    const shouldResetFocusRef = useRef(false);

    useEffect(() => {
        if (!isFocused || !shouldResetFocusRef.current) {
            return;
        }

        inputFocusResetHandler.handleInputFocusReset(inputRef, shouldResetFocusRef);
    }, [isFocused, inputRef]);

    return {isFocused, shouldResetFocusRef};
}
