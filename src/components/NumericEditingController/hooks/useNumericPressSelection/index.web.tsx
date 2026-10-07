import type {BaseTextInputProps, BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import type {UseNumericPressSelectionParams} from './types';

/** Only the rendered form element exposes the caret offsets. */
function getSelectableElement(input: BaseTextInputRef | null): HTMLInputElement | null {
    return input instanceof HTMLInputElement ? input : null;
}

/**
 * The browser moves the caret on click without emitting a selection change, so the controlled selection would snap it
 * back. Reading the caret from the input element on press keeps the controller selection in sync.
 */
function useNumericPressSelection({inputRef, handleSelectionChange, onPress}: UseNumericPressSelectionParams): BaseTextInputProps['onPress'] {
    return (event) => {
        const inputElement = getSelectableElement(inputRef.current);
        if (inputElement) {
            handleSelectionChange(inputElement.selectionStart ?? 0, inputElement.selectionEnd ?? 0);
        }
        onPress?.(event);
    };
}

export default useNumericPressSelection;
