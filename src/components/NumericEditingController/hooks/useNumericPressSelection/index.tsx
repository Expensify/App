import type UseNumericPressSelectionParams from './types';
import type {NumericPressHandler} from './types';

/** Native emits a selection change whenever the caret moves, including on press, so no extra handling is needed. */
function useNumericPressSelection({onPress}: UseNumericPressSelectionParams): NumericPressHandler | undefined {
    return onPress;
}

export default useNumericPressSelection;
