import type UseAmountPressSelectionParams from './types';
import type {AmountPressEvent, AmountPressHandler} from './types';

/** Only the rendered form element exposes the caret offsets. */
function getSelectableElement(input: unknown): HTMLInputElement | null {
    return input instanceof HTMLInputElement ? input : null;
}

/**
 * The browser moves the caret on click without emitting a selection change, so the controlled selection would snap it
 * back. Reading the caret from the input element on press keeps the controller selection in sync.
 */
function useAmountPressSelection({inputRef, handleSelectionChange, onPress}: UseAmountPressSelectionParams): AmountPressHandler {
    const syncCaretOnPress = (event: AmountPressEvent) => {
        const inputElement = getSelectableElement(inputRef.current);
        if (inputElement) {
            handleSelectionChange(inputElement.selectionStart ?? 0, inputElement.selectionEnd ?? 0);
        }
        onPress?.(event);
    };

    return syncCaretOnPress;
}

export default useAmountPressSelection;
