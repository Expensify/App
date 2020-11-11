import Onyx from 'react-native-onyx';
import IONKEYS from '../../IONKEYS';

/**
 * Hide the sidebar, if it is shown.
 */
function hide() {
    Onyx.set(IONKEYS.IS_SIDEBAR_SHOWN, false);
}

/**
 * Show the sidebar, if it is hidden.
 */
function show() {
    Onyx.set(IONKEYS.IS_SIDEBAR_SHOWN, true);
}

/**
 * Tracks the animating state of the Sidebar.
 *
 * @param {Boolean} isAnimating
 */
function setIsAnimating(isAnimating) {
    Onyx.set(IONKEYS.IS_SIDEBAR_ANIMATING, isAnimating);
}

export {
    hide,
    show,
    setIsAnimating,
};
