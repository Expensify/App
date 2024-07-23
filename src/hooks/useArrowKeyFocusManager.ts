import {useCallback, useEffect, useMemo, useState} from 'react';
import CONST from '@src/CONST';
import useKeyboardShortcut from './useKeyboardShortcut';
import usePrevious from './usePrevious';

type Config = {
    maxIndex: number;
    onFocusedIndexChange?: (index: number) => void;
    initialFocusedIndex?: number;
    disabledIndexes?: readonly number[];
    shouldExcludeTextAreaNodes?: boolean;
    isActive?: boolean;
    itemsPerRow?: number;
    disableCyclicTraversal?: boolean;
    allowHorizontalArrowKeys?: boolean;
    allowNegativeIndexes?: boolean;
    isFocused?: boolean;
};

type UseArrowKeyFocusManager = [number, (index: number) => void];

/**
 * A hook that makes it easy to use the arrow keys to manage focus of items in a list
 *
 * Recommendation: To ensure stability, wrap the `onFocusedIndexChange` function with the useCallback hook before using it with this hook.
 *
 * @param config.maxIndex – typically the number of items in your list
 * @param [config.onFocusedIndexChange] – optional callback to execute when focusedIndex changes
 * @param [config.initialFocusedIndex] – where to start in the list
 * @param [config.disabledIndexes] – An array of indexes to disable + skip over
 * @param [config.shouldExcludeTextAreaNodes] – Whether arrow keys should have any effect when a TextArea node is focused
 * @param [config.isActive] – Whether the component is ready and should subscribe to KeyboardShortcut
 * @param [config.itemsPerRow] – The number of items per row. If provided, the arrow keys will move focus horizontally as well as vertically
 * @param [config.disableCyclicTraversal] – Whether to disable cyclic traversal of the list. If true, the arrow keys will have no effect when the first or last item is focused
 * @param [config.allowHorizontalArrowKeys] – Whether to enable the right/left keys
 * @param [config.isFocused] Whether navigation is focused
 */
