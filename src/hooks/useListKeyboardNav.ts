import {useIsFocused} from '@react-navigation/native';
import type React from 'react';
import {useEffect, useState} from 'react';
import type {View} from 'react-native';
import CONST from '@src/CONST';
import useActiveElementRole from './useActiveElementRole';
import useArrowKeyFocusManager from './useArrowKeyFocusManager';
import useKeyboardShortcut from './useKeyboardShortcut';

type FocusableContainer = {
    addEventListener: HTMLElement['addEventListener'];
    removeEventListener: HTMLElement['removeEventListener'];
    contains: HTMLElement['contains'];
};

type UseListKeyboardNavConfig<T extends View | HTMLElement> = {
    isActive: boolean;
    itemKeys: string[];
    disabledIndexes: readonly number[];
    containerRef: React.RefObject<T | null>;
    onSelect?: (focusedIndex: number) => void;
};

/**
 * Manages keyboard navigation (arrow keys, Enter/Space selection) for a list of items
 * with DOM focus tracking. Pass a `containerRef` attached to the wrapping element.
 * On web, focusin/focusout DOM events track whether the list has focus.
 * On native, DOM APIs are absent and the effect safely no-ops.
 */
function useListKeyboardNav<T extends View | HTMLElement>({isActive, itemKeys, disabledIndexes, containerRef, onSelect}: UseListKeyboardNavConfig<T>) {
    const isFocused = useIsFocused();
    const [hasFocus, setHasFocus] = useState(false);
    const [hasBeenFocused, setHasBeenFocused] = useState(false);

    const isArrowKeyActive = isActive && (hasFocus || (isFocused && !hasBeenFocused));

    const [focusedIndex, setFocusedIndex] = useArrowKeyFocusManager({
        initialFocusedIndex: -1,
        maxIndex: itemKeys.length - 1,
        disabledIndexes,
        isActive: isArrowKeyActive,
        disableCyclicTraversal: true,
    });

    useEffect(() => {
        if (!isActive) {
            return;
        }
        // On web, RNW renders View as a div so DOM APIs exist. On native they don't and this safely returns.
        const container = containerRef.current as FocusableContainer | null;
        if (!container?.addEventListener) {
            return;
        }
        const handleFocusIn = () => {
            setHasBeenFocused(true);
            setHasFocus(true);
        };
        const handleFocusOut = (event: FocusEvent) => {
            if (event.relatedTarget instanceof Node && container.contains(event.relatedTarget)) {
                return;
            }
            setHasFocus(false);
            // When relatedTarget is null the focused element was destroyed by a React re-render.
            // Preserve focusedIndex so the item at the same position can be refocused.
            if (event.relatedTarget) {
                setFocusedIndex(-1);
            }
        };
        container.addEventListener('focusin', handleFocusIn);
        container.addEventListener('focusout', handleFocusOut);
        return () => {
            container.removeEventListener('focusin', handleFocusIn);
            container.removeEventListener('focusout', handleFocusOut);
        };
    }, [isActive, setFocusedIndex, containerRef]);

    useEffect(() => {
        if (!isActive || focusedIndex < 0) {
            return;
        }

        let newIndex = focusedIndex;

        // Clamp to bounds when list shrinks
        if (newIndex > itemKeys.length - 1) {
            newIndex = Math.max(itemKeys.length - 1, -1);
        }

        // Skip forward past disabled indexes
        while (newIndex >= 0 && newIndex < itemKeys.length && disabledIndexes.includes(newIndex)) {
            newIndex++;
        }

        // If we overshot the end, scan backward from the original position
        if (newIndex >= itemKeys.length) {
            newIndex = focusedIndex - 1;
            while (newIndex >= 0 && disabledIndexes.includes(newIndex)) {
                newIndex--;
            }
            if (newIndex < 0) {
                newIndex = -1;
            }
        }

        if (newIndex !== focusedIndex) {
            setFocusedIndex(newIndex);
        }
    }, [itemKeys.length, focusedIndex, setFocusedIndex, isActive, disabledIndexes]);

    const selectFocusedOption = () => {
        if (!onSelect || focusedIndex < 0) {
            return;
        }
        onSelect(focusedIndex);
    };

    const activeElementRole = useActiveElementRole();
    const isNativelyHandledRole = activeElementRole === CONST.ROLE.BUTTON || activeElementRole === CONST.ROLE.CHECKBOX;
    const isShortcutActive = isActive && hasFocus && focusedIndex >= 0 && !!onSelect && !isNativelyHandledRole;

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ENTER, selectFocusedOption, {
        isActive: isShortcutActive,
    });

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.SPACE, selectFocusedOption, {
        isActive: isShortcutActive,
    });

    return {focusedIndex, setFocusedIndex};
}

export default useListKeyboardNav;
