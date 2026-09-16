import getHadTabNavigation from './hadTabNavigation';
import sharedTrapStack from './sharedTrapStack';

/**
 * Pauses the topmost focus-trap during the focus call — works around focus-trap-react auto-unpausing the next-topmost trap on
 * `deactivate()`, whose re-attached `checkFocusIn` would otherwise yank focus back into the closing container. Leaves an
 * already-paused trap alone so we don't resurrect a pause owned by another caller.
 */
function restoreFocusWithModality(el: HTMLElement, {preventScroll = true}: {preventScroll?: boolean} = {}): void {
    const parentTrap = sharedTrapStack.at(-1);
    const wasAlreadyPaused = parentTrap?.paused ?? false;
    if (parentTrap && !wasAlreadyPaused) {
        parentTrap.pause();
    }
    try {
        el.focus({preventScroll, focusVisible: getHadTabNavigation()});
    } finally {
        // Mirror the pause — unpause only if we paused, even if `parentTrap` is no longer topmost (focus-trap's deactivate auto-unwind depends on it).
        if (parentTrap && !wasAlreadyPaused) {
            parentTrap.unpause();
        }
    }
}

export default restoreFocusWithModality;
