import BaseModalProps from '@components/Modal/types';
import {WindowDimensionsProps} from '@components/withWindowDimensions/types';

type AnchorPosition = {
    top?: number;
    left?: number;
    bottom?: number;
    right?: number;
};

type PopoverProps = {
    anchorPosition: AnchorPosition;
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

export type {PopoverProps, PopoverPropsWithWindowDimensions, AnchorPosition};
