import {markProgrammaticFocus} from './programmaticFocus';
import {Priorities, tryClaim} from './ScreenFocusArbiter';

/**
 * Shared tail for the web initial-focus hooks. `focusVisible: true` shows the ring (keyboard, WCAG 2.4.7);
 * false suppresses it for touch via `markProgrammaticFocus`.
 */
function claimInitialFocus(el: HTMLElement, {focusVisible}: {focusVisible: boolean}): boolean {
    if (document.activeElement && document.activeElement !== document.body) {
        return false;
    }
    if (!tryClaim(Priorities.INITIAL)) {
        return false;
    }
    if (focusVisible) {
        el.focus({preventScroll: true, focusVisible: true});
    } else {
        markProgrammaticFocus(el);
        el.focus({preventScroll: true});
    }
    return true;
}

export default claimInitialFocus;
