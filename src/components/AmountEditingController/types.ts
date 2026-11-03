type AmountEditingRef = {
    clearSelection: () => void;
    updateNumber: (newNumber: string) => void;
    getNumber: () => string;
};

type AmountEditingKeyPressEvent = {
    nativeEvent: {
        key: string;
        ctrlKey?: boolean;
    };
};

type AmountEditingSelection = {
    start: number;
    end: number;
};

export type {AmountEditingKeyPressEvent, AmountEditingRef, AmountEditingSelection};
