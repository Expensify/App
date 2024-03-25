import type {TextInput} from 'react-native';
import shouldSetSelectionRange from '@libs/shouldSetSelectionRange';
import type {InputType, Selection} from './types';

const setSelectionRange = shouldSetSelectionRange();

const setTextInputSelection = (textInput: InputType, forcedSelectionRange: Selection) => {
    if (setSelectionRange) {
        (textInput as HTMLTextAreaElement).setSelectionRange(forcedSelectionRange.start, forcedSelectionRange.end);
    } else {
        (textInput as TextInput).setSelection(forcedSelectionRange.start, forcedSelectionRange.end);
    }
};

export default setTextInputSelection;
