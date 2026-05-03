import {useRef, useState} from 'react';

type CurrentSub = {id: string | null; ancestorChain: readonly string[]};

const ROOT_SUB: CurrentSub = {id: null, ancestorChain: []};

type SubNavigationActions = {
    enterSub: (id: string, ancestorChain: readonly string[]) => void;
    exitSub: (target?: string | null) => void;
    registerSub: (subID: string) => void;
    /** Pops to the nearest still-mounted ancestor when an active sub unmounts. */
    unregisterSub: (subID: string, ancestorChain: readonly string[]) => void;
};

type UseSubNavigationResult = {
    currentSubID: string | null;
    currentSubAncestorChain: readonly string[];
    actions: SubNavigationActions;
    resetToRoot: () => void;
};

/** Owns sub-menu navigation state and the mounted-sub registry. */
function useSubNavigation({onLevelChange}: {onLevelChange: () => void}): UseSubNavigationResult {
    const [currentSub, setCurrentSub] = useState<CurrentSub>(ROOT_SUB);
    const mountedSubs = useRef<Set<string>>(new Set());

    const actions: SubNavigationActions = {
        enterSub: (id, ancestorChain) => {
            setCurrentSub({id, ancestorChain});
            onLevelChange();
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
            onLevelChange();
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
    };

    return {
        currentSubID: currentSub.id,
        currentSubAncestorChain: currentSub.ancestorChain,
        actions,
        resetToRoot: () => setCurrentSub(ROOT_SUB),
    };
}

export default useSubNavigation;
export type {SubNavigationActions};
