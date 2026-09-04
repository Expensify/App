import type {BaseTextInputProps} from '@components/TextInput/BaseTextInput/types';

/**
 * Native emits a selection change whenever the caret moves, including on press, so the root selection stays in sync
 * without any extra handling. The web implementation reads the caret from the DOM element instead.
 */
function useNumericPressSelection(onPress?: BaseTextInputProps['onPress']): BaseTextInputProps['onPress'] {
    return onPress;
}

export default useNumericPressSelection;
