import _ from 'underscore';
import React from 'react';
import {propTypes as popoverPropTypes, defaultProps} from './popoverPropTypes';
import CONST from '../../CONST';
import Modal from '../Modal';
import {windowDimensionsPropTypes} from '../withWindowDimensions';

const propTypes = {
    ...(_.omit(popoverPropTypes, _.keys(windowDimensionsPropTypes))),
};

/*
 * This is a convenience wrapper around the Modal component for a responsive Popover.
 * On small screen widths, it uses BottomDocked modal type, and a Popover type on wide screen widths.
 */
const Popover = props => (
    <Modal
        type={props.fromSidebarMediumScreen ? CONST.MODAL.MODAL_TYPE.POPOVER : CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED}
        popoverAnchorPosition={props.isSmallScreenWidth ? undefined : props.anchorPosition}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        fullscreen={props.isSmallScreenWidth ? true : props.fullscreen}
        animationIn={props.isSmallScreenWidth ? undefined : props.animationIn}
        animationOut={props.isSmallScreenWidth ? undefined : props.animationOut}
    />
);

Popover.propTypes = propTypes;
Popover.defaultProps = defaultProps;
Popover.displayName = 'Popover';

export default Popover;
