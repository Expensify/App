import {useEffect, useRef} from 'react';
import {useRootActions, useRootVisibility} from '@components/PopoverMenu/v2/root/RootContext';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import CONST from '@src/CONST';
import type {ContentClose, ContentFocus, ContentItemActions, ContentNavigation, ContentSubActions} from './ContentContext';
import useCloseOnModalCover from './useCloseOnModalCover';
import useCloseOnScreenBlur from './useCloseOnScreenBlur';
import useFocusableRegistry from './useFocusableRegistry';
import useSubNavigation from './useSubNavigation';

function useContentController(componentName: string): {
    navigation: ContentNavigation;
    focus: ContentFocus;
    subActions: ContentSubActions;
    itemActions: ContentItemActions;
    close: ContentClose;
} {
    const {isVisible} = useRootVisibility(componentName);
    const {setIsVisible} = useRootActions(componentName);
    const cleanupEscapeKeyUpSuppressorRef = useRef<(() => void) | undefined>(undefined);

    const focus = useFocusableRegistry({isVisible});
    // Order matters: `focus` must exist before `subNav` so `resetFocus` is in scope for `onLevelChange`.
    const subNav = useSubNavigation({onLevelChange: focus.resetFocus});

    const close: ContentClose = () => {
        setIsVisible(false);
        subNav.actions.exitSub(null);
    };

    const closeFromEscape = () => {
        if (typeof document !== 'undefined') {
            cleanupEscapeKeyUpSuppressorRef.current?.();

            let timeoutID: ReturnType<typeof setTimeout> | undefined;
            const suppressEscapeKeyUp = (event: KeyboardEvent) => {
                if (event.key !== CONST.KEYBOARD_SHORTCUTS.ESCAPE.shortcutKey) {
                    return;
                }

                event.stopImmediatePropagation();
                cleanupEscapeKeyUpSuppressorRef.current?.();
            };

            document.addEventListener('keyup', suppressEscapeKeyUp, true);
            cleanupEscapeKeyUpSuppressorRef.current = () => {
                document.removeEventListener('keyup', suppressEscapeKeyUp, true);
                if (timeoutID) {
                    clearTimeout(timeoutID);
                }
                cleanupEscapeKeyUpSuppressorRef.current = undefined;
            };
            timeoutID = setTimeout(() => cleanupEscapeKeyUpSuppressorRef.current?.(), 1000);
        }

        close();
    };

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ESCAPE, closeFromEscape, {isActive: isVisible, shouldBubble: false});

    useEffect(() => () => cleanupEscapeKeyUpSuppressorRef.current?.(), []);

    useCloseOnModalCover(isVisible, close);
    useCloseOnScreenBlur(close);

    return {
        navigation: {currentSubID: subNav.currentSubID, isAncestorOfCurrent: subNav.isAncestorOfCurrent},
        focus: {focusedID: focus.focusedID},
        subActions: subNav.actions,
        itemActions: focus.actions,
        close,
    };
}

export default useContentController;
