import {useLayoutEffect, useRef, useState} from 'react';

type SubNavigationActions = {
    enterSub: (id: string) => void;
    exitSub: (target?: string | null) => void;
    registerSub: (subID: string, parentSubID: string | null) => void;
    /** Pops to the nearest still-mounted ancestor when an active sub unmounts. */
    unregisterSub: (subID: string) => void;
};

type UseSubNavigationResult = {
    currentSubID: string | null;
    isAncestorOfCurrent: (subID: string) => boolean;
    actions: SubNavigationActions;
    resetToRoot: () => void;
};

/** `parentLinks` is append-only so cascade-on-unmount can walk through deleted intermediates; `mountedSubs` is the authoritative mount-state set. */
function useSubNavigation({onLevelChange}: {onLevelChange: () => void}): UseSubNavigationResult {
    const [currentSubID, setCurrentSubID] = useState<string | null>(null);
    const parentLinks = useRef<Map<string, string | null>>(new Map());
    const mountedSubs = useRef<Set<string>>(new Set());

    // Mirror so `unregisterSub`'s cascade-pop check reads the committed level, not a stale closure.
    const currentSubIDRef = useRef(currentSubID);
    useLayoutEffect(() => {
        currentSubIDRef.current = currentSubID;
    });

    const isAncestorOfCurrent = (subID: string): boolean => {
        if (currentSubID === null) {
            return false;
        }
        let cursor = parentLinks.current.get(currentSubID) ?? null;
        while (cursor !== null) {
            if (cursor === subID) {
                return true;
            }
            cursor = parentLinks.current.get(cursor) ?? null;
        }
        return false;
    };

    const actions: SubNavigationActions = {
        enterSub: (id) => {
            setCurrentSubID(id);
            onLevelChange();
        },
        exitSub: (target = null) => {
            setCurrentSubID(target);
            onLevelChange();
        },
        registerSub: (subID, parentSubID) => {
            parentLinks.current.set(subID, parentSubID);
            mountedSubs.current.add(subID);
        },
        unregisterSub: (subID) => {
            mountedSubs.current.delete(subID);
            if (currentSubIDRef.current !== subID) {
                return;
            }
            let cursor = parentLinks.current.get(subID) ?? null;
            while (cursor !== null && !mountedSubs.current.has(cursor)) {
                cursor = parentLinks.current.get(cursor) ?? null;
            }
            setCurrentSubID(cursor);
            onLevelChange();
        },
    };

    return {
        currentSubID,
        isAncestorOfCurrent,
        actions,
        resetToRoot: () => setCurrentSubID(null),
    };
}

export default useSubNavigation;
export type {SubNavigationActions};
