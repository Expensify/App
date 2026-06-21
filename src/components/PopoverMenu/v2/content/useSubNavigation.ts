import {useEffect, useRef, useState} from 'react';
import {useRefMirror} from '@hooks/useCallbackRef';

type SubNavigationActions = {
    enterSub: (id: string, level: number) => void;
    exitSub: (target?: string | null) => void;
    registerSub: (subID: string) => void;
    unregisterSub: (subID: string) => void;
};

type UseSubNavigationResult = {
    currentSubID: string | null;
    isAncestorOfCurrent: (subID: string) => boolean;
    actions: SubNavigationActions;
};

function useSubNavigation({onLevelChange}: {onLevelChange: () => void}): UseSubNavigationResult {
    const [pathStack, setPathStack] = useState<string[]>([]);
    const mountedSubs = useRef<Set<string>>(new Set());

    const onLevelChangeRef = useRefMirror(onLevelChange);
    const previousPathStack = useRef(pathStack);
    useEffect(() => {
        if (previousPathStack.current === pathStack) {
            return;
        }
        previousPathStack.current = pathStack;
        onLevelChangeRef.current();
    }, [pathStack, onLevelChangeRef]);

    const currentSubID = pathStack.length > 0 ? (pathStack.at(-1) ?? null) : null;

    const isAncestorOfCurrent = (subID: string): boolean => {
        const idx = pathStack.indexOf(subID);
        return idx >= 0 && idx < pathStack.length - 1;
    };

    const [actions] = useState<SubNavigationActions>(() => ({
        enterSub: (id, level) => {
            setPathStack((prev) => {
                if (level > prev.length) {
                    return prev;
                }
                return [...prev.slice(0, level), id];
            });
        },
        exitSub: (target = null) => {
            setPathStack((prev) => {
                if (target === null) {
                    return prev.length === 0 ? prev : [];
                }
                const idx = prev.indexOf(target);
                return idx < 0 ? prev : prev.slice(0, idx + 1);
            });
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
        },
    }));

    return {
        currentSubID,
        isAncestorOfCurrent,
        actions,
    };
}

export default useSubNavigation;
export type {SubNavigationActions};
