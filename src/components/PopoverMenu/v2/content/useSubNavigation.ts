import {useRef, useState} from 'react';

type SubNavigationActions = {
    enterSub: (id: string) => void;
    exitSub: (target?: string | null) => void;
    registerSub: (subID: string) => void;
    /** Pops to the nearest still-mounted ancestor when an active sub unmounts. */
    unregisterSub: (subID: string) => void;
};

type UseSubNavigationResult = {
    currentSubID: string | null;
    isAncestorOfCurrent: (subID: string) => boolean;
    actions: SubNavigationActions;
};

function useSubNavigation({onLevelChange}: {onLevelChange: () => void}): UseSubNavigationResult {
    // Outermost → active level; empty = top.
    const [pathStack, setPathStack] = useState<string[]>([]);
    const mountedSubs = useRef<Set<string>>(new Set());

    const currentSubID = pathStack.length > 0 ? (pathStack.at(-1) ?? null) : null;

    const isAncestorOfCurrent = (subID: string): boolean => {
        const idx = pathStack.indexOf(subID);
        return idx >= 0 && idx < pathStack.length - 1;
    };

    const actions: SubNavigationActions = {
        enterSub: (id) => {
            setPathStack((prev) => [...prev, id]);
            onLevelChange();
        },
        exitSub: (target = null) => {
            setPathStack((prev) => {
                if (target === null) {
                    return [];
                }
                const idx = prev.indexOf(target);
                return idx < 0 ? prev : prev.slice(0, idx + 1);
            });
            onLevelChange();
        },
        registerSub: (subID) => {
            mountedSubs.current.add(subID);
        },
        unregisterSub: (subID) => {
            mountedSubs.current.delete(subID);
            setPathStack((prev) => {
                if (prev.at(-1) !== subID) {
                    return prev;
                }
                // Cascade past any further unmounted ancestors to the nearest still-mounted one.
                let next = prev.slice(0, -1);
                while (next.length > 0) {
                    const top = next.at(-1);
                    if (top !== undefined && mountedSubs.current.has(top)) {
                        break;
                    }
                    next = next.slice(0, -1);
                }
                return next;
            });
            onLevelChange();
        },
    };

    return {
        currentSubID,
        isAncestorOfCurrent,
        actions,
    };
}

export default useSubNavigation;
export type {SubNavigationActions};
