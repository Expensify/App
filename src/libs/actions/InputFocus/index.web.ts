import * as Browser from '@libs/Browser';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Modal} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

function inputFocusChange(focus: boolean) {
    Onyx.set(ONYXKEYS.INPUT_FOCUSED, focus);
}

let refSave: HTMLElement | undefined;
function composerFocusKeepFocusOn(ref: HTMLElement, isFocused: boolean, modal: Modal, onyxFocused: boolean) {
    if (isFocused && !onyxFocused) {
        inputFocusChange(true);
        ref.focus();
    }
    if (isFocused) {
        refSave = ref;
    }
    if (!isFocused && !onyxFocused && !modal.willAlertModalBecomeVisible && !modal.isVisible && refSave) {
        if (!ReportActionComposeFocusManager.isFocused()) {
            // Focusing will fail when it is called immediately after closing modal so we call it after interaction.
            TransitionTracker.runAfterTransitions({
                callback: () => refSave?.focus(),
            });
        } else {
            refSave = undefined;
        }
    }
}

const callback = (method: () => void) => !Browser.isMobile() && method();

export {composerFocusKeepFocusOn, inputFocusChange, callback};
