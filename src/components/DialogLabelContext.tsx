import isHTMLElement from '@libs/isHTMLElement';

import type {View} from 'react-native';

import React, {createContext, useContext, useEffect, useLayoutEffect, useRef, useSyncExternalStore} from 'react';

type LabelEntry = {id: number; text: string};

type DialogLabelData = {
    containerRef: React.RefObject<View | null>;
    isInsideDialog: boolean;
};

type DialogLabelActions = {
    pushLabel: (text: string) => number;
    popLabel: (id: number) => void;
    claimInitialFocus: () => boolean;
};

const DialogLabelDataContext = createContext<DialogLabelData>({
    containerRef: {current: null},
    isInsideDialog: false,
});

const DialogLabelActionsContext = createContext<DialogLabelActions>({
    pushLabel: () => 0,
    popLabel: () => {},
    claimInitialFocus: () => false,
});

type DialogLabelProviderProps = {
    children: React.ReactNode;
    /** Pass via `useState`/callback-ref so the provider observes node identity changes; a `RefObject` would pin the MutationObserver to the original node across Animated.View remounts. */
    containerNode: View | HTMLElement | null;
};

// Title-stack and initial-focus claim are co-located: each pushLabel re-arms the focus claim so a sub-screen re-receives initial focus.
function DialogLabelProvider({children, containerNode}: DialogLabelProviderProps) {
    const nextIdRef = useRef(0);
    const labelStackRef = useRef<LabelEntry[]>([]);
    const initialFocusClaimedRef = useRef(false);
    const containerRef = useRef<View | null>(null);
    useLayoutEffect(() => {
        containerRef.current = (containerNode as View | null) ?? null;
    }, [containerNode]);

    const hasDialogSemantics = useSyncExternalStore(
        (callback) => {
            if (typeof MutationObserver === 'undefined' || !isHTMLElement(containerNode)) {
                return () => {};
            }
            const observer = new MutationObserver(callback);
            observer.observe(containerNode, {attributes: true, attributeFilter: ['role', 'aria-modal']});
            return () => observer.disconnect();
        },
        () => {
            if (!isHTMLElement(containerNode)) {
                return false;
            }
            return containerNode.getAttribute('role') === 'dialog' || containerNode.getAttribute('aria-modal') === 'true';
        },
        () => false,
    );

    const updateContainerLabel = () => {
        if (typeof document === 'undefined') {
            return;
        }
        const node = containerRef.current;
        if (!isHTMLElement(node)) {
            return;
        }
        // aria-label on a container without dialog semantics is ignored; skip the set on mobile where the RHP has no dialog role.
        if (!hasDialogSemantics) {
            node.removeAttribute('aria-label');
            return;
        }
        const top = labelStackRef.current.at(-1);
        if (top?.text) {
            node.setAttribute('aria-label', top.text);
        } else {
            node.removeAttribute('aria-label');
        }
    };

    const pushLabel = (text: string): number => {
        const id = nextIdRef.current++;
        labelStackRef.current = [...labelStackRef.current, {id, text}];
        initialFocusClaimedRef.current = false;
        updateContainerLabel();
        return id;
    };

    const popLabel = (id: number) => {
        labelStackRef.current = labelStackRef.current.filter((entry) => entry.id !== id);
        updateContainerLabel();
    };

    useEffect(() => {
        updateContainerLabel();
    }, [hasDialogSemantics, updateContainerLabel]);

    const claimInitialFocus = (): boolean => {
        if (initialFocusClaimedRef.current) {
            return false;
        }
        initialFocusClaimedRef.current = true;
        return true;
    };

    const data: DialogLabelData = {
        containerRef,
        isInsideDialog: hasDialogSemantics,
    };

    const actions: DialogLabelActions = {
        pushLabel,
        popLabel,
        claimInitialFocus,
    };

    return (
        <DialogLabelDataContext.Provider value={data}>
            <DialogLabelActionsContext.Provider value={actions}>{children}</DialogLabelActionsContext.Provider>
        </DialogLabelDataContext.Provider>
    );
}

function useDialogLabelData(): DialogLabelData {
    return useContext(DialogLabelDataContext);
}

function useDialogLabelActions(): DialogLabelActions {
    return useContext(DialogLabelActionsContext);
}

export {DialogLabelProvider, useDialogLabelData, useDialogLabelActions};
