import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import CONST from '../CONST';
import {propTypes as modalPropTypes, defaultProps as defaultModalProps} from './Modal/ModalPropTypes';
import Modal from './Modal';
import withWindowDimensions from './withWindowDimensions';

const propTypes = {
    ...(_.omit(modalPropTypes, 'type', 'popoverAnchorPosition')),

    // The anchor position of the popover
    anchorPosition: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }).isRequired,
};

const defaultProps = {
    ...(_.omit(defaultModalProps, 'type', 'popoverAnchorPosition')),
};

/*
 * This is a convenience wrapper around the Modal component for a responsive Popover.
 * On small screen widths, it uses BottomDocked modal type, and a Popover on wide screen widths.
 */
const Popover = props => (
    <Modal
        type={props.isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.POPOVER}
        popoverAnchorPosition={props.anchorPosition}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
    />
);

Popover.propTypes = propTypes;
Popover.defaultProps = defaultProps;
Popover.displayName = 'Popover';

export default withWindowDimensions(Popover);
