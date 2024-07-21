import type {ReactNode, RefObject} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {Text, View} from 'react-native';

type PopoverContextProps = {
    children: ReactNode;
};

type PopoverContextValue = {
    onOpen?: (popoverParams: AnchorRef) => void;
    popover?: AnchorRef | null;
    close: (anchorRef?: RefObject<View | HTMLDivElement | Text>) => void;
    isOpen: boolean;
};

type AnchorRef = {
    ref: RefObject<View | HTMLDivElement | Text>;
    close: (anchorRef?: RefObject<View | HTMLDivElement | Text>) => void;
    anchorRef: RefObject<View | HTMLDivElement | Text>;
};

export type {PopoverContextProps, PopoverContextValue, AnchorRef};
