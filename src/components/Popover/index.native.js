import _ from 'underscore';
import React from 'react';
import {propTypes, defaultProps} from './popoverPropTypes';
import CONST from '../../CONST';
import Modal from '../Modal';
import withWindowDimensions from '../withWindowDimensions';

/*
 * This is a convenience wrapper around the Modal component for a responsive Popover.
 * On small screen widths, it uses BottomDocked modal type, and a Popover type on wide screen widths.
 */
const Popover = (props) => {
    const propsWithoutAnimation = _.omit(props, ['animationIn', 'animationOut', 'popoverAnchorPosition', 'disableAnimation']);
    return (
        <Modal
            type={!props.isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.POPOVER : CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED}
            popoverAnchorPosition={!props.isSmallScreenWidth ? props.anchorPosition : undefined}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...propsWithoutAnimation}
            animationInTiming={props.disableAnimation && !props.isSmallScreenWidth ? 1 : props.animationInTiming}
            animationOutTiming={props.disableAnimation && !props.isSmallScreenWidth ? 1 : props.animationOutTiming}

            // Mobile will always has fullscreen menu
            // eslint-disable-next-line react/jsx-props-no-multi-spaces
            fullscreen
        />
    );
};

Popover.propTypes = propTypes;
Popover.defaultProps = defaultProps;
Popover.displayName = 'Popover';

export default withWindowDimensions(Popover);
