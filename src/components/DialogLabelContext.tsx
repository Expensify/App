import isHTMLElement from '@libs/isHTMLElement';

import type {View} from 'react-native';

import React, {createContext, useCallback, useContext, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore} from 'react';

type LabelEntry = {id: number; text: string};

type DialogLabelData = {
    containerRef: React.RefObject<View | null>;
    isInsideDialog: boolean;
    /**
     * Accessible name for the dialog — applied as a React `aria-label` prop (not via DOM setAttribute).
     * JAWS's virtual buffer misses post-render setAttribute; declarative props are written at commit time.
     */
    dialogAriaLabel: string | undefined;
};

type DialogLabelActions = {
    pushLabel: (text: string) => number;
    popLabel: (id: number) => void;
    claimInitialFocus: () => boolean;
};

const DialogLabelDataContext = createContext<DialogLabelData>({
    containerRef: {current: null},
    isInsideDialog: false,
    dialogAriaLabel: undefined,
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
    /**
     * When provided, used instead of observing the container's role/aria-modal attributes.
     * Prefer this in production so dialog semantics stay in React props (resize updates `isSmallScreenWidth`).
     */
    hasDialogSemantics?: boolean;
};

// Title-stack and initial-focus claim are co-located: each pushLabel re-arms the focus claim so a sub-screen re-receives initial focus.
function DialogLabelProvider({children, containerNode, hasDialogSemantics: hasDialogSemanticsProp}: DialogLabelProviderProps) {
    const nextIdRef = useRef(0);
    const labelStackRef = useRef<LabelEntry[]>([]);
    const initialFocusClaimedRef = useRef(false);
    const containerRef = useRef<View | null>(null);
    const [activeLabel, setActiveLabel] = useState<string | undefined>();

    useLayoutEffect(() => {
        containerRef.current = (containerNode as View | null) ?? null;
    }, [containerNode]);

    const hasDialogSemanticsFromDom = useSyncExternalStore(
        (callback) => {
            // Only observe the DOM when the caller did not pass an explicit prop.
            if (hasDialogSemanticsProp !== undefined || typeof MutationObserver === 'undefined' || !isHTMLElement(containerNode)) {
                return () => {};
            }
            const observer = new MutationObserver(callback);
            observer.observe(containerNode, {attributes: true, attributeFilter: ['role', 'aria-modal']});
            return () => observer.disconnect();
        },
        () => {
            if (hasDialogSemanticsProp !== undefined || !isHTMLElement(containerNode)) {
                return false;
            }
            return containerNode.getAttribute('role') === 'dialog' || containerNode.getAttribute('aria-modal') === 'true';
        },
        () => false,
    );

    const hasDialogSemantics = hasDialogSemanticsProp ?? hasDialogSemanticsFromDom;

    const syncActiveLabelFromStack = useCallback(() => {
        const top = labelStackRef.current.at(-1);
        setActiveLabel((prev) => {
            const next = top?.text;
            return prev === next ? prev : next;
        });
    }, []);

    const pushLabel = useCallback(
        (text: string): number => {
            const id = nextIdRef.current++;
            labelStackRef.current = [...labelStackRef.current, {id, text}];
            initialFocusClaimedRef.current = false;
            syncActiveLabelFromStack();
            return id;
        },
        [syncActiveLabelFromStack],
    );

    const popLabel = useCallback(
        (id: number) => {
            labelStackRef.current = labelStackRef.current.filter((entry) => entry.id !== id);
            syncActiveLabelFromStack();
        },
        [syncActiveLabelFromStack],
    );

    const claimInitialFocus = useCallback((): boolean => {
        if (initialFocusClaimedRef.current) {
            return false;
        }
        initialFocusClaimedRef.current = true;
        return true;
    }, []);

    const data: DialogLabelData = useMemo(
        () => ({
            containerRef,
            isInsideDialog: hasDialogSemantics,
            // Only expose a name when the container is a dialog (wide RHP).
            dialogAriaLabel: hasDialogSemantics ? activeLabel : undefined,
        }),
        [hasDialogSemantics, activeLabel],
    );

    const actions: DialogLabelActions = useMemo(
        () => ({
            pushLabel,
            popLabel,
            claimInitialFocus,
        }),
        [pushLabel, popLabel, claimInitialFocus],
    );

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
