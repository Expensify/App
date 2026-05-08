import CONST from '@src/CONST';
import useKeyboardShortcut from './useKeyboardShortcut';

/** Swallows Space presses so the focused parent view doesn't scroll. `useKeyboardShortcut` is no-op on native, so this is dormant without a keyboard. */
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
