import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

/**
 * Hide the Chat Switcher
 */
function hide() {
    Onyx.set(ONYXKEYS.IS_CHAT_SWITCHER_ACTIVE, false);
}

/**
 * Show the Chat Switcher
 */
function show() {
    Onyx.set(ONYXKEYS.IS_CHAT_SWITCHER_ACTIVE, true);
}

window.show = show;
window.hide = hide;

export {
    hide,
    show,
};
