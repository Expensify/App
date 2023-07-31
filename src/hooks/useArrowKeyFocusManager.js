import {useState, useEffect, useCallback, useMemo} from 'react';
import useKeyboardShortcut from './useKeyboardShortcut';
import CONST from '../CONST';

// Creating a default array this way because objects ({}) and arrays ([]) are not stable types.
// The "disabledIndexes" array needs to be stable to prevent the "useCallback" hook from being recreated unnecessarily.
// Freezing the array ensures that it cannot be unintentionally modified.
const EMPTY_ARRAY = Object.freeze([]);
/**
 * A hook that makes it easy to use the arrow keys to manage focus of items in a list
 *
 * Recommendation: To ensure stability, wrap the `onFocusedIndexChange` function with the useCallback hook before using it with this hook.
 *
 * @param {Object} config
 * @param {Number} config.maxIndex – typically the number of items in your list
 * @param {Function} [config.onFocusedIndexChange] – optional callback to execute when focusedIndex changes
 * @param {Number} [config.initialFocusedIndex] – where to start in the list
 * @param {Array} [config.disabledIndexes] – An array of indexes to disable + skip over
 * @param {Boolean} [config.shouldExcludeTextAreaNodes] – Whether arrow keys should have any effect when a TextArea node is focused
 * @param {Boolean} [config.isActive] – Whether the component is ready and should subscribe to KeyboardShortcut
 * @returns {Array}
 */
export default function useArrowKeyFocusManager({
    maxIndex,
    onFocusedIndexChange = () => {},
    initialFocusedIndex = 0,
    disabledIndexes = EMPTY_ARRAY,
    shouldExcludeTextAreaNodes = true,
    isActive,
}) {
    const [focusedIndex, setFocusedIndex] = useState(initialFocusedIndex);
    const arrowConfig = useMemo(
        () => ({
            excludedNodes: shouldExcludeTextAreaNodes ? ['TEXTAREA'] : [],
            isActive,
        }),
        [isActive, shouldExcludeTextAreaNodes],
    );

    useEffect(() => onFocusedIndexChange(focusedIndex), [focusedIndex, onFocusedIndexChange]);

    const arrowUpCallback = useCallback(() => {
        if (maxIndex < 0) {
            return;
        }

        setFocusedIndex((actualIndex) => {
            const currentFocusedIndex = actualIndex > 0 ? actualIndex - 1 : maxIndex;
            let newFocusedIndex = currentFocusedIndex;

            while (disabledIndexes.includes(newFocusedIndex)) {
                newFocusedIndex = newFocusedIndex > 0 ? newFocusedIndex - 1 : maxIndex;
                if (newFocusedIndex === currentFocusedIndex) {
                    // all indexes are disabled
                    return actualIndex; // no-op
                }
            }
            return newFocusedIndex;
        });
    }, [disabledIndexes, maxIndex]);
    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ARROW_UP, arrowUpCallback, arrowConfig);

    const arrowDownCallback = useCallback(() => {
        if (maxIndex < 0) {
            return;
        }

        setFocusedIndex((actualIndex) => {
            const currentFocusedIndex = actualIndex < maxIndex ? actualIndex + 1 : 0;
            let newFocusedIndex = currentFocusedIndex;

            while (disabledIndexes.includes(newFocusedIndex)) {
                newFocusedIndex = newFocusedIndex < maxIndex ? newFocusedIndex + 1 : 0;
                if (newFocusedIndex === currentFocusedIndex) {
                    // all indexes are disabled
                    return actualIndex;
                }
            }

            return newFocusedIndex;
        });
    }, [disabledIndexes, maxIndex]);
    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ARROW_DOWN, arrowDownCallback, arrowConfig);

    // Note: you don't need to manually manage focusedIndex in the parent. setFocusedIndex is only exposed in case you want to reset focusedIndex or focus a specific item
    return [focusedIndex, setFocusedIndex];
}
