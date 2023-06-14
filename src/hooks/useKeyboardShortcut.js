import {useEffect} from 'react';
import KeyboardShortcut from '../libs/KeyboardShortcut';

const EMPTY_ARRAY = Object.freeze([]);

/**
 * Register a keyboard shortcut handler.
 *
 * @param {Object} shortcut
 * @param {Function} callback
 * @param {Object} [config]
 */
export default function useKeyboardShortcut(shortcut, callback, config = {}) {
    const {captureOnInputs = true, shouldBubble = false, priority = 0, shouldPreventDefault = true, excludedNodes = EMPTY_ARRAY, isActive = true} = config;

    useEffect(() => {
        if (isActive) {
            return KeyboardShortcut.subscribe(
                shortcut.shortcutKey,
                callback,
                shortcut.descriptionKey,
                shortcut.modifiers,
                captureOnInputs,
                shouldBubble,
                priority,
                shouldPreventDefault,
                excludedNodes,
            );
        }
        return () => {};
    }, [isActive, callback, captureOnInputs, excludedNodes, priority, shortcut.descriptionKey, shortcut.modifiers, shortcut.shortcutKey, shouldBubble, shouldPreventDefault]);
}
