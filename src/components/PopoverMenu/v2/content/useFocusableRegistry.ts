import {useLayoutEffect, useRef, useState} from 'react';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import CONST from '@src/CONST';
import type {FocusableItem} from './ContentContext';
import useOrderedIDs from './useOrderedIDs';

type FocusableRegistryActions = {
    registerItem: (id: string, item: FocusableItem) => void;
    unregisterItem: (id: string) => void;
    setFocusedID: (id: string | null) => void;
};

type UseFocusableRegistryResult = {
    focusedID: string | null;
    actions: FocusableRegistryActions;
    resetFocus: () => void;
};

/** Registry is rebuilt as `new Map(prev)` per change — in-place mutation breaks RC memoization of action closures (allocation cost noted in plan §11). */
function useFocusableRegistry({isVisible}: {isVisible: boolean}): UseFocusableRegistryResult {
    const [registry, setRegistry] = useState<Map<string, FocusableItem>>(() => new Map());
    const orderedIDs = useOrderedIDs(registry);
    const [focusedIndex, setFocusedIndex] = useArrowKeyFocusManager({maxIndex: orderedIDs.length - 1, isActive: isVisible, initialFocusedIndex: -1});
    // `.at(-1)` would return the last item, not "nothing focused".
    const focusedID = focusedIndex >= 0 ? (orderedIDs.at(focusedIndex) ?? null) : null;

    // Mirror so setFocusedID reads the latest order, not a stale closure.
    const orderedIDsRef = useRef(orderedIDs);
    useLayoutEffect(() => {
        orderedIDsRef.current = orderedIDs;
    });

    const actions: FocusableRegistryActions = {
        registerItem: (id, item) =>
            setRegistry((prev) => {
                const next = new Map(prev);
                next.set(id, item);
                return next;
            }),
        unregisterItem: (id) =>
            setRegistry((prev) => {
                if (!prev.has(id)) {
                    return prev;
                }
                const next = new Map(prev);
                next.delete(id);
                return next;
            }),
        setFocusedID: (id) => {
            setFocusedIndex(id === null ? -1 : orderedIDsRef.current.indexOf(id));
        },
    };

    useKeyboardShortcut(
        CONST.KEYBOARD_SHORTCUTS.ENTER,
        (event) => {
            const item = focusedID ? registry.get(focusedID) : undefined;
            if (!item || item.isDisabled) {
                return;
            }
            item.onActivate(event);
        },
        {isActive: isVisible},
    );

    return {
        focusedID,
        actions,
        resetFocus: () => setFocusedIndex(-1),
    };
}

export default useFocusableRegistry;
export type {FocusableRegistryActions};
