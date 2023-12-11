import {ReactNode, RefObject} from 'react';
import {View} from 'react-native';
import BaseModalProps, {PopoverAnchorPosition} from '@components/Modal/types';
import {WindowDimensionsProps} from '@components/withWindowDimensions/types';

type PopoverDimensions = {
    width: number;
    height: number;
};

type PopoverProps = BaseModalProps & {
    /** The anchor position of the popover */
    anchorPosition?: PopoverAnchorPosition;

    /** The anchor ref of the popover */
    anchorRef: RefObject<View>;

    /** Whether disable the animations */
    disableAnimation?: boolean;

    /** Whether we don't want to show overlay */
    withoutOverlay: boolean;

    /** The dimensions of the popover */
    popoverDimensions?: PopoverDimensions;

    /** The ref of the popover */
    withoutOverlayRef?: RefObject<View>;

    /** Whether we want to show the popover on the right side of the screen */
    fromSidebarMediumScreen?: boolean;

    /** The popover children */
    children: ReactNode;
};

type PopoverWithWindowDimensionsProps = PopoverProps & WindowDimensionsProps;

export type {PopoverProps, PopoverWithWindowDimensionsProps};
