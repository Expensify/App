import {useLayoutEffect, useRef, useState} from 'react';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import CONST from '@src/CONST';
import type {ContentActionsValue, FocusableItem} from './ContentContext';
import useOnValueChange from './useOnValueChange';
import useOrderedIds from './useOrderedIds';

type CurrentSub = {id: string | null; ancestorChain: readonly string[]};

type StateMachineState = {
    currentSubID: string | null;
    currentSubAncestorChain: readonly string[];
    focusedID: string | null;
};

const ROOT_SUB: CurrentSub = {id: null, ancestorChain: []};

/**
 * Owns navigation state (`currentSub` chain), the focusable-item registry, arrow-key focus index,
 * and the Enter activation shortcut. Returns the state slice and actions Content publishes via
 * `ContentStateContext` / `ContentActionsContext`. Resets to root on close.
 */
function useContentStateMachine({isVisible}: {isVisible: boolean}): {state: StateMachineState; actions: ContentActionsValue} {
    const [currentSub, setCurrentSub] = useState<CurrentSub>(ROOT_SUB);
    const mountedSubs = useRef<Set<string>>(new Set());

    useOnValueChange(isVisible, (nextVisible) => {
        if (nextVisible || currentSub.id === null) {
            return;
        }
        setCurrentSub(ROOT_SUB);
    });

    const [registry, setRegistry] = useState<Map<string, FocusableItem>>(() => new Map());
    const orderedIds = useOrderedIds(registry);
    const [focusedIndex, setFocusedIndex] = useArrowKeyFocusManager({maxIndex: orderedIds.length - 1, isActive: isVisible, initialFocusedIndex: -1});
    // Guard the -1 sentinel — `.at(-1)` would return the last item.
    const focusedID = focusedIndex >= 0 ? (orderedIds.at(focusedIndex) ?? null) : null;

    // Mirror so setFocusedID reads the latest order without going stale.
    const orderedIdsRef = useRef(orderedIds);
    useLayoutEffect(() => {
        orderedIdsRef.current = orderedIds;
    });

    const [actions] = useState<ContentActionsValue>(() => ({
        // Reset focus on level change: the registry is replaced and the old numeric index would map to a different row.
        enterSub: (id, ancestorChain) => {
            setCurrentSub({id, ancestorChain});
            setFocusedIndex(-1);
        },
        exitSub: (target = null) => {
            setCurrentSub((prev) => {
                if (target === null) {
                    return ROOT_SUB;
                }
                // Target's chain is the prefix of the current chain up to target.
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
            setFocusedIndex(id === null ? -1 : orderedIdsRef.current.indexOf(id));
        },
    }));

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
        state: {currentSubID: currentSub.id, currentSubAncestorChain: currentSub.ancestorChain, focusedID},
        actions,
    };
}

export default useContentStateMachine;
