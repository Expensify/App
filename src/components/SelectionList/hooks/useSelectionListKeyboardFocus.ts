import {useEffect, useRef, useState} from 'react';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import {addKeyDownPressListener, removeKeyDownPressListener} from '@libs/KeyboardShortcut/KeyDownPressListener';
import CONST from '@src/CONST';

type ScrollToIndex = (index: number, animated?: boolean) => void;

type UseSelectionListKeyboardFocusParams = {
    initialFocusedIndex: number;
    maxIndex: number;
    disabledIndexes: readonly number[];
    isActive: boolean;
    isFocused: boolean;
    shouldScrollToFocusedIndex: boolean;
    shouldDebounceScrolling: boolean;
    scrollToIndex: ScrollToIndex;
    debouncedScrollToIndex: ScrollToIndex;
    announceProgrammaticScroll: () => void;
    setShouldDisableHoverStyle: (shouldDisableHoverStyle: boolean) => void;
};

type UseSelectionListKeyboardFocusResult = {
    focusedIndex: number;
    setFocusedIndex: (index: number, shouldScrollHint?: boolean) => void;
    isKeyboardNavigating: boolean;
    setHasKeyBeenPressed: () => void;
};

/** Owns a SelectionList's keyboard-navigable focused index: wraps useArrowKeyFocusManager, tracks keyboard-nav modality (incl. Tab) */
function useSelectionListKeyboardFocus({
    initialFocusedIndex,
    maxIndex,
    disabledIndexes,
    isActive,
    isFocused,
    shouldScrollToFocusedIndex,
    shouldDebounceScrolling,
    scrollToIndex,
    debouncedScrollToIndex,
    announceProgrammaticScroll,
    setShouldDisableHoverStyle,
}: UseSelectionListKeyboardFocusParams): UseSelectionListKeyboardFocusResult {
    const hasKeyBeenPressed = useRef(false);
    const [isKeyboardNavigating, setIsKeyboardNavigating] = useState(false);

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
        onFocusedIndexChange: (index, shouldScrollHint) => {
            if (!shouldScrollHint || !shouldScrollToFocusedIndex) {
                return;
            }

            (shouldDebounceScrolling ? debouncedScrollToIndex : scrollToIndex)(index);
        },
        setHasKeyBeenPressed,
        isFocused,
        onArrowUpDownCallback: () => {
            setShouldDisableHoverStyle(true);
            announceProgrammaticScroll();
        },
    });

    return {
        focusedIndex,
        setFocusedIndex,
        isKeyboardNavigating,
        setHasKeyBeenPressed,
    };
}

export default useSelectionListKeyboardFocus;
