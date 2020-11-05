import Ion from '../Ion';
import IONKEYS from '../../IONKEYS';

/**
 * Hide the sidebar, if it is shown.
 */
function hide() {
    Ion.set(IONKEYS.IS_SIDEBAR_SHOWN, false);
}

/**
 * Show the sidebar, if it is hidden.
 */
function show() {
    Ion.set(IONKEYS.IS_SIDEBAR_SHOWN, true);
}

function setIsAnimating(isAnimating) {
    Ion.set(IONKEYS.IS_SIDEBAR_ANIMATING, isAnimating);
}

export {
    hide,
    show,
    setIsAnimating,
};
