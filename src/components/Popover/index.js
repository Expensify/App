import React from 'react';
import {createPortal} from 'react-dom';
import {propTypes, defaultProps} from './popoverPropTypes';
import CONST from '../../CONST';
import Modal from '../Modal';
import withWindowDimensions from '../withWindowDimensions';
import PopoverWithoutOverlay from '../PopoverWithoutOverlay';

/*
 * This is a convenience wrapper around the Modal component for a responsive Popover.
 * On small screen widths, it uses BottomDocked modal type, and a Popover type on wide screen widths.
 */
function Popover(props) {
    if (!props.fullscreen && !props.isSmallScreenWidth) {
        return createPortal(
            <Modal
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                type={CONST.MODAL.MODAL_TYPE.POPOVER}
                popoverAnchorPosition={props.anchorPosition}
                animationInTiming={props.disableAnimation ? 1 : props.animationInTiming}
                animationOutTiming={props.disableAnimation ? 1 : props.animationOutTiming}
                shouldCloseOnOutsideClick
                onLayout={props.onLayout}
            />,
            document.body,
        );
    }

    if (props.withoutOverlay && !props.isSmallScreenWidth) {
        // eslint-disable-next-line react/jsx-props-no-spreading
        return createPortal(<PopoverWithoutOverlay {...props} />, document.body);
    }

    return (
        <Modal
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            type={props.isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.POPOVER}
            popoverAnchorPosition={props.isSmallScreenWidth ? undefined : props.anchorPosition}
            fullscreen={props.isSmallScreenWidth ? true : props.fullscreen}
            animationInTiming={props.disableAnimation && !props.isSmallScreenWidth ? 1 : props.animationInTiming}
            animationOutTiming={props.disableAnimation && !props.isSmallScreenWidth ? 1 : props.animationOutTiming}
            onLayout={props.onLayout}
        />
    );
}

Popover.propTypes = propTypes;
Popover.defaultProps = defaultProps;
Popover.displayName = 'Popover';

export default withWindowDimensions(Popover);
