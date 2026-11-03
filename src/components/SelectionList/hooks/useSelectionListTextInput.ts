import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import {focusedItemRef} from '@hooks/useSyncFocus/useSyncFocusImplementation';

import CONST from '@src/CONST';

import type {RefObject} from 'react';
import type {TextInputKeyPressEvent} from 'react-native';

import {useRef} from 'react';

type UseSelectionListTextInputResult = {
    innerTextInputRef: RefObject<BaseTextInputRef | null>;
    isTextInputFocusedRef: RefObject<boolean>;
    focusTextInput: () => void;
    textInputKeyPress: (event: Pick<TextInputKeyPressEvent, 'nativeEvent'>) => void;
};

/** Consumers attach innerTextInputRef to the TextInput and call focusTextInput() rather than poking the ref, keeping it out of their dependency arrays. */
function useSelectionListTextInput(setHasKeyBeenPressed: () => void): UseSelectionListTextInputResult {
    const innerTextInputRef = useRef<BaseTextInputRef | null>(null);
    const isTextInputFocusedRef = useRef<boolean>(false);

    const focusTextInput = () => {
        innerTextInputRef.current?.focus();
    };

    const textInputKeyPress = (event: Pick<TextInputKeyPressEvent, 'nativeEvent'>) => {
        if (event.nativeEvent.key !== CONST.KEYBOARD_SHORTCUTS.TAB.shortcutKey) {
            return;
        }
        setHasKeyBeenPressed();
        focusedItemRef?.focus();
    };

    return {innerTextInputRef, isTextInputFocusedRef, focusTextInput, textInputKeyPress};
}

export default useSelectionListTextInput;
