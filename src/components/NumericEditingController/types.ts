type NumericEditingRef = {
    clearSelection: () => void;
    updateNumber: (newNumber: string) => void;
    getNumber: () => string;
};

type NumericEditingKeyPressEvent = {
    nativeEvent: {
        key: string;
        ctrlKey?: boolean;
    };
};

type NumericEditingSelection = {
    start: number;
    end: number;
};

export type {NumericEditingKeyPressEvent, NumericEditingRef, NumericEditingSelection};
