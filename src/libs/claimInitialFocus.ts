import {markProgrammaticFocus} from './programmaticFocus';
import {Priorities, resetCycle, tryClaim} from './ScreenFocusArbiter';

/**
 * Shared tail for the web initial-focus hooks. `focusVisible: true` shows the ring (keyboard, WCAG 2.4.7);
 * false suppresses it for touch via `markProgrammaticFocus`. Returns false — releasing the cycle and the ring
 * marker — when focus doesn't actually land, so a silent no-op neither holds INITIAL nor blocks the caller's retry.
 */
function claimInitialFocus(el: HTMLElement, {focusVisible}: {focusVisible: boolean}): boolean {
    if (document.activeElement && document.activeElement !== document.body) {
        return false;
    }
    if (!tryClaim(Priorities.INITIAL)) {
        return false;
    }
    let clearProgrammaticFocus: (() => void) | undefined;
    if (focusVisible) {
        el.focus({preventScroll: true, focusVisible: true});
    } else {
        clearProgrammaticFocus = markProgrammaticFocus(el);
        el.focus({preventScroll: true});
    }
    // Focus silently no-ops when an inert / visibility:hidden ancestor passes the focusable + geometry checks.
    if (document.activeElement !== el) {
        clearProgrammaticFocus?.();
        resetCycle();
        return false;
    }
    return true;
}

export default claimInitialFocus;
