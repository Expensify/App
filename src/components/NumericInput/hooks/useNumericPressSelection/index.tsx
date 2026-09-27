import type {BaseTextInputProps} from '@components/TextInput/BaseTextInput/types';

/** Native emits a selection change whenever the caret moves, including on press, so no extra handling is needed. */
function useNumericPressSelection(onPress?: BaseTextInputProps['onPress']): BaseTextInputProps['onPress'] {
    return onPress;
}

export default useNumericPressSelection;
