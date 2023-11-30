type PopoverContextProps = {
    children: React.ReactNode;
};

type PopoverContextValue = {
    onOpen?: (popoverParams: AnchorRef) => void;
    popover?: AnchorRef | Record<string, never> | null;
    close: (anchorRef?: React.RefObject<HTMLElement>) => void;
    isOpen: boolean;
};

type AnchorRef = {
    ref: React.RefObject<HTMLElement>;
    close: (anchorRef?: React.RefObject<HTMLElement>) => void;
    anchorRef: React.RefObject<HTMLElement>;
    onOpenCallback?: () => void;
    onCloseCallback?: () => void;
};

export type {PopoverContextProps, PopoverContextValue, AnchorRef};
