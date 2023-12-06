import SetSelection from './types';

const setSelection: SetSelection = (textInput, start, end) => {
    if (!textInput) {
        return;
    }

    if ('setSelection' in textInput) {
        textInput.setSelection(start, end);
    }
};

export default setSelection;
