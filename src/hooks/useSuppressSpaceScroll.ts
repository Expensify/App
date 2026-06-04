import CONST from '@src/CONST';
import useKeyboardShortcut from './useKeyboardShortcut';

/** Dormant on native — `useKeyboardShortcut` doesn't fire without a keyboard. */
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
