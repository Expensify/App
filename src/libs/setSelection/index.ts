import SetSelection from './types';

const setSelection: SetSelection = (textInput, start, end) => {
    if (!textInput) {
        return;
    }

    if ('setSelectionRange' in textInput) {
        textInput.setSelectionRange(start, end);
    }
};

export default setSelection;
