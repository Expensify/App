import type {BaseTextInputRef} from './types';

type FocusableTextInputRef = BaseTextInputRef & {
    isFocused: () => boolean;
};

function isFocusableTextInputRef(textInput: BaseTextInputRef): textInput is FocusableTextInputRef {
    return 'isFocused' in textInput && typeof textInput.isFocused === 'function';
}

/** Checks that text input has the isFocused method and is focused. */
export default function isTextInputFocused(textInput: React.RefObject<BaseTextInputRef | null>): boolean | null {
    const currentTextInput = textInput.current;
    if (!currentTextInput || !isFocusableTextInputRef(currentTextInput)) {
        return null;
    }

    return currentTextInput.isFocused();
}
