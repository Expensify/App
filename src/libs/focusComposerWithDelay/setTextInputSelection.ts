import shouldSetSelectionRange from '@libs/shouldSetSelectionRange';

import type {InputType, Selection} from './types';

const setSelectionRange = shouldSetSelectionRange();

const setTextInputSelection = (textInput: InputType, forcedSelectionRange: Selection) => {
    if (setSelectionRange) {
        if ('setSelectionRange' in textInput && typeof textInput.setSelectionRange === 'function') {
            textInput.setSelectionRange(forcedSelectionRange.start, forcedSelectionRange.end);
        }
    } else if ('setSelection' in textInput && typeof textInput.setSelection === 'function') {
        textInput.setSelection(forcedSelectionRange.start, forcedSelectionRange.end);
    }
};

export default setTextInputSelection;
