import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import _ from 'lodash';

let refSave: HTMLElement | undefined;
export function composerFocusKeepFocusOn(ref: HTMLElement, isFocused: boolean, modal: any, onyxFocused: boolean) {
    if (isFocused && !onyxFocused) {
        inputFocusChange(true);
        ref.focus();
    }
    if (isFocused) {
        refSave = ref;
    }
    if (!isFocused && !onyxFocused && !modal.willAlertModalBecomeVisible && !modal.isVisible && refSave) {
        refSave.focus();
    }
}

export function inputFocusChange(focus: boolean) {
    Onyx.set(ONYXKEYS.INPUT_FOCUSED, focus);
}
