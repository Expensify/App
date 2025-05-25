import type {TextInput} from 'react-native';
import ComposerFocusManager from './ComposerFocusManager';
import isWindowReadyToFocus from './isWindowReadyToFocus';

function focusAfterModalClose(textInput: TextInput | null) {
    if (!textInput) {
        return;
    }

    Promise.all([ComposerFocusManager.isReadyToFocus(), isWindowReadyToFocus()]).then(() => {
        textInput?.focus();
    });
}

export default focusAfterModalClose;
