import type {ReactNode, RefObject} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {Text, View} from 'react-native';

type AnchorType = View | HTMLDivElement | Text | null;

type PopoverContextProps = {
    children: ReactNode;
};

type AnchorRef = {
    ref: RefObject<AnchorType>;
    close: (anchorRef?: RefObject<AnchorType>) => void;
    anchorRef: RefObject<AnchorType>;
    extraAnchorRefs?: Array<RefObject<AnchorType>>;
};

export type {PopoverContextProps, AnchorRef};
