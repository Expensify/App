import {Priorities, resetCycle, tryClaim} from './ScreenFocusArbiter';

/**
 * Shared tail for the web initial-focus hooks. `focusVisible` true shows the keyboard ring (WCAG 2.4.7); false tells
 * the browser the focus is non-visible, so `:focus-visible` never matches and no ring (app or UA) is drawn for touch.
 */
function claimInitialFocus(el: HTMLElement, {focusVisible}: {focusVisible: boolean}): boolean {
    if (document.activeElement && document.activeElement !== document.body) {
        return false;
    }
    if (!tryClaim(Priorities.INITIAL)) {
        return false;
    }
    el.focus({preventScroll: true, focusVisible});
    // Focus silently no-ops when an inert / visibility:hidden ancestor passes the focusable + geometry checks.
    if (document.activeElement !== el) {
        resetCycle();
        return false;
    }
    return true;
}

export default claimInitialFocus;
