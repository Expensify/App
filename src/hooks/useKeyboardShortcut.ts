import {useEffect} from 'react';
import type {GestureResponderEvent} from 'react-native';
import type {ValueOf} from 'type-fest';
import KeyboardShortcut from '@libs/KeyboardShortcut';
import CONST from '@src/CONST';

type Shortcut = ValueOf<typeof CONST.KEYBOARD_SHORTCUTS>;
type KeyboardShortcutConfig = {
    /* Should we capture the event on inputs too? */
    captureOnInputs?: boolean;
    /* Should we bubble the event? */
    shouldBubble?: boolean;
    /* The position the callback should take in the stack. 0 means top priority, and 1 means less priority than the most recently added. */
    priority?: number;
    /* Should call event.preventDefault after callback? */
    shouldPreventDefault?: boolean;
    /* Do not capture key events targeting excluded nodes (i.e. do not prevent default and let the event bubble) */
    excludedNodes?: string[];
    /* Is keyboard shortcut is already active */
    isActive?: boolean;
    /* Shuld stop propagation? */
    shouldStopPropagation?: boolean;
};

/**
 * Register a keyboard shortcut handler.
 * Recommendation: To ensure stability, wrap the `callback` function with the useCallback hook before using it with this hook.
 */
export default function useKeyboardShortcut(shortcut: Shortcut, callback: (e?: GestureResponderEvent | KeyboardEvent) => void, config: KeyboardShortcutConfig = {}) {
    const {
        captureOnInputs = true,
        shouldBubble = false,
        priority = 0,
        shouldPreventDefault = true,

        // The "excludedNodes" array needs to be stable to prevent the "useEffect" hook from being recreated unnecessarily.
        // Hence the use of CONST.EMPTY_ARRAY.
        excludedNodes = CONST.EMPTY_ARRAY,
        isActive = true,

        // This flag is used to prevent auto submit form when press enter key on selection modal.
        shouldStopPropagation = false,
    } = config;

    useEffect(() => {
        if (!isActive) {
            return () => {};
        }

        const unsubscribe = KeyboardShortcut.subscribe(
            shortcut.shortcutKey,
            callback,
            shortcut.descriptionKey ?? '',
            shortcut.modifiers,
            captureOnInputs,
            shouldBubble,
            priority,
            shouldPreventDefault,
            excludedNodes as string[],
            shouldStopPropagation,
        );

        return () => {
            unsubscribe();
        };
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [isActive, callback, captureOnInputs, excludedNodes, priority, shortcut.descriptionKey, shortcut.modifiers.join(), shortcut.shortcutKey, shouldBubble, shouldPreventDefault]);
}
