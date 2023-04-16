import React from 'react';
import {createPortal} from 'react-dom';
import {propTypes, defaultProps} from './popoverPropTypes';
import CONST from '../../CONST';
import Modal from '../Modal';
import withWindowDimensions from '../withWindowDimensions';

/*
 * This is a convenience wrapper around the Modal component for a responsive Popover.
 * On small screen widths, it uses BottomDocked modal type, and a Popover type on wide screen widths.
 */
const Popover = (props) => {
    if (!props.isSmallScreenWidth) {
        return createPortal(
            <Modal
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                fullscreen={false}
                type={CONST.MODAL.MODAL_TYPE.POPOVER}
                popoverAnchorPosition={props.anchorPosition}
                animationInTiming={props.disableAnimation ? 1 : props.animationInTiming}
                animationOutTiming={props.disableAnimation ? 1 : props.animationOutTiming}
                shouldCloseOnOutsideClick
            />,
            document.body,
        );
    }
    return (
        <Modal
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            fullscreen
            type={CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED}
            animationInTiming={props.disableAnimation && props.animationInTiming}
            animationOutTiming={props.disableAnimation && props.animationOutTiming}
        />
    );
};

Popover.propTypes = propTypes;
Popover.defaultProps = defaultProps;
Popover.displayName = 'Popover';

export default withWindowDimensions(Popover);
