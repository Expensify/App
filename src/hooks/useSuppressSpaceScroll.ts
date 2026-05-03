import CONST from '@src/CONST';
import useKeyboardShortcut from './useKeyboardShortcut';

/**
 * Swallow Space-bar key presses while `isActive` is true so the focused parent view
 * doesn't scroll. Useful for popovers/menus rendered over a scrollable surface.
 *
 * Underlying `useKeyboardShortcut` already routes to a no-op listener on native, so
 * this is dormant on phones without a keyboard and lights up automatically on
 * platforms that do have one (e.g. iPad with a Bluetooth keyboard).
 */
function useSuppressSpaceScroll(isActive: boolean): void {
    useKeyboardShortcut(
        CONST.KEYBOARD_SHORTCUTS.SPACE,
        (event) => {
            event?.preventDefault();
        },
        {isActive, shouldPreventDefault: false},
    );
}

export default useSuppressSpaceScroll;
