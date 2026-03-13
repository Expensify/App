import React, {createContext, useContext, useRef, useState} from 'react';

type LabelEntry = {id: number; text: string; ready: boolean};

type DialogLabelActions = {
    pushLabel: (text: string) => number;
    popLabel: (id: number) => void;
    updateLabel: (id: number, text: string) => void;
    markReady: (id: number) => void;
    claimInitialFocus: () => boolean;
    isInsideDialog: boolean;
};

type DialogLabelValue = {
    labelText: string | undefined;
    isReady: boolean;
};

const DialogLabelActionsContext = createContext<DialogLabelActions>({
    pushLabel: () => 0,
    popLabel: () => {},
    updateLabel: () => {},
    markReady: () => {},
    claimInitialFocus: () => false,
    isInsideDialog: false,
});

const DialogLabelValueContext = createContext<DialogLabelValue>({
    labelText: undefined,
    isReady: false,
});

function DialogLabelProvider({children}: {children: React.ReactNode}) {
    const nextIdRef = useRef(0);
    const initialFocusClaimedRef = useRef(false);
    const [labelStack, setLabelStack] = useState<LabelEntry[]>([]);
    const pushLabel = (text: string): number => {
        const id = nextIdRef.current++;
        setLabelStack((prev) => [...prev, {id, text, ready: false}]);
        return id;
    };

    const popLabel = (id: number) => {
        setLabelStack((prev) => prev.filter((entry) => entry.id !== id));
    };

    const updateLabel = (id: number, text: string) => {
        setLabelStack((prev) => {
            const existing = prev.find((entry) => entry.id === id);
            if (existing?.text === text) {
                return prev;
            }
            return prev.map((entry) => (entry.id === id ? {...entry, text} : entry));
        });
    };

    const markReady = (id: number) => {
        setLabelStack((prev) => {
            const existing = prev.find((entry) => entry.id === id);
            if (existing?.ready) {
                return prev;
            }
            return prev.map((entry) => (entry.id === id ? {...entry, ready: true} : entry));
        });
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
        updateLabel,
        markReady,
        claimInitialFocus,
        isInsideDialog: true,
    };

    const topEntry = labelStack.at(-1);
    const value: DialogLabelValue = {labelText: topEntry?.text, isReady: topEntry?.ready ?? false};

    return (
        <DialogLabelActionsContext.Provider value={actions}>
            <DialogLabelValueContext.Provider value={value}>{children}</DialogLabelValueContext.Provider>
        </DialogLabelActionsContext.Provider>
    );
}

function useDialogLabelActions(): DialogLabelActions {
    return useContext(DialogLabelActionsContext);
}

function useDialogLabelValue(): DialogLabelValue {
    return useContext(DialogLabelValueContext);
}

export {DialogLabelProvider, useDialogLabelActions, useDialogLabelValue};
