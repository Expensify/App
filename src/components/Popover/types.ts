import BaseModalProps, {PopoverAnchorPosition} from '@components/Modal/types';
import {WindowDimensionsProps} from '@components/withWindowDimensions/types';

type AnchorAlignment = {horizontal: string; vertical: string};

type PopoverDimensions = {
    width: number;
    height: number;
};

type PopoverProps = {
    /** The anchor position of the popover */
    anchorPosition?: PopoverAnchorPosition;

    /** The anchor alignment of the popover */
    anchorAlignment: AnchorAlignment;

    /** The anchor ref of the popover */
    anchorRef: React.RefObject<HTMLElement>;

    /** Whether disable the animations */
    disableAnimation: boolean;

    /** Whether we don't want to show overlay */
    withoutOverlay: boolean;

    /** The dimensions of the popover */
    popoverDimensions?: PopoverDimensions;

    /** The ref of the popover */
    withoutOverlayRef?: React.RefObject<HTMLElement>;

    /** Whether we want to show the popover on the right side of the screen */
    fromSidebarMediumScreen?: boolean;

    /** The popover children */
    children: React.ReactNode;
} & BaseModalProps;

type PopoverWithWindowDimensionsProps = PopoverProps & WindowDimensionsProps;

export type {PopoverProps, PopoverWithWindowDimensionsProps};
