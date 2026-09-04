import Modal from '@components/Modal';

import CONST from '@src/CONST';

import React from 'react';

import type PopoverProps from './types';

/*
 * This is a convenience wrapper around the Modal component for a responsive Popover.
 * On small screen widths, it uses BottomDocked modal type, and a Popover type on wide screen widths.
 */
function Popover({animationIn, animationOut, popoverAnchorPosition, disableAnimation, anchorPosition = {}, fromSidebarMediumScreen, shouldUseInsetBottomDocked, ...propsWithoutAnimation}: PopoverProps) {
    const bottomDockedType = shouldUseInsetBottomDocked ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED_INSET : CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED;
    return (
        <Modal
            type={fromSidebarMediumScreen ? CONST.MODAL.MODAL_TYPE.POPOVER : bottomDockedType}
            popoverAnchorPosition={fromSidebarMediumScreen ? anchorPosition : undefined}
            {...propsWithoutAnimation}
            // Mobile will always has fullscreen menu
            fullscreen
            animationIn="slideInUp"
            animationOut="slideOutDown"
        />
    );
}

export default Popover;
