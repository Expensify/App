import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import CONST from '@src/CONST';

/**
 * Web only: pressing Space after touching the parent view scrolls the page.
 * Swallow it while the menu is open. No-op on native.
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
