import sharedTrapStack from '@components/FocusTrap/sharedTrapStack';
import getHadTabNavigation from './hadTabNavigation';

/**
 * Pauses the topmost focus-trap during the focus call — works around focus-trap-react auto-unpausing the next-topmost trap on
 * `deactivate()`, whose re-attached `checkFocusIn` would otherwise yank focus back into the closing container.
 */
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
