import Onyx from 'react-native-onyx';
import focusComposerWithDelay from '@libs/focusComposerWithDelay';
import type {InputType} from '@libs/focusComposerWithDelay/types';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Modal} from '@src/types/onyx';

function inputFocusChange(focus: boolean) {
    Onyx.set(ONYXKEYS.INPUT_FOCUSED, focus);
}

let refSave: InputType | undefined;
function composerFocusKeepFocusOn(ref: InputType, isFocused: boolean, modal: Modal, onyxFocused: boolean) {
    if (isFocused && !onyxFocused) {
        inputFocusChange(true);

        // wait for ComposerFocusManager ready to focus
        const focusWithDelay = focusComposerWithDelay(ref);
        focusWithDelay(true);
    }
    if (isFocused) {
        refSave = ref;
    }
    if (!isFocused && !onyxFocused && !modal.willAlertModalBecomeVisible && !modal.isVisible && refSave) {
        if (!ReportActionComposeFocusManager.isFocused()) {
            // wait for ComposerFocusManager ready to focus
            const focusWithDelay = focusComposerWithDelay(refSave);
            focusWithDelay(true);
        } else {
            refSave = undefined;
        }
    }
}

const callback = (method: () => void) => method();

export {composerFocusKeepFocusOn, inputFocusChange, callback};
