import sharedTrapStack from '@components/FocusTrap/sharedTrapStack';
import getHadTabNavigation from './hadTabNavigation';

/** Pauses the topmost focus-trap during the focus call so its `checkFocusIn` doesn't yank focus back — focus-trap auto-unpauses the parent on deactivate. */
function restoreFocusWithModality(el: HTMLElement): void {
    const parentTrap = sharedTrapStack.at(-1);
    parentTrap?.pause();
    try {
        el.focus({preventScroll: true, focusVisible: getHadTabNavigation()});
    } finally {
        parentTrap?.unpause();
    }
}

export default restoreFocusWithModality;
