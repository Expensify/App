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
    ...popoverPropTypes,
};

const defaultProps = {
    isShortcutsModalOpen: false,
    ...popoverDefaultProps,
};

/*
 * This is a convenience wrapper around the Modal component for a responsive Popover.
 * On small screen widths, it uses BottomDocked modal type, and a Popover type on wide screen widths.
 */

class Popover extends React.Component {
    componentDidUpdate() {
        if (!this.props.isShortcutsModalOpen || !this.props.isVisible) {
            return;
        }

        // There are modals that can show up on top of these pop-overs, for example, the keyboard shortcut menu,
        // if that happens, close the pop-over as if we were clicking outside.
        this.props.onClose();
    }

    render() {
        if (!this.props.fullscreen && !this.props.isSmallScreenWidth) {
            return createPortal(
                <Modal
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...this.props}
                    isVisible={this.props.isVisible && !this.props.isShortcutsModalOpen}
                    type={CONST.MODAL.MODAL_TYPE.POPOVER}
                    popoverAnchorPosition={this.props.anchorPosition}
                    animationInTiming={this.props.disableAnimation ? 1 : this.props.animationInTiming}
                    animationOutTiming={this.props.disableAnimation ? 1 : this.props.animationOutTiming}
                    shouldCloseOnOutsideClick
                />,
                document.body,
            );
        }
        return (
            <Modal
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...this.props}
                isVisible={this.props.isVisible && !this.props.isShortcutsModalOpen}
                type={this.props.isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.POPOVER}
                popoverAnchorPosition={this.props.isSmallScreenWidth ? undefined : this.props.anchorPosition}
                fullscreen={this.props.isSmallScreenWidth ? true : this.props.fullscreen}
                animationInTiming={this.props.disableAnimation && !this.props.isSmallScreenWidth ? 1 : this.props.animationInTiming}
                animationOutTiming={this.props.disableAnimation && !this.props.isSmallScreenWidth ? 1 : this.props.animationOutTiming}
            />
        );
    }
}

Popover.propTypes = propTypes;
Popover.defaultProps = defaultProps;

export default compose(
    withWindowDimensions,
    withOnyx({
        isShortcutsModalOpen: {key: ONYXKEYS.IS_SHORTCUTS_MODAL_OPEN},
    }),
)(Popover);
