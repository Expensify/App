import React, {createContext, useContext, useRef, useState} from 'react';

type LabelEntry = {id: number; text: string};

type DialogLabelActions = {
    pushLabel: (text: string) => number;
    popLabel: (id: number) => void;
    updateLabel: (id: number, text: string) => void;
    isInsideDialog: boolean;
};

type DialogLabelValue = {
    labelText: string | undefined;
};

const DialogLabelActionsContext = createContext<DialogLabelActions>({
    pushLabel: () => 0,
    popLabel: () => {},
    updateLabel: () => {},
    isInsideDialog: false,
});

const DialogLabelValueContext = createContext<DialogLabelValue>({
    labelText: undefined,
});

function DialogLabelProvider({children}: {children: React.ReactNode}) {
    const nextIdRef = useRef(0);
    const [labelStack, setLabelStack] = useState<LabelEntry[]>([]);

    const pushLabel = (text: string): number => {
        const id = nextIdRef.current++;
        setLabelStack((prev) => [...prev, {id, text}]);
        return id;
    };

    const popLabel = (id: number) => {
        setLabelStack((prev) => prev.filter((entry) => entry.id !== id));
    };

    const updateLabel = (id: number, text: string) => {
        setLabelStack((prev) => prev.map((entry) => (entry.id === id ? {id, text} : entry)));
    };

    const actions: DialogLabelActions = {
        pushLabel,
        popLabel,
        updateLabel,
        isInsideDialog: true,
    };

    const value: DialogLabelValue = {labelText: labelStack.at(-1)?.text};

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
