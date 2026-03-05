import {useIsFocused} from '@react-navigation/native';
import type React from 'react';
import {useEffect, useRef, useState} from 'react';
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
            // Preserve focusedIndex so prevKeysRef can track the item to its new position.
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

    const prevKeysRef = useRef<string[]>(itemKeys);
    useEffect(() => {
        if (!isActive) {
            prevKeysRef.current = itemKeys;
            return;
        }
        const prevKeys = prevKeysRef.current;
        prevKeysRef.current = itemKeys;

        if (focusedIndex < 0 || focusedIndex >= prevKeys.length) {
            return;
        }

        const focusedKey = prevKeys.at(focusedIndex);
        if (!focusedKey || (focusedIndex < itemKeys.length && itemKeys.at(focusedIndex) === focusedKey)) {
            return;
        }

        const newIndex = itemKeys.indexOf(focusedKey);
        if (newIndex >= 0 && newIndex !== focusedIndex) {
            setFocusedIndex(newIndex);
        }
    }, [itemKeys, focusedIndex, setFocusedIndex, isActive]);

    useEffect(() => {
        if (!isActive) {
            return;
        }
        if (focusedIndex <= itemKeys.length - 1) {
            return;
        }
        setFocusedIndex(Math.max(itemKeys.length - 1, -1));
    }, [itemKeys.length, focusedIndex, setFocusedIndex, isActive]);

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
