import type {TextInput} from 'react-native';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import ComposerFocusManager from './ComposerFocusManager';
import isWindowReadyToFocus from './isWindowReadyToFocus';

function focusAfterModalClose(textInput: TextInput | BaseTextInputRef | null) {
    if (!textInput) {
        return;
    }

    Promise.all([ComposerFocusManager.isReadyToFocus(), isWindowReadyToFocus()]).then(() => {
        textInput?.focus();
    });
}

export default focusAfterModalClose;
