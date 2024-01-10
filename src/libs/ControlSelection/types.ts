type SelectionElement<T> = T & {onselectstart: () => boolean};

type ControlSelectionModule = {
    block: () => void;
    unblock: () => void;
    blockElement: <T>(element?: SelectionElement<T> | null) => void;
    unblockElement: <T>(element?: SelectionElement<T> | null) => void;
};

export type {ControlSelectionModule, SelectionElement};
