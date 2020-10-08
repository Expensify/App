import Ion from '../Ion';
import IONKEYS from '../../IONKEYS';

let isSidebarShown;
Ion.connect({
    key: IONKEYS.IS_SIDEBAR_SHOWN,
    callback: val => isSidebarShown = val,
});

function hide() {
    if (isSidebarShown) {
        Ion.set(IONKEYS.IS_SIDEBAR_SHOWN, false);
    } else {
        console.debug("Attempting to hide sidebar, but it's already hidden.");
    }
}

function show() {
    if (!isSidebarShown) {
        Ion.set(IONKEYS.IS_SIDEBAR_SHOWN, true);
    } else {
        console.debug("Attempting to show sidebar, but it's already visible.");
    }
}

function toggle() {
    Ion.set(IONKEYS.IS_SIDEBAR_SHOWN, !isSidebarShown);
}

export {
    hide,
    show,
    toggle,
};
