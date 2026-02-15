import React, {createContext, useCallback, useContext, useMemo, useState} from 'react';

type DialogLabelContextType = {
    labelText: string | undefined;
    pushLabel: (text: string) => void;
    popLabel: () => void;
    isInsideDialog: boolean;
};

const DialogLabelContext = createContext<DialogLabelContextType>({
    labelText: undefined,
    pushLabel: () => {},
    popLabel: () => {},
    isInsideDialog: false,
});

function DialogLabelProvider({children}: {children: React.ReactNode}) {
    const [labelStack, setLabelStack] = useState<string[]>([]);
    const pushLabel = useCallback((text: string) => {
        setLabelStack((prev) => [...prev, text]);
    }, []);
    const popLabel = useCallback(() => {
        setLabelStack((prev) => prev.slice(0, -1));
    }, []);
    const labelText = labelStack.at(-1);
    const value = useMemo(() => ({labelText, pushLabel, popLabel, isInsideDialog: true}), [labelText, pushLabel, popLabel]);
    return <DialogLabelContext.Provider value={value}>{children}</DialogLabelContext.Provider>;
}

function useDialogLabel() {
    return useContext(DialogLabelContext);
}

export {DialogLabelProvider, useDialogLabel};
export default DialogLabelContext;
