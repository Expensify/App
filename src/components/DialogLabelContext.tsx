import React, {createContext, useCallback, useContext, useMemo, useRef, useState} from 'react';

type LabelEntry = {id: number; text: string};

type DialogLabelContextType = {
    labelText: string | undefined;
    pushLabel: (text: string) => number;
    popLabel: (id: number) => void;
    isInsideDialog: boolean;
};

const DialogLabelContext = createContext<DialogLabelContextType>({
    labelText: undefined,
    pushLabel: () => -1,
    popLabel: () => {},
    isInsideDialog: false,
});

function DialogLabelProvider({children}: {children: React.ReactNode}) {
    const nextId = useRef(0);
    const [labelStack, setLabelStack] = useState<LabelEntry[]>([]);
    const pushLabel = useCallback((text: string): number => {
        const id = nextId.current;
        nextId.current += 1;
        setLabelStack((prev) => [...prev, {id, text}]);
        return id;
    }, []);
    const popLabel = useCallback((id: number) => {
        setLabelStack((prev) => prev.filter((entry) => entry.id !== id));
    }, []);
    const labelText = labelStack.at(-1)?.text;
    const value = useMemo(() => ({labelText, pushLabel, popLabel, isInsideDialog: true}), [labelText, pushLabel, popLabel]);
    return <DialogLabelContext.Provider value={value}>{children}</DialogLabelContext.Provider>;
}

function useDialogLabel() {
    return useContext(DialogLabelContext);
}

export {DialogLabelProvider, useDialogLabel};
export default DialogLabelContext;
