import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

/**
 * Hide the sidebar, if it is shown.
 */
function hide() {
    Onyx.set(ONYXKEYS.IS_SIDEBAR_SHOWN, false);
}

/**
 * Show the sidebar, if it is hidden.
 */
function show() {
    Onyx.set(ONYXKEYS.IS_SIDEBAR_SHOWN, true);
}

/**
 * Tracks the animating state of the Sidebar.
 *
 * @param {Boolean} isAnimating
 */
function setIsAnimating(isAnimating) {
    Onyx.set(ONYXKEYS.IS_SIDEBAR_ANIMATING, isAnimating);
}

export {
    hide,
    show,
    setIsAnimating,
};
