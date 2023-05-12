import {useState, useEffect} from 'react';
import useKeyboardShortcut from './useKeyboardShortcut';
import CONST from '../CONST';

export default function useArrowKeyFocusManager({maxIndex, onFocusedIndexChange, initialFocusedIndex = 0, disabledIndexes = [], shouldExcludeTextAreaNodes = true}) {
    const [focusedIndex, setFocusedIndex] = useState(initialFocusedIndex);
    useEffect(() => onFocusedIndexChange(focusedIndex), [focusedIndex, onFocusedIndexChange]);

    useKeyboardShortcut(
        CONST.KEYBOARD_SHORTCUTS.ARROW_UP,
        () => {
            if (maxIndex < 0) {
                return;
            }

            const currentFocusedIndex = focusedIndex > 0 ? focusedIndex - 1 : maxIndex;
            let newFocusedIndex = currentFocusedIndex;

            while (disabledIndexes.includes(newFocusedIndex)) {
                newFocusedIndex = newFocusedIndex > 0 ? newFocusedIndex - 1 : maxIndex;
                if (newFocusedIndex === currentFocusedIndex) {
                    // all indexes are disabled
                    return; // no-op
                }
            }

            setFocusedIndex(newFocusedIndex);
        },
        {
            excludedNodes: shouldExcludeTextAreaNodes ? ['TEXTAREA'] : [],
        },
    );

    useKeyboardShortcut(
        CONST.KEYBOARD_SHORTCUTS.ARROW_DOWN,
        () => {
            if (maxIndex < 0) {
                return;
            }

            const currentFocusedIndex = focusedIndex < maxIndex ? focusedIndex + 1 : 0;
            let newFocusedIndex = currentFocusedIndex;

            while (disabledIndexes.includes(newFocusedIndex)) {
                newFocusedIndex = newFocusedIndex < maxIndex ? newFocusedIndex + 1 : 0;
                if (newFocusedIndex === currentFocusedIndex) {
                    // all indexes are disabled
                    return; // no-op
                }
            }

            setFocusedIndex(newFocusedIndex);
        },
        {
            excludedNodes: shouldExcludeTextAreaNodes ? ['TEXTAREA'] : [],
        },
    );

    return focusedIndex;
}
