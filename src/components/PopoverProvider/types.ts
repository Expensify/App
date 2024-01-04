import type {ReactNode, RefObject} from 'react';
import type {View} from 'react-native';

type PopoverContextProps = {
    children: ReactNode;
};

type PopoverContextValue = {
    onOpen?: (popoverParams: AnchorRef) => void;
    popover?: AnchorRef | Record<string, never> | null;
    close: (anchorRef?: RefObject<View | HTMLDivElement>) => void;
    isOpen: boolean;
};

type AnchorRef = {
    ref: RefObject<View | HTMLDivElement>;
    close: (anchorRef?: RefObject<View | HTMLDivElement>) => void;
    anchorRef: RefObject<View | HTMLDivElement>;
    onOpenCallback?: () => void;
    onCloseCallback?: () => void;
};

export type {PopoverContextProps, PopoverContextValue, AnchorRef};
