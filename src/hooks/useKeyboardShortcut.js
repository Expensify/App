import {useEffect, experimental_useEffectEvent as useEffectEvent} from 'react';
import KeyboardShortcut from '../libs/KeyboardShortcut';

/**
 * Register a keyboard shortcut handler.
 *
 * @param {Object} shortcut
 * @param {Function} callback
 * @param {Object} [config]
 */
export default function useKeyboardShortcut(shortcut, callback, config = {}) {
    const {captureOnInputs = true, shouldBubble = false, priority = 0, shouldPreventDefault = true, excludedNodes = [], isActive = true} = config;
    const handleEvent = useEffectEvent(() => callback());
    useEffect(() => {
        if (isActive) {
            return KeyboardShortcut.subscribe(
                shortcut.shortcutKey,
                handleEvent,
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [captureOnInputs, excludedNodes, isActive, priority, shortcut.descriptionKey, shortcut.modifiers, shortcut.shortcutKey, shouldBubble, shouldPreventDefault]);
}
