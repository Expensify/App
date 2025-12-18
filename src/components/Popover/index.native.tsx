import React from 'react';
import Modal from '@components/Modal';
import CONST from '@src/CONST';
import type PopoverProps from './types';

/*
 * This is a convenience wrapper around the Modal component for a responsive Popover.
 * On small screen widths, it uses BottomDocked modal type, and a Popover type on wide screen widths.
 */
function Popover({animationIn, animationOut, popoverAnchorPosition, disableAnimation, anchorPosition = {}, fromSidebarMediumScreen, ...propsWithoutAnimation}: PopoverProps) {
    return (
        <Modal
            type={fromSidebarMediumScreen ? CONST.MODAL.MODAL_TYPE.POPOVER : CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED}
            popoverAnchorPosition={fromSidebarMediumScreen ? anchorPosition : undefined}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...propsWithoutAnimation}
            // Mobile will always has fullscreen menu
            fullscreen
            animationIn="slideInUp"
            animationOut="slideOutDown"
        />
    );
}

export default Popover;