export default function useArrowKeyFocusManager({
    maxIndex,
    onFocusedIndexChange = () => {},
    initialFocusedIndex = 0,

    // The "disabledIndexes" array needs to be stable to prevent the "useCallback" hook from being recreated unnecessarily.
    // Hence the use of CONST.EMPTY_ARRAY.
    disabledIndexes = CONST.EMPTY_ARRAY,
    shouldExcludeTextAreaNodes = true,
    isActive,
    itemsPerRow,
    disableCyclicTraversal = false,
    allowHorizontalArrowKeys = false,
    allowNegativeIndexes = false,
    isFocused = true,
}: Config): UseArrowKeyFocusManager {
    const [focusedIndex, setFocusedIndex] = useState(initialFocusedIndex);
    const prevIsFocusedIndex = usePrevious(focusedIndex);
    const arrowConfig = useMemo(
        () => ({
            excludedNodes: shouldExcludeTextAreaNodes ? ['TEXTAREA'] : [],
            isActive,
        }),
        [isActive, shouldExcludeTextAreaNodes],
    );

    const horizontalArrowConfig = useMemo(
        () => ({
            excludedNodes: shouldExcludeTextAreaNodes ? ['TEXTAREA'] : [],
            isActive: isActive && allowHorizontalArrowKeys,
        }),
        [isActive, shouldExcludeTextAreaNodes, allowHorizontalArrowKeys],
    );

    useEffect(() => {
        if (prevIsFocusedIndex === focusedIndex) {
            return;
        }
        onFocusedIndexChange(focusedIndex);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [focusedIndex, prevIsFocusedIndex]);

    const arrowUpCallback = useCallback(() => {
        if (maxIndex < 0 || !isFocused) {
            return;
        }
        const nextIndex = disableCyclicTraversal ? -1 : maxIndex;

        setFocusedIndex((actualIndex) => {
            const currentFocusedIndex = actualIndex > 0 ? actualIndex - (itemsPerRow ?? 1) : nextIndex;
            let newFocusedIndex = currentFocusedIndex;

            while (disabledIndexes.includes(newFocusedIndex)) {
                newFocusedIndex -= itemsPerRow ?? 1;
                if (newFocusedIndex < 0) {
                    if (disableCyclicTraversal) {
                        if (!allowNegativeIndexes) {
                            return actualIndex;
                        }
                        break;
                    }
                    newFocusedIndex = maxIndex;
                }
                if (newFocusedIndex === currentFocusedIndex) {
                    // all indexes are disabled
                    return actualIndex; // no-op
                }
            }
            return newFocusedIndex;
        });
    }, [maxIndex, isFocused, disableCyclicTraversal, itemsPerRow, disabledIndexes, allowNegativeIndexes]);

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ARROW_UP, arrowUpCallback, arrowConfig);

    const arrowDownCallback = useCallback(() => {
        if (maxIndex < 0 || !isFocused) {
            return;
        }

        const nextIndex = disableCyclicTraversal ? maxIndex : 0;

        setFocusedIndex((actualIndex) => {
            let currentFocusedIndex = -1;

            if (actualIndex === -1) {
                currentFocusedIndex = 0;
            } else {
                currentFocusedIndex = actualIndex < maxIndex ? actualIndex + (itemsPerRow ?? 1) : nextIndex;
            }

            if (disableCyclicTraversal && currentFocusedIndex > maxIndex) {
                return actualIndex;
            }

            let newFocusedIndex = currentFocusedIndex;
            while (disabledIndexes.includes(newFocusedIndex)) {
                if (actualIndex < 0) {
                    newFocusedIndex += 1;
                } else {
                    newFocusedIndex += itemsPerRow ?? 1;
                }

                if (newFocusedIndex > maxIndex) {
                    if (disableCyclicTraversal) {
                        return actualIndex;
                    }
                    newFocusedIndex = 0;
                }
                if (newFocusedIndex === currentFocusedIndex) {
                    // all indexes are disabled
                    return actualIndex;
                }
            }
            return newFocusedIndex;
        });
    }, [disableCyclicTraversal, disabledIndexes, isFocused, itemsPerRow, maxIndex]);

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ARROW_DOWN, arrowDownCallback, arrowConfig);

    const arrowLeftCallback = useCallback(() => {
        if (maxIndex < 0 || !allowHorizontalArrowKeys) {
            return;
        }

        const nextIndex = disableCyclicTraversal ? -1 : maxIndex;

        setFocusedIndex((actualIndex) => {
            const currentFocusedIndex = actualIndex > 0 ? actualIndex - 1 : nextIndex;

            let newFocusedIndex = currentFocusedIndex;

            while (disabledIndexes.includes(newFocusedIndex)) {
                newFocusedIndex = newFocusedIndex > 0 ? newFocusedIndex - 1 : nextIndex;

                if (newFocusedIndex === currentFocusedIndex) {
                    // all indexes are disabled
                    return actualIndex; // no-op
                }
            }
            return newFocusedIndex;
        });
    }, [allowHorizontalArrowKeys, disableCyclicTraversal, disabledIndexes, maxIndex]);

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ARROW_LEFT, arrowLeftCallback, horizontalArrowConfig);

    const arrowRightCallback = useCallback(() => {
        if (maxIndex < 0 || !allowHorizontalArrowKeys) {
            return;
        }

        const nextIndex = disableCyclicTraversal ? maxIndex : 0;

        setFocusedIndex((actualIndex) => {
            const currentFocusedIndex = actualIndex < maxIndex ? actualIndex + 1 : nextIndex;

            let newFocusedIndex = currentFocusedIndex;

            while (disabledIndexes.includes(newFocusedIndex)) {
                newFocusedIndex = newFocusedIndex < maxIndex ? newFocusedIndex + 1 : nextIndex;

                if (newFocusedIndex === currentFocusedIndex) {
                    // all indexes are disabled
                    return actualIndex;
                }
            }
            return newFocusedIndex;
        });
    }, [allowHorizontalArrowKeys, disableCyclicTraversal, disabledIndexes, maxIndex]);

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ARROW_RIGHT, arrowRightCallback, horizontalArrowConfig);

    // Note: you don't need to manually manage focusedIndex in the parent. setFocusedIndex is only exposed in case you want to reset focusedIndex or focus a specific item
    return [focusedIndex, setFocusedIndex];
}
