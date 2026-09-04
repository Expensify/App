import {useNumericInputActions, useNumericInputState} from '@components/NumericInput/context';
import type {BaseTextInputProps, BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

/** Only the rendered form element exposes the caret offsets. */
function getSelectableElement(input: BaseTextInputRef | null): HTMLInputElement | null {
    return input instanceof HTMLInputElement ? input : null;
}

/**
 * The browser moves the caret on click without emitting a selection change, so the controlled selection would snap the
 * caret back to where it was. Reading the caret from the root's input element on press keeps the root selection in sync.
 */
function useNumericPressSelection(onPress?: BaseTextInputProps['onPress']): BaseTextInputProps['onPress'] {
    const {handleSelectionChange} = useNumericInputActions();
    const {inputRef} = useNumericInputState();

    return (event) => {
        const inputElement = getSelectableElement(inputRef.current);
        if (inputElement) {
            handleSelectionChange(inputElement.selectionStart ?? 0, inputElement.selectionEnd ?? 0);
        }
        onPress?.(event);
    };
}

export default useNumericPressSelection;
