import type {RefObject} from 'react';
import {useRef} from 'react';
import type {TextInputKeyPressEvent} from 'react-native';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import {focusedItemRef} from '@hooks/useSyncFocus/useSyncFocusImplementation';
import CONST from '@src/CONST';

type UseSelectionListTextInputResult = {
    /** Ref to attach to the search TextInput */
    innerTextInputRef: RefObject<BaseTextInputRef | null>;

    /** Whether the search TextInput currently holds focus (used to gate row focus sync) */
    isTextInputFocusedRef: RefObject<boolean>;

    /** Focuses the search TextInput */
    focusTextInput: () => void;

    /** On Tab inside the search input, switches to keyboard-nav mode and moves focus to the focused row */
    textInputKeyPress: (event: TextInputKeyPressEvent) => void;
};

/**
 * Owns the SelectionList search TextInput's refs and key handlers, shared by BaseSelectionList and
 * BaseSelectionListWithSections. Consumers attach `innerTextInputRef` to the TextInput and call
 * `focusTextInput()` rather than poking the ref, so the refs stay out of their dependency arrays.
 */
function useSelectionListTextInput(setHasKeyBeenPressed: () => void): UseSelectionListTextInputResult {
    const innerTextInputRef = useRef<BaseTextInputRef | null>(null);
    const isTextInputFocusedRef = useRef<boolean>(false);

    const focusTextInput = () => {
        innerTextInputRef.current?.focus();
    };

    const textInputKeyPress = (event: TextInputKeyPressEvent) => {
        if (event.nativeEvent.key !== CONST.KEYBOARD_SHORTCUTS.TAB.shortcutKey) {
            return;
        }
        setHasKeyBeenPressed();
        focusedItemRef?.focus();
    };

    return {innerTextInputRef, isTextInputFocusedRef, focusTextInput, textInputKeyPress};
}

export default useSelectionListTextInput;
