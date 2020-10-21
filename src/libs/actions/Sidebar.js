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

export {
    hide,
    show,
};
