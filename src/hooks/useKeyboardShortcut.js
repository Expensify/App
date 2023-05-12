import {useEffect, useRef} from 'react';
import KeyboardShortcut from '../libs/KeyboardShortcut';

export default function useKeyboardShortcut(shortcut, callback, config = {}) {
    const {captureOnInputs = true, shouldBubble = false, priority = 0, shouldPreventDefault = true, excludedNodes = []} = config;
    const unsubscribe = useRef(null);
    useEffect(() => {
        if (unsubscribe.current) {
            unsubscribe.current();
        }
        unsubscribe.current = KeyboardShortcut.subscribe(
            shortcut.shortcutKey,
            callback,
            shortcut.descriptionKey,
            shortcut.modifiers,
            captureOnInputs,
            shouldBubble,
            priority,
            shouldPreventDefault,
            excludedNodes,
            // eslint-disable-next-line react-hooks/exhaustive-deps
        );
        return unsubscribe.current;
    }, [callback, captureOnInputs, excludedNodes, priority, shortcut.descriptionKey, shortcut.modifiers, shortcut.shortcutKey, shouldBubble, shouldPreventDefault]);
}
