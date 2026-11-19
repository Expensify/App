import type UseAmountPressSelectionParams from './types';
import type {AmountPressHandler} from './types';

/** Native emits a selection change whenever the caret moves, including on press, so no extra handling is needed. */
function useAmountPressSelection({onPress}: UseAmountPressSelectionParams): AmountPressHandler | undefined {
    return onPress;
}

export default useAmountPressSelection;
