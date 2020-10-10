import Ion from '../Ion';
import IONKEYS from '../../IONKEYS';

let isSidebarShown;
Ion.connect({
    key: IONKEYS.IS_SIDEBAR_SHOWN,
    callback: val => isSidebarShown = val,
});

/**
 * Hide the sidebar, if it is shown.
 */
function hide() {
    if (isSidebarShown) {
        Ion.set(IONKEYS.IS_SIDEBAR_SHOWN, false);
    }
}

export default hide;
