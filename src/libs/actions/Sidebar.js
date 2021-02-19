import {Keyboard} from 'react-native';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

/**
 * Hide the sidebar, if it is shown.
 */
function hide() {
    Keyboard.dismiss();
    Onyx.set(ONYXKEYS.IS_SIDEBAR_SHOWN, false);
}

/**
 * Show the sidebar, if it is hidden.
 */
function show() {
    Keyboard.dismiss();
    Onyx.set(ONYXKEYS.IS_SIDEBAR_SHOWN, true);
}

export {
    hide,
    show,
};
