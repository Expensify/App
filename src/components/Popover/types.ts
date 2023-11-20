import BaseModalProps, {PopoverAnchorPosition} from '@components/Modal/types';
import {WindowDimensionsProps} from '@components/withWindowDimensions/types';

type PopoverProps = {
    anchorPosition: PopoverAnchorPosition;
    anchorAlignment: {horizontal: string; vertical: string};
    anchorRef: React.RefObject<HTMLElement>;
    disableAnimation: boolean;
    withoutOverlay: boolean;
    popoverDimensions?: {
        width: number;
        height: number;
    };
    withoutOverlayRef?: React.RefObject<HTMLElement>;
    fromSidebarMediumScreen?: boolean;
    children: React.ReactNode;
} & BaseModalProps;

type PopoverPropsWithWindowDimensions = PopoverProps & WindowDimensionsProps;

export type {PopoverProps, PopoverPropsWithWindowDimensions};
