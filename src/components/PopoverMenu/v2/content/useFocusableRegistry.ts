import {useState} from 'react';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import {useRefMirror} from '@hooks/useCallbackRef';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import CONST from '@src/CONST';
import type {FocusableItem} from './ContentContext';
import useOrderedIDs from './useOrderedIDs';

const NO_FOCUSED_INDEX = -1;

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

function useFocusableRegistry({isOpen}: {isOpen: boolean}): UseFocusableRegistryResult {
    const [registry, setRegistry] = useState<Map<string, FocusableItem>>(() => new Map());
    const orderedIDs = useOrderedIDs(registry);
    const disabledIndexes = orderedIDs.flatMap((id, index) => (registry.get(id)?.isDisabled ? [index] : []));
    const [focusedIndex, setFocusedIndex] = useArrowKeyFocusManager({maxIndex: orderedIDs.length - 1, isActive: isOpen, initialFocusedIndex: NO_FOCUSED_INDEX, disabledIndexes});

    const [wasOpen, setWasVisible] = useState(isOpen);
    if (wasOpen !== isOpen) {
        setWasVisible(isOpen);
        if (isOpen) {
            setFocusedIndex(NO_FOCUSED_INDEX);
        }
    }

    const focusedID = focusedIndex >= 0 ? (orderedIDs.at(focusedIndex) ?? null) : null;

    const orderedIDsRef = useRefMirror(orderedIDs);

    const [actions] = useState<FocusableRegistryActions>(() => ({
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
    }));

    const activateFocused = () => {
        const item = focusedID ? registry.get(focusedID) : undefined;
        if (!item || item.isDisabled) {
            return;
        }
        item.onActivate();
    };

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ENTER, activateFocused, {isActive: isOpen});
    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.SPACE, activateFocused, {isActive: isOpen});

    return {
        focusedID,
        actions,
        resetFocus: () => setFocusedIndex(NO_FOCUSED_INDEX),
    };
}

export default useFocusableRegistry;
export type {FocusableRegistryActions};
