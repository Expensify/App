import React from 'react';
import Modal from '@components/Modal';
import CONST from '@src/CONST';
import {PopoverProps} from './types';

/*
 * This is a convenience wrapper around the Modal component for a responsive Popover.
 * On small screen widths, it uses BottomDocked modal type, and a Popover type on wide screen widths.
 */
function Popover(props: PopoverProps) {
    const {animationIn, animationOut, popoverAnchorPosition, disableAnimation, ...propsWithoutAnimation} = props;
    const {anchorPosition = {}, fromSidebarMediumScreen} = propsWithoutAnimation;
    return (
        <Modal
            type={fromSidebarMediumScreen ? CONST.MODAL.MODAL_TYPE.POPOVER : CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED}
            popoverAnchorPosition={fromSidebarMediumScreen ? anchorPosition : undefined}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...propsWithoutAnimation}
            // Mobile will always has fullscreen menu
            // eslint-disable-next-line react/jsx-props-no-multi-spaces
            fullscreen
            // Added those props because TS is complaining about them and those values are default based on documentation https://github.com/react-native-modal/react-native-modal#available-props
            animationIn="slideInUp"
            animationOut="slideOutDown"
        />
    );
}

Popover.displayName = 'Popover';

export default Popover;
