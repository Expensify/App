import {useEffect} from 'react';
import {ValueOf} from 'type-fest';
import KeyboardShortcut from '@libs/KeyboardShortcut';
import CONST from '@src/CONST';

type Shortcut = ValueOf<typeof CONST.KEYBOARD_SHORTCUTS>;
type KeyboardShortcutConfig = {
    captureOnInputs?: boolean;
    shouldBubble?: boolean;
    priority?: number;
    shouldPreventDefault?: boolean;
    excludedNodes?: string[];
    isActive?: boolean;
};

/**
 * Register a keyboard shortcut handler.
 * Recommendation: To ensure stability, wrap the `callback` function with the useCallback hook before using it with this hook.
 *
 */
export default function useKeyboardShortcut(shortcut: Shortcut, callback: () => void, config: KeyboardShortcutConfig | Record<string, never> = {}) {
    const {
        captureOnInputs = true,
        shouldBubble = false,
        priority = 0,
        shouldPreventDefault = true,

        // The "excludedNodes" array needs to be stable to prevent the "useEffect" hook from being recreated unnecessarily.
        // Hence the use of CONST.EMPTY_ARRAY.
        excludedNodes = CONST.EMPTY_ARRAY,
        isActive = true,
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
            excludedNodes,
        );

        return () => {
            unsubscribe();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isActive, callback, captureOnInputs, excludedNodes, priority, shortcut.descriptionKey, shortcut.modifiers.join(), shortcut.shortcutKey, shouldBubble, shouldPreventDefault]);
}
