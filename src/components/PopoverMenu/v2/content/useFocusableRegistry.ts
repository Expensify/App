import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';

import CONST from '@src/CONST';

import {useState} from 'react';

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

function useFocusableRegistry({isVisible}: {isVisible: boolean}): UseFocusableRegistryResult {
    const [registry, setRegistry] = useState<Map<string, FocusableItem>>(() => new Map());
    const orderedIDs = useOrderedIDs(registry);
    const disabledIndexes = orderedIDs.flatMap((id, index) => (registry.get(id)?.isDisabled ? [index] : []));
    const [focusedIndex, setFocusedIndex] = useArrowKeyFocusManager({maxIndex: orderedIDs.length - 1, isActive: isVisible, initialFocusedIndex: -1, disabledIndexes});
    // Guard `-1` (nothing focused); `.at(-1)` would return the last item.
    const focusedID = focusedIndex >= 0 ? (orderedIDs.at(focusedIndex) ?? null) : null;

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
            setFocusedIndex(id === null ? -1 : orderedIDs.indexOf(id));
        },
    };

    useKeyboardShortcut(
        CONST.KEYBOARD_SHORTCUTS.ENTER,
        () => {
            const item = focusedID ? registry.get(focusedID) : undefined;
            if (!item || item.isDisabled) {
                return;
            }
            item.onActivate();
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
