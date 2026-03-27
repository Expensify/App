import {useIsFocused} from '@react-navigation/native';
import type React from 'react';
import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import type {View} from 'react-native';
import useArrowKeyFocusManager from './useArrowKeyFocusManager';

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
};

/**
 * Manages keyboard navigation (arrow keys + focus tracking) for a list of items.
 * Selection (Enter/Space) is NOT handled here — dnd-kit sets role="button" on sortable
 * items, so the browser handles Enter natively and SortableItem forwards it to the
 * inner pressable. Space is reserved for dnd-kit drag initiation.
 */
function useListKeyboardNav<T extends View | HTMLElement>({isActive, itemKeys, disabledIndexes, containerRef}: UseListKeyboardNavConfig<T>) {
    const isFocused = useIsFocused();
    const [hasFocus, setHasFocus] = useState(false);
    const [hasBeenFocused, setHasBeenFocused] = useState(false);

    const itemKeysRef = useRef(itemKeys);
    // useLayoutEffect so the ref is updated before SortableItem's useEffect calls .focus()
    useLayoutEffect(() => {
        itemKeysRef.current = itemKeys;
    });

    const isArrowKeyActive = isActive && (hasFocus || (isFocused && !hasBeenFocused));

    const [focusedIndex, setFocusedIndex] = useArrowKeyFocusManager({
        initialFocusedIndex: -1,
        maxIndex: itemKeys.length - 1,
        disabledIndexes,
        isActive: isArrowKeyActive,
    });

    useEffect(() => {
        if (!isActive) {
            return;
        }
        const container = containerRef.current as FocusableContainer | null;
        if (!container?.addEventListener) {
            return;
        }
        const handleFocusIn = (event: FocusEvent) => {
            setHasBeenFocused(true);
            setHasFocus(true);
            const target = event.target as HTMLElement | null;
            if (target?.id) {
                const index = itemKeysRef.current.indexOf(target.id);
                if (index >= 0) {
                    setFocusedIndex(index);
                }
            }
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

        if (newIndex > itemKeys.length - 1) {
            newIndex = Math.max(itemKeys.length - 1, -1);
        }

        while (newIndex >= 0 && newIndex < itemKeys.length && disabledIndexes.includes(newIndex)) {
            newIndex++;
        }

        // Overshot the end — scan backward from the original position
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

    return {focusedIndex, setFocusedIndex};
}

export default useListKeyboardNav;
