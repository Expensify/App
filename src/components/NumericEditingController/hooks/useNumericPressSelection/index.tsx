import type UseNumericPressSelectionParams from './types';

/** Native emits a selection change whenever the caret moves, including on press, so no extra handling is needed. */
function useNumericPressSelection<THandler extends ((...args: any[]) => void) | undefined = ((...args: any[]) => void) | undefined>({
    onPress,
}: UseNumericPressSelectionParams<THandler>): THandler {
    return onPress as THandler;
}

export default useNumericPressSelection;
