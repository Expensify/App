import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import ReactNativeModal from 'react-native-modal';
import {SafeAreaInsetsContext} from 'react-native-safe-area-context';
import CustomStatusBar from './CustomStatusBar';
import KeyboardShortcut from '../libs/KeyboardShortcut';
import styles, {getSafeAreaPadding} from '../styles/styles';
import themeColors from '../styles/themes/default';
import getModalStyles from '../styles/getModalStyles';
import CONST from '../CONST';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';

const propTypes = {
    // Callback method fired when the user requests to close the modal
    onClose: PropTypes.func.isRequired,

    // State that determines whether to display the modal or not
    isVisible: PropTypes.bool.isRequired,

    // Modal contents
    children: PropTypes.node.isRequired,

    // Callback method fired when the user requests to submit the modal content.
    onSubmit: PropTypes.func,

    // Style of modal to display
    type: PropTypes.oneOf([
        CONST.MODAL.MODAL_TYPE.CENTERED,
        CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED,
        CONST.MODAL.MODAL_TYPE.POPOVER,
        CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED,
    ]),

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    onSubmit: null,
    type: '',
};

const Modal = (props) => {
    const subscribeToKeyEvents = () => {
        KeyboardShortcut.subscribe('Escape', props.onClose, [], true);
        KeyboardShortcut.subscribe('Enter', props.onSubmit, [], true);
    };
    const unsubscribeFromKeyEvents = () => {
        KeyboardShortcut.unsubscribe('Escape');
        KeyboardShortcut.unsubscribe('Enter');
    };
    const {
        modalStyle,
        modalContainerStyle,
        swipeDirection,
        animationIn,
        animationOut,
        needsSafeAreaPadding,
        hideBackdrop,
    } = getModalStyles(props.type, props.windowDimensions);
    return (
        <ReactNativeModal
            onBackdropPress={props.onClose}
            onBackButtonPress={props.onClose}
            onModalShow={subscribeToKeyEvents}
            onModalHide={unsubscribeFromKeyEvents}
            onSwipeComplete={props.onClose}
            swipeDirection={swipeDirection}
            isVisible={props.isVisible}
            backdropColor={themeColors.modalBackdrop}
            backdropOpacity={hideBackdrop ? 0 : 0.5}
            backdropTransitionOutTiming={0}
            style={modalStyle}
            deviceHeight={props.windowDimensions.height}
            deviceWidth={props.windowDimensions.width}
            animationIn={animationIn}
            animationOut={animationOut}
        >
            <CustomStatusBar />
            <SafeAreaInsetsContext.Consumer>
                {(insets) => {
                    const {paddingTop, paddingBottom} = getSafeAreaPadding(insets);
                    return (
                        <View
                            style={{
                                // This padding is based on the insets and could not neatly be
                                // returned by getModalStyles to avoid passing this inline.
                                paddingTop: needsSafeAreaPadding ? paddingTop : 20,

                                ...styles.defaultModalContainer,
                                paddingBottom,
                                ...modalContainerStyle,
                            }}
                        >
                            {props.children}
                        </View>
                    );
                }}
            </SafeAreaInsetsContext.Consumer>
        </ReactNativeModal>
    );
};

Modal.propTypes = propTypes;
Modal.defaultProps = defaultProps;
Modal.displayName = 'Modal';
export default withWindowDimensions(Modal);
