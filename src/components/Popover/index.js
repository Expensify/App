import React from 'react';
import PropTypes from 'prop-types';
import {createPortal} from 'react-dom';
import {withOnyx} from 'react-native-onyx';
import {propTypes as popoverPropTypes, defaultProps as popoverDefaultProps} from './popoverPropTypes';
import CONST from '../../CONST';
import Modal from '../Modal';
import withWindowDimensions from '../withWindowDimensions';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';

const propTypes = {
    isShortcutsModalOpen: PropTypes.bool,
    ...popoverPropTypes
};

const defaultProps = {
    isShortcutsModalOpen: false,
    ...popoverDefaultProps
};

/*
 * This is a convenience wrapper around the Modal component for a responsive Popover.
 * On small screen widths, it uses BottomDocked modal type, and a Popover type on wide screen widths.
 */
const Popover = (props) => {
    if (!props.fullscreen && !props.isSmallScreenWidth) {
        return createPortal(
            <Modal
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                isVisible={props.isVisible && !props.isShortcutsModalOpen}
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
            isVisible={props.isVisible && !props.isShortcutsModalOpen}
            type={props.isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.POPOVER}
            popoverAnchorPosition={props.isSmallScreenWidth ? undefined : props.anchorPosition}
            fullscreen={props.isSmallScreenWidth ? true : props.fullscreen}
            animationInTiming={props.disableAnimation && !props.isSmallScreenWidth ? 1 : props.animationInTiming}
            animationOutTiming={props.disableAnimation && !props.isSmallScreenWidth ? 1 : props.animationOutTiming}
        />
    );
};

Popover.propTypes = propTypes;
Popover.defaultProps = defaultProps;

export default compose(
    withWindowDimensions,
    withOnyx({
        isShortcutsModalOpen: {key: ONYXKEYS.IS_SHORTCUTS_MODAL_OPEN},
    }),
)(Popover);
