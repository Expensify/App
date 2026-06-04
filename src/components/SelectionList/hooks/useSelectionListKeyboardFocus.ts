import type {FlashListRef} from '@shopify/flash-list';
import type {RefObject} from 'react';
import {useEffect, useRef, useState} from 'react';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import {addKeyDownPressListener, removeKeyDownPressListener} from '@libs/KeyboardShortcut/KeyDownPressListener';
import {isFocusRestoreInProgress} from '@libs/NavigationFocusReturn';
import CONST from '@src/CONST';

type ScrollToIndex = (index: number, animated?: boolean) => void;

type UseSelectionListKeyboardFocusParams<TData> = {
    initialFocusedIndex: number;
    maxIndex: number;
    disabledIndexes: readonly number[];
    isActive: boolean;
    isFocused: boolean;
    shouldScrollToFocusedIndex: boolean;
    shouldDebounceScrolling: boolean;
    scrollToIndex: ScrollToIndex;
    debouncedScrollToIndex: ScrollToIndex;
    listRef: RefObject<FlashListRef<TData> | null>;
    setShouldDisableHoverStyle: (shouldDisableHoverStyle: boolean) => void;
};

type UseSelectionListKeyboardFocusResult = {
    focusedIndex: number;
    setFocusedIndex: (index: number) => void;
    setFocusedIndexFromRowFocus: (index: number) => void;
    setFocusedIndexWithoutScrollOnChange: (index: number) => void;
    suppressNextFocusScroll: () => void;
    isKeyboardNavigating: boolean;
    setHasKeyBeenPressed: () => void;
};

/** Owns a SelectionList's keyboard-navigable focused index: wraps useArrowKeyFocusManager, tracks keyboard-nav modality (incl. Tab), and provides the focus-restore-aware cursor setters + scroll suppression. */
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

    // Tab isn't an arrow key, so flip the keyboard-nav flag for it here too.
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

    // Move the cursor but skip the scroll the change would trigger.
    const setFocusedIndexWithoutScrollOnChange = (index: number) => {
        if (index !== focusedIndex) {
            suppressNextFocusScrollRef.current = true;
        }
        setFocusedIndex(index);
    };

    // On a focus restore, keep the cursor on the restored row without scrolling to it.
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
