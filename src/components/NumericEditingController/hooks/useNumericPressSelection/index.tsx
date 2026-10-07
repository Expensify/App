import type {BaseTextInputProps} from '@components/TextInput/BaseTextInput/types';

import type UseNumericPressSelectionParams from './types';

/** Native emits a selection change whenever the caret moves, including on press, so no extra handling is needed. */
function useNumericPressSelection({onPress}: UseNumericPressSelectionParams): BaseTextInputProps['onPress'] {
    return onPress;
}

export default useNumericPressSelection;
