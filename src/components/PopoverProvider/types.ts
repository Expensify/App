import type {ComponentRef, ReactNode, RefObject} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {Text, TextInput, View} from 'react-native';

type AnchorType = ComponentRef<typeof View> | HTMLDivElement | ComponentRef<typeof Text> | null;

type PopoverContextProps = {
    children: ReactNode;
};

type AnchorRef = {
    ref: RefObject<AnchorType>;
    close: (anchorRef?: RefObject<AnchorType | ComponentRef<typeof TextInput>>) => void;
    anchorRef: RefObject<AnchorType | ComponentRef<typeof TextInput>>;
    extraAnchorRefs?: Array<RefObject<AnchorType>>;
};

export type {PopoverContextProps, AnchorRef};
