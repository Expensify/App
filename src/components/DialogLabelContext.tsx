import React, {createContext, useContext, useRef} from 'react';
import type {View} from 'react-native';
import isHTMLElement from '@libs/isHTMLElement';

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
    containerRef: React.RefObject<View | null>;
};

// Title-stack and initial-focus claim are co-located: each pushLabel re-arms the focus claim so a sub-screen re-receives initial focus.
function DialogLabelProvider({children, containerRef}: DialogLabelProviderProps) {
    const nextIdRef = useRef(0);
    const labelStackRef = useRef<LabelEntry[]>([]);
    const initialFocusClaimedRef = useRef(false);

    const updateContainerLabel = () => {
        const top = labelStackRef.current.at(-1);
        const node = containerRef.current;
        if (!isHTMLElement(node)) {
            return;
        }
        // aria-label on a roleless element is ignored by screen readers; skip the set on mobile (where the RHP container has no dialog role).
        const hasDialogSemantics = node.getAttribute('role') === 'dialog' || node.getAttribute('aria-modal') === 'true';
        if (!hasDialogSemantics) {
            node.removeAttribute('aria-label');
            return;
        }
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

    const claimInitialFocus = (): boolean => {
        if (initialFocusClaimedRef.current) {
            return false;
        }
        initialFocusClaimedRef.current = true;
        return true;
    };

    const data: DialogLabelData = {
        containerRef,
        isInsideDialog: true,
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
