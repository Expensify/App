import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import suppressNextEscapeKeyUp from '@libs/suppressNextEscapeKeyUp';
import CONST from '@src/CONST';

function useCloseOnEscape(isVisible: boolean, close: () => void): void {
    useKeyboardShortcut(
        CONST.KEYBOARD_SHORTCUTS.ESCAPE,
        () => {
            suppressNextEscapeKeyUp();
            close();
        },
        {isActive: isVisible, shouldBubble: false},
    );
}

export default useCloseOnEscape;
