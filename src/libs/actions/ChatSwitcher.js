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

// Also temporary just makes it easy to show the chat search view without hooking any trigger up
window.show = show;
window.hide = hide;

export {
    hide,
    show,
};
