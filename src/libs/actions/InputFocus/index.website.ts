import Onyx from 'react-native-onyx';
import * as Browser from '@libs/Browser';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import ONYXKEYS from '@src/ONYXKEYS';

function inputFocusChange(focus: boolean) {
    Onyx.set(ONYXKEYS.INPUT_FOCUSED, focus);
}

let refSave: HTMLElement | undefined;
function composerFocusKeepFocusOn(ref: HTMLElement, isFocused: boolean, modal: {willAlertModalBecomeVisible: boolean; isVisible: boolean}, onyxFocused: boolean) {
    if (isFocused && !onyxFocused) {
        inputFocusChange(true);
        ref.focus();
    }
    if (isFocused) {
        refSave = ref;
    }
    if (!isFocused && !onyxFocused && !modal.willAlertModalBecomeVisible && !modal.isVisible && refSave) {
        if (!ReportActionComposeFocusManager.isFocused()) {
            refSave.focus();
        } else {
            refSave = undefined;
        }
    }
}

const callback = (method: () => void) => !Browser.isMobile() && method();

export {composerFocusKeepFocusOn, inputFocusChange, callback};
