import React from 'react';
import {propTypes, defaultProps} from './PopoverPropTypes';
import CONST from '../../CONST';
import Modal from '../Modal';
import withWindowDimensions from '../withWindowDimensions';

/*
 * This is a convenience wrapper around the Modal component for a responsive Popover.
 * On small screen widths, it uses BottomDocked modal type, and a Popover type on wide screen widths.
 */
const Popover = props => (
    <Modal
        type={props.isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.POPOVER}
        popoverAnchorPosition={props.anchorPosition}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        animationIn={props.isSmallScreenWidth ? undefined : props.animationIn}
        animationOut={props.isSmallScreenWidth ? undefined : props.animationOut}
    />
);

Popover.propTypes = propTypes;
Popover.defaultProps = defaultProps;
Popover.displayName = 'Popover';

export default withWindowDimensions(Popover);
