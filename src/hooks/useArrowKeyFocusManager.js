import {useState, useEffect} from 'react';
import useKeyboardShortcut from './useKeyboardShortcut';
import CONST from '../CONST';

/**
 * A hook that makes it easy to use the arrow keys to manage focus of items in a list
 *
 * @param {Object} config
 * @param {Number} config.maxIndex – typically the number of items in your list
 * @param {Function} [config.onFocusedIndexChange] – optional callback to execute when focusedIndex changes
 * @param {Number} [config.initialFocusedIndex] – where to start in the list
 * @param {Array} [config.disabledIndexes] – An array of indexes to disable + skip over
 * @param {Boolean} [config.shouldExcludeTextAreaNodes] – Whether arrow keys should have any effect when a TextArea node is focused
 * @returns {Array}
 */
export default function useArrowKeyFocusManager({maxIndex, onFocusedIndexChange = () => {}, initialFocusedIndex = 0, disabledIndexes = [], shouldExcludeTextAreaNodes = true}) {
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

    // Note: you don't need to manually manage focusedIndex in the parent. setFocusedIndex is only exposed in case you want to reset focusedIndex or focus a specific item
    return [focusedIndex, setFocusedIndex];
}
