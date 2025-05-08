import type {TextInput} from 'react-native';
import ComposerFocusManager from '@libs/ComposerFocusManager';
import isWindowReadyToFocus from '@libs/isWindowReadyToFocus';

function focusAfterModalClose(textInput: TextInput | null) {
    if (!textInput) {
        return;
    }

    Promise.all([ComposerFocusManager.isReadyToFocus(), isWindowReadyToFocus()]).then(() => {
        textInput?.focus();
    });
}

export default focusAfterModalClose;
