import React, {createContext, useContext, useRef} from 'react';
import type {View} from 'react-native';

type LabelEntry = {id: number; text: string};

type DialogLabelActions = {
    pushLabel: (text: string) => number;
    popLabel: (id: number) => void;
    claimInitialFocus: () => boolean;
    containerRef: React.RefObject<View | null>;
    isInsideDialog: boolean;
};

const DialogLabelActionsContext = createContext<DialogLabelActions>({
    pushLabel: () => 0,
    popLabel: () => {},
    claimInitialFocus: () => false,
    containerRef: {current: null},
    isInsideDialog: false,
});

function DialogLabelProvider({children}: {children: React.ReactNode}) {
    const containerRef = useRef<View>(null);
    const nextIdRef = useRef(0);
    const labelStackRef = useRef<LabelEntry[]>([]);
    const initialFocusClaimedRef = useRef(false);

    const updateContainerLabel = () => {
        const top = labelStackRef.current.at(-1);
        const node = containerRef.current as unknown as HTMLElement | null;
        if (!node || typeof node.setAttribute !== 'function') {
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

    const actions: DialogLabelActions = {
        pushLabel,
        popLabel,
        claimInitialFocus,
        containerRef,
        isInsideDialog: true,
    };

    return <DialogLabelActionsContext.Provider value={actions}>{children}</DialogLabelActionsContext.Provider>;
}

function useDialogLabelActions(): DialogLabelActions {
    return useContext(DialogLabelActionsContext);
}

export {DialogLabelProvider, useDialogLabelActions};
