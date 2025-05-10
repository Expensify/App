import type {ReactNode, RefObject} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {Text, View} from 'react-native';

type AnchorType = View | HTMLDivElement | Text | null;

type PopoverContextProps = {
    children: ReactNode;
};

type PopoverContextValue = {
    onOpen?: (popoverParams: AnchorRef) => void;
    popover?: AnchorRef | null;
    popoverAnchor?: AnchorRef['anchorRef']['current'] | null;
    close: (anchorRef?: RefObject<AnchorType>) => void;
    isOpen: boolean;
    setActivePopoverExtraAnchorRef: (ref?: RefObject<AnchorType>) => void;
};

type AnchorRef = {
    ref: RefObject<AnchorType>;
    close: (anchorRef?: RefObject<AnchorType>) => void;
    anchorRef: RefObject<AnchorType>;
    extraAnchorRefs?: Array<RefObject<AnchorType>>;
};

export type {PopoverContextProps, PopoverContextValue, AnchorRef};
