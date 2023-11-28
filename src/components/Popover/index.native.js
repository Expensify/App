import React from 'react';
import _ from 'underscore';
import Modal from '@components/Modal';
import {windowDimensionsPropTypes} from '@components/withWindowDimensions';
import CONST from '@src/CONST';
import {defaultProps, propTypes as popoverPropTypes} from './popoverPropTypes';

const propTypes = {
    ..._.omit(popoverPropTypes, _.keys(windowDimensionsPropTypes)),
};

/*
 * This is a convenience wrapper around the Modal component for a responsive Popover.
 * On small screen widths, it uses BottomDocked modal type, and a Popover type on wide screen widths.
 */
function Popover(props) {
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
}

Popover.propTypes = propTypes;
Popover.defaultProps = defaultProps;
Popover.displayName = 'Popover';

export default Popover;
