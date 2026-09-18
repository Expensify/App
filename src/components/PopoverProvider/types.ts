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

    /**
     * Whether scrolling the page dismisses this popover. It is the right default for one that cannot follow its
     * anchor, but false suits a popover that tracks the anchor itself, or one whose anchor is still being edited.
     * @default true
     */
    shouldCloseOnWheel?: boolean;
};

export type {PopoverContextProps, AnchorRef};
