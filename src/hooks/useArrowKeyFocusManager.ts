import {useEffect, useEffectEvent, useState} from 'react';
import CONST from '@src/CONST';
import useKeyboardShortcut from './useKeyboardShortcut';
import usePrevious from './usePrevious';

type Config = {
    maxIndex: number;
    /**
     * Optional callback fired whenever `focusedIndex` changes. The hook itself never
     * scrolls — any scroll reaction must live in this callback. `shouldScrollHint` is a
     * hint forwarded from whoever wrote the new index; it is only ever set in the same
     * commit that writes a new `index`, and is never updated on its own. If you need to
     * scroll without changing the focused index, call the underlying list's
     * `scrollToIndex` directly rather than going through this hook.
     */
    onFocusedIndexChange?: (index: number, shouldScrollHint: boolean) => void;
    initialFocusedIndex?: number;
    disabledIndexes?: readonly number[];
    captureOnInputs?: boolean;
    shouldExcludeTextAreaNodes?: boolean;
    isActive?: boolean;
    itemsPerRow?: number;
    disableCyclicTraversal?: boolean;
    allowHorizontalArrowKeys?: boolean;
    allowNegativeIndexes?: boolean;
    isFocused?: boolean;
    setHasKeyBeenPressed?: () => void;
    onArrowUpDownCallback?: () => void;
};

/**
 * The setter's optional `shouldScrollHint` flag (default `false`) is forwarded as the
 * second argument to `onFocusedIndexChange`; it is not a direct scroll control.
 * Same-index writes are dropped — see the comment on `setFocusedIndexExternal` for why.
 */
type UseArrowKeyFocusManager = [number, (index: number, shouldScrollHint?: boolean) => void];

/**
 * A hook that makes it easy to use the arrow keys to manage focus of items in a list.
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
    captureOnInputs = true,
    shouldExcludeTextAreaNodes = true,
    isActive,
    itemsPerRow,
    disableCyclicTraversal = false,
    allowHorizontalArrowKeys = false,
    allowNegativeIndexes = false,
    isFocused = true,
    setHasKeyBeenPressed,
    onArrowUpDownCallback = () => {},
}: Config): UseArrowKeyFocusManager {
    const [focusState, setFocusState] = useState({index: initialFocusedIndex, shouldScrollHint: false});
    const {index: focusedIndex, shouldScrollHint} = focusState;
    const prevIsFocusedIndex = usePrevious(focusedIndex);

    /*
     * Same-index bail-out example path: after an arrow-key commit, `useSyncFocus`'s
     * layout effect (`src/hooks/useSyncFocus/useSyncFocusImplementation.ts`) calls
     * `el.focus()`, the browser fires a synchronous `focus` event, and the `onFocus`
     * handler in `src/components/SelectionList/ListItem/ListItemRenderer.tsx` re-enters
     * this setter with the same index and no hint.
     */
    const setFocusedIndexExternal = (index: number, shouldScrollHintArg = false) => {
        setFocusState((prev) => (prev.index === index ? prev : {index, shouldScrollHint: shouldScrollHintArg}));
    };

    const setFocusedIndexInternal = (updater: (prev: number) => number) => {
        setFocusState((prev) => ({index: updater(prev.index), shouldScrollHint: true}));
    };

    const arrowConfig = {
        excludedNodes: shouldExcludeTextAreaNodes ? ['TEXTAREA'] : [],
        isActive,
        captureOnInputs,
    };

    const horizontalArrowConfig = {
        excludedNodes: shouldExcludeTextAreaNodes ? ['TEXTAREA'] : [],
        isActive: isActive && allowHorizontalArrowKeys,
        captureOnInputs,
    };

    const onFocusedIndexChangeEvent = useEffectEvent(onFocusedIndexChange);

    useEffect(() => {
        if (prevIsFocusedIndex === focusedIndex) {
            return;
        }
        onFocusedIndexChangeEvent(focusedIndex, shouldScrollHint);
    }, [focusedIndex, prevIsFocusedIndex, shouldScrollHint]);

    const arrowUpCallback = () => {
        if (maxIndex < 0 || !isFocused) {
            return;
        }
        const nextIndex = disableCyclicTraversal ? -1 : maxIndex;
        setHasKeyBeenPressed?.();
        setFocusedIndexInternal((actualIndex) => {
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
        onArrowUpDownCallback();
    };

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ARROW_UP, arrowUpCallback, arrowConfig);

    const arrowDownCallback = () => {
        if (maxIndex < 0 || !isFocused) {
            return;
        }
        setHasKeyBeenPressed?.();

        const nextIndex = disableCyclicTraversal ? maxIndex : 0;

        setFocusedIndexInternal((actualIndex) => {
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
        onArrowUpDownCallback();
    };

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ARROW_DOWN, arrowDownCallback, arrowConfig);

    const arrowLeftCallback = () => {
        if (maxIndex < 0 || !allowHorizontalArrowKeys) {
            return;
        }

        const nextIndex = disableCyclicTraversal ? -1 : maxIndex;

        setFocusedIndexInternal((actualIndex) => {
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
    };

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ARROW_LEFT, arrowLeftCallback, horizontalArrowConfig);

    const arrowRightCallback = () => {
        if (maxIndex < 0 || !allowHorizontalArrowKeys) {
            return;
        }

        const nextIndex = disableCyclicTraversal ? maxIndex : 0;

        setFocusedIndexInternal((actualIndex) => {
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
    };

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ARROW_RIGHT, arrowRightCallback, horizontalArrowConfig);

    // Note: you don't need to manually manage focusedIndex in the parent. setFocusedIndexExternal is only exposed in case you want to reset focusedIndex or focus a specific item
    return [focusedIndex, setFocusedIndexExternal];
}
