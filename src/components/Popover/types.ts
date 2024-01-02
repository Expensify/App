import {RefObject} from 'react';
import {View} from 'react-native';
import BaseModalProps, {PopoverAnchorPosition} from '@components/Modal/types';
import {WindowDimensionsProps} from '@components/withWindowDimensions/types';
import ChildrenProps from '@src/types/utils/ChildrenProps';

type AnchorAlignment = {horizontal: string; vertical: string};

type PopoverDimensions = {
    width: number;
    height: number;
};

type PopoverProps = BaseModalProps &
    ChildrenProps & {
        /** The anchor position of the popover */
        anchorPosition?: PopoverAnchorPosition;

        /** The anchor alignment of the popover */
        anchorAlignment?: AnchorAlignment;

        /** The anchor ref of the popover */
        anchorRef: RefObject<View | HTMLDivElement>;

        /** Whether disable the animations */
        disableAnimation?: boolean;

        /** Whether we don't want to show overlay */
        withoutOverlay: boolean;

        /** The dimensions of the popover */
        popoverDimensions?: PopoverDimensions;

        /** The ref of the popover */
        withoutOverlayRef?: RefObject<View | HTMLDivElement>;

        /** Whether we want to show the popover on the right side of the screen */
        fromSidebarMediumScreen?: boolean;
    };

type PopoverWithWindowDimensionsProps = PopoverProps & WindowDimensionsProps;

export type {PopoverProps, PopoverWithWindowDimensionsProps};
