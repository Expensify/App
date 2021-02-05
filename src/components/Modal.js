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

    // Callback method fired when the modal is hidden
    onModalHide: PropTypes.func,

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
    onModalHide: () => {},
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
        shouldAddTopSafeAreaPadding,
        shouldAddBottomSafeAreaPadding,
        hideBackdrop,
    } = getModalStyles(props.type, {
        windowWidth: props.windowWidth,
        windowHeight: props.windowHeight,
        isSmallScreenWidth: props.isSmallScreenWidth,
    });
    return (
        <ReactNativeModal
            onBackdropPress={props.onClose}
            onBackButtonPress={props.onClose}
            onModalShow={subscribeToKeyEvents}
            onModalHide={() => {
                unsubscribeFromKeyEvents();
                props.onModalHide();
            }}
            onSwipeComplete={props.onClose}
            swipeDirection={swipeDirection}
            isVisible={props.isVisible}
            backdropColor={themeColors.modalBackdrop}
            backdropOpacity={hideBackdrop ? 0 : 0.5}
            backdropTransitionOutTiming={0}
            style={modalStyle}
            deviceHeight={props.windowHeight}
            deviceWidth={props.windowWidth}
            animationIn={animationIn}
            animationOut={animationOut}
        >
            <CustomStatusBar />
            <SafeAreaInsetsContext.Consumer>
                {(insets) => {
                    const {
                        paddingTop: safeAreaPaddingTop,
                        paddingBottom: safeAreaPaddingBottom,
                    } = getSafeAreaPadding(insets);

                    return (
                        <View
                            style={{
                                ...styles.defaultModalContainer,
                                ...modalContainerStyle,
                                paddingTop: shouldAddTopSafeAreaPadding
                                    ? (modalContainerStyle.paddingTop || 0) + safeAreaPaddingTop
                                    : modalContainerStyle.paddingTop || 0,
                                paddingBottom: shouldAddBottomSafeAreaPadding
                                    ? (modalContainerStyle.paddingBottom || 0) + safeAreaPaddingBottom
                                    : modalContainerStyle.paddingBottom || 0,
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
