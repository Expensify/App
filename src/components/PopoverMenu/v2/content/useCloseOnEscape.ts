import {useEffect} from 'react';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import claimEscapeKeyDown from '@libs/claimEscapeKeyDown';
import suppressNextEscapeKeyUp from '@libs/suppressNextEscapeKeyUp';
import CONST from '@src/CONST';

// Web: window-capture keydown bypasses the shortcut stack. Native: useKeyboardShortcut below (the window listener no-ops on native).
function useCloseOnEscape(isVisible: boolean, close: () => void): void {
    useEffect(() => {
        if (!isVisible) {
            return undefined;
        }
        return claimEscapeKeyDown(() => {
            suppressNextEscapeKeyUp();
            close();
        });
    }, [isVisible, close]);

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
