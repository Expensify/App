import Onyx from 'react-native-onyx';
import IONKEYS from '../../IONKEYS';

/**
 * Hide the Chat Switcher
 */
function hide() {
    Onyx.set(IONKEYS.IS_CHAT_SWITCHER_ACTIVE, false);
}

/**
 * Show the Chat Switcher
 */
function show() {
    Onyx.set(IONKEYS.IS_CHAT_SWITCHER_ACTIVE, true);
}

export {
    hide,
    show,
};
