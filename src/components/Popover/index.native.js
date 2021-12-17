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
const Popover = (props) => {
    const propsWithoutAnimation = _.omit(props, ['animationIn', 'animationOut', 'popoverAnchorPosition', 'disableAnimation']);
    return (
        <Modal
            type={props.fromSidebarMediumScreen ? CONST.MODAL.MODAL_TYPE.POPOVER : CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED}
            popoverAnchorPosition={props.fromSidebarMediumScreen ? props.anchorPosition : undefined}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...propsWithoutAnimation}

            // Mobile will always has fullscreen menu
            // eslint-disable-next-line react/jsx-props-no-multi-spaces
            fullscreen
        />
    );
};

Popover.propTypes = propTypes;
Popover.defaultProps = defaultProps;
Popover.displayName = 'Popover';

export default Popover;
