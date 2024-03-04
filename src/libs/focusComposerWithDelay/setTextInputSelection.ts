import type {TextInput} from 'react-native';
import shouldSetSelectionRange from '@libs/shouldSetSelectionRange';
import type {InputType, Selection} from './types';

const setSelectionRange = shouldSetSelectionRange();

const setTextInputSelection = (textInput: InputType, forceSetSelection: Selection) => {
    if (setSelectionRange) {
        (textInput as HTMLTextAreaElement).setSelectionRange(forceSetSelection.start, forceSetSelection.end);
    } else {
        (textInput as TextInput).setSelection(forceSetSelection.start, forceSetSelection.end);
    }
};

export default setTextInputSelection;
