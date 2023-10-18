type PopoverContextProps = {
    children: React.ReactNode;
};

type PopoverContextValue = {
    onOpen?: (popoverParams: AnchorRef) => void;
    popover?: AnchorRef | null;
    close: (anchorRef?: React.RefObject<HTMLElement>) => void;
    isOpen: boolean;
};

type AnchorRef = {
    ref: React.RefObject<HTMLElement>;
    close: (anchorRef?: React.RefObject<HTMLElement>) => void;
    anchorRef?: React.RefObject<HTMLElement>;
};

export type {PopoverContextProps, PopoverContextValue, AnchorRef};
