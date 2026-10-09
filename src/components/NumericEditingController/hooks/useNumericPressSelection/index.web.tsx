import type UseNumericPressSelectionParams from './types';

/** Only the rendered form element exposes the caret offsets. */
function getSelectableElement(input: unknown): HTMLInputElement | null {
    return input instanceof HTMLInputElement ? input : null;
}

/**
 * The browser moves the caret on click without emitting a selection change, so the controlled selection would snap it
 * back. Reading the caret from the input element on press keeps the controller selection in sync.
 */
function useNumericPressSelection<THandler extends ((...args: any[]) => void) | undefined = ((...args: any[]) => void) | undefined>({
    inputRef,
    handleSelectionChange,
    onPress,
}: UseNumericPressSelectionParams<THandler>): THandler {
    const syncCaretOnPress = ((...args: unknown[]) => {
        const inputElement = getSelectableElement(inputRef.current);
        if (inputElement) {
            handleSelectionChange(inputElement.selectionStart ?? 0, inputElement.selectionEnd ?? 0);
        }
        if (typeof onPress === 'function') {
            (onPress as (...args: unknown[]) => void)(...args);
        }
    }) as unknown as THandler;

    return syncCaretOnPress;
}

export default useNumericPressSelection;
