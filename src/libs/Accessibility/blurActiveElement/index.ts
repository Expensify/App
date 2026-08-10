import {getLastTrapFocusReturn} from '@libs/lastTrapFocusReturn';

/**
 * Drops focus from whatever currently holds it.
 *
 * Leaves alone an element a focus trap just returned focus to. A closing modal blurs focus so it can't be left on
 * content that is about to unmount — but by then its trap may have already handed focus back to the launcher that
 * opened it, which lives outside the modal. Blurring that would silently undo the return.
 */
const blurActiveElement = () => {
    if (!(document.activeElement instanceof HTMLElement)) {
        return;
    }
    if (document.activeElement === getLastTrapFocusReturn()) {
        return;
    }
    document.activeElement.blur();
};

export default blurActiveElement;
