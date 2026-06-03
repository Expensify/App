import type {FlashListRef} from '@shopify/flash-list';
import type {RefObject} from 'react';
import {useEffect, useRef, useState} from 'react';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import {addKeyDownPressListener, removeKeyDownPressListener} from '@libs/KeyboardShortcut/KeyDownPressListener';
import {isFocusRestoreInProgress} from '@libs/NavigationFocusReturn';
import CONST from '@src/CONST';

type ScrollToIndex = (index: number, animated?: boolean) => void;

type UseSelectionListKeyboardFocusParams<TData> = {
    /** Where to start the cursor in the list */
    initialFocusedIndex: number;

    /** Highest valid index (typically list length - 1) */
    maxIndex: number;

    /** Indexes the arrow keys should skip over */
    disabledIndexes: readonly number[];

    /** Whether the arrow-key listeners should be active */
    isActive: boolean;

    /** Whether the list's screen is focused (blocks navigation when false) */
    isFocused: boolean;

    /** Whether moving the cursor should scroll to the focused row */
    shouldScrollToFocusedIndex: boolean;

    /** Whether the scroll triggered by cursor movement should be debounced */
    shouldDebounceScrolling: boolean;

    /** Immediate scroll-to-index (from useSelectionListScroll) */
    scrollToIndex: ScrollToIndex;

    /** Debounced scroll-to-index (from useSelectionListScroll) */
    debouncedScrollToIndex: ScrollToIndex;

    /** The FlashList ref, used to announce programmatic scrolls for accessibility */
    listRef: RefObject<FlashListRef<TData> | null>;

    /** Disables hover styling while the user is navigating by keyboard */
    setShouldDisableHoverStyle: (shouldDisableHoverStyle: boolean) => void;
};

type UseSelectionListKeyboardFocusResult = {
    /** The currently focused index */
    focusedIndex: number;

    /** Imperative setter for the focused index (resets/jumps the cursor) */
    setFocusedIndex: (index: number) => void;

    /** Row-focus handler: keeps the cursor on a row that received focus from the navigation focus-restore, without scrolling to it */
    setFocusedIndexFromRowFocus: (index: number) => void;

    /** Moves the cursor and suppresses the scroll the move would otherwise trigger when the index changes */
    setFocusedIndexWithoutScrollOnChange: (index: number) => void;

    /** Suppresses the next scroll that cursor movement would trigger (used by useSearchFocusSync) */
    suppressNextFocusScroll: () => void;

    /** Whether the user is currently navigating with the keyboard (drives row highlight) */
    isKeyboardNavigating: boolean;

    /** Marks that a navigation key has been pressed, switching the list into keyboard-navigation mode */
    setHasKeyBeenPressed: () => void;
};

/**
 * Owns the keyboard-navigable focused index of a SelectionList: wraps useArrowKeyFocusManager, tracks the
 * keyboard-navigation modality (including the Tab key), and provides the focus-restore-aware cursor setters
 * plus scroll suppression. Shared by BaseSelectionList (flat) and BaseSelectionListWithSections (sectioned).
 */
function useSelectionListKeyboardFocus<TData>({
    initialFocusedIndex,
    maxIndex,
    disabledIndexes,
    isActive,
    isFocused,
    shouldScrollToFocusedIndex,
    shouldDebounceScrolling,
    scrollToIndex,
    debouncedScrollToIndex,
    listRef,
    setShouldDisableHoverStyle,
}: UseSelectionListKeyboardFocusParams<TData>): UseSelectionListKeyboardFocusResult {
    const hasKeyBeenPressed = useRef(false);
    const [isKeyboardNavigating, setIsKeyboardNavigating] = useState(false);
    const suppressNextFocusScrollRef = useRef(false);

    const setHasKeyBeenPressed = () => {
        if (hasKeyBeenPressed.current) {
            return;
        }
        hasKeyBeenPressed.current = true;
        setIsKeyboardNavigating(true);
    };

    // Arrow keys flip the modality flag inside useArrowKeyFocusManager; Tab needs to flip it too,
    // so rows highlight when the user tabs into the list.
    useEffect(() => {
        const handleTabKeyDown = (event: KeyboardEvent) => {
            if (event.key !== CONST.KEYBOARD_SHORTCUTS.TAB.shortcutKey) {
                return;
            }
            setHasKeyBeenPressed();
        };
        addKeyDownPressListener(handleTabKeyDown);
        return () => removeKeyDownPressListener(handleTabKeyDown);
    }, [setHasKeyBeenPressed]);

    const [focusedIndex, setFocusedIndex] = useArrowKeyFocusManager({
        initialFocusedIndex,
        maxIndex,
        disabledIndexes,
        isActive,
        onFocusedIndexChange: (index: number) => {
            if (suppressNextFocusScrollRef.current) {
                suppressNextFocusScrollRef.current = false;
                return;
            }
            if (!shouldScrollToFocusedIndex) {
                return;
            }

            (shouldDebounceScrolling ? debouncedScrollToIndex : scrollToIndex)(index);
        },
        setHasKeyBeenPressed,
        isFocused,
        onArrowUpDownCallback: () => {
            setShouldDisableHoverStyle(true);
            listRef.current?.announceProgrammaticScroll();
        },
    });

    // Move the cursor, and skip the scroll the move would otherwise trigger when the index actually changes.
    const setFocusedIndexWithoutScrollOnChange = (index: number) => {
        if (index !== focusedIndex) {
            suppressNextFocusScrollRef.current = true;
        }
        setFocusedIndex(index);
    };

    // Keep the cursor on the restored row so keyboard nav continues from there, but don't scroll to it on the way back.
    const setFocusedIndexFromRowFocus = (index: number) => {
        if (isFocusRestoreInProgress()) {
            setFocusedIndexWithoutScrollOnChange(index);
        } else {
            setFocusedIndex(index);
        }
    };

    const suppressNextFocusScroll = () => {
        suppressNextFocusScrollRef.current = true;
    };

    return {
        focusedIndex,
        setFocusedIndex,
        setFocusedIndexFromRowFocus,
        setFocusedIndexWithoutScrollOnChange,
        suppressNextFocusScroll,
        isKeyboardNavigating,
        setHasKeyBeenPressed,
    };
}

export default useSelectionListKeyboardFocus;
