import {ReactNode, RefObject} from 'react';
import {View} from 'react-native';

type PopoverContextProps = {
    children: ReactNode;
};

type PopoverContextValue = {
    onOpen?: (popoverParams: AnchorRef) => void;
    popover?: AnchorRef | Record<string, never> | null;
    close: (anchorRef?: RefObject<View | HTMLElement>) => void;
    isOpen: boolean;
};

type AnchorRef = {
    ref: RefObject<View | HTMLElement>;
    close: (anchorRef?: RefObject<View | HTMLElement>) => void;
    anchorRef: RefObject<View | HTMLElement>;
    onOpenCallback?: () => void;
    onCloseCallback?: () => void;
};

export type {PopoverContextProps, PopoverContextValue, AnchorRef};
