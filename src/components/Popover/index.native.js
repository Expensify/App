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
        type={CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}

        // Mobile will always has fullscreen menu
        // eslint-disable-next-line react/jsx-props-no-multi-spaces
        fullscreen
    />
);

Popover.propTypes = propTypes;
Popover.defaultProps = defaultProps;
Popover.displayName = 'Popover';

export default withWindowDimensions(Popover);
