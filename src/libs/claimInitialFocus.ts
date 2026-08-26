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

/**
 * Moves focus into a modal dialog, stealing it from the control that opened the dialog.
 *
 * Unlike {@link claimInitialFocus}, this does not require `document.activeElement === body` — APG modal dialogs must
 * take focus from the trigger. Without that steal, JAWS stays on the activator and never announces the dialog.
 */
function claimDialogFocus(el: HTMLElement, {focusVisible}: {focusVisible: boolean}): boolean {
    if (!tryClaim(Priorities.INITIAL)) {
        return false;
    }
    el.focus({preventScroll: true, focusVisible});
    if (document.activeElement !== el) {
        resetCycle();
        return false;
    }
    return true;
}

export default claimInitialFocus;
export {claimDialogFocus};
