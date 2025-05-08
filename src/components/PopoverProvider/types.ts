import type {ReactNode, RefObject} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {Text, View} from 'react-native';

type PopoverContextProps = {
    children: ReactNode;
};

type PopoverContextValue = {
    onOpen?: (popoverParams: AnchorRef) => void;
    popover?: AnchorRef | null;
    popoverAnchor?: AnchorRef['anchorRef']['current'] | null;
    close: (anchorRef?: RefObject<View | HTMLDivElement | Text | null>) => void;
    isOpen: boolean;
    setActivePopoverExtraAnchorRef: (ref?: RefObject<View | HTMLDivElement | Text | null>) => void;
};

type AnchorRef = {
    ref: RefObject<View | HTMLDivElement | Text | null>;
    close: (anchorRef?: RefObject<View | HTMLDivElement | Text>) => void;
    anchorRef: RefObject<View | HTMLDivElement | Text | null>;
    extraAnchorRefs?: Array<RefObject<View | HTMLDivElement | Text | null>>;
};

export type {PopoverContextProps, PopoverContextValue, AnchorRef};
