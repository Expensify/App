import {useLayoutEffect, useRef, useState} from 'react';
import type {Dispatch, SetStateAction} from 'react';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import CONST from '@src/CONST';
import type {ContentActionsValue, ContentFocusValue, ContentNavigationValue, FocusableItem} from './ContentContext';
import useOrderedIDs from './useOrderedIDs';

type CurrentSub = {id: string | null; ancestorChain: readonly string[]};

const ROOT_SUB: CurrentSub = {id: null, ancestorChain: []};

function useContentController({isVisible, setIsVisible}: {isVisible: boolean; setIsVisible: Dispatch<SetStateAction<boolean>>}): {
    navigation: ContentNavigationValue;
    focus: ContentFocusValue;
    actions: ContentActionsValue;
} {
    const [currentSub, setCurrentSub] = useState<CurrentSub>(ROOT_SUB);
    const mountedSubs = useRef<Set<string>>(new Set());

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

    const actions: ContentActionsValue = {
        // Reset focus on level change — the old index points at a different row in the new registry.
        enterSub: (id, ancestorChain) => {
            setCurrentSub({id, ancestorChain});
            setFocusedIndex(-1);
        },
        exitSub: (target = null) => {
            setCurrentSub((prev) => {
                if (target === null) {
                    return ROOT_SUB;
                }
                const idx = prev.ancestorChain.indexOf(target);
                const newChain = idx >= 0 ? prev.ancestorChain.slice(0, idx) : [];
                return {id: target, ancestorChain: newChain};
            });
            setFocusedIndex(-1);
        },
        registerSub: (subID) => {
            mountedSubs.current.add(subID);
        },
        unregisterSub: (subID, ancestorChain) => {
            mountedSubs.current.delete(subID);
            setCurrentSub((prev) => {
                if (prev.id !== subID) {
                    return prev;
                }
                const newID = ancestorChain.findLast((ancestor) => mountedSubs.current.has(ancestor)) ?? null;
                if (newID === null) {
                    return ROOT_SUB;
                }
                const idx = ancestorChain.indexOf(newID);
                const newChain = idx >= 0 ? ancestorChain.slice(0, idx) : [];
                return {id: newID, ancestorChain: newChain};
            });
        },
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
        close: () => {
            // Batched into one render so the next open lands at root with no focused row.
            setIsVisible(false);
            setCurrentSub(ROOT_SUB);
            setFocusedIndex(-1);
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
        navigation: {currentSubID: currentSub.id, currentSubAncestorChain: currentSub.ancestorChain},
        focus: {focusedID},
        actions,
    };
}

export default useContentController;
