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

    // Style of modal to display
    type: PropTypes.oneOf([
        CONST.MODAL.MODAL_TYPE.CENTERED,
        CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED,
        CONST.MODAL.MODAL_TYPE.POPOVER,
    ]),

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    type: '',
};

const Modal = (props) => {
    const {
        modalStyle,
        modalContainerStyle,
        swipeDirection,
        animationIn,
        animationOut,
        shouldAddTopSafeAreaPadding,
        shouldAddBottomSafeAreaPadding,
        hideBackdrop,
    } = getModalStyles(props.type, props.windowDimensions);
    return (
        <ReactNativeModal
            onBackdropPress={props.onClose}
            onBackButtonPress={props.onClose}
            onModalShow={() => KeyboardShortcut.subscribe('Escape', props.onClose, [], true)}
            onModalHide={() => KeyboardShortcut.unsubscribe('Escape')}
            onSwipeComplete={props.onClose}
            swipeDirection={swipeDirection}
            isVisible={props.isVisible}
            backdropColor={themeColors.modalBackdrop}
            backdropOpacity={hideBackdrop ? 0 : 0.5}
            backdropTransitionOutTiming={0}
            style={modalStyle}
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
                                    ? modalContainerStyle.paddingTop + safeAreaPaddingTop
                                    : modalContainerStyle.paddingTop,
                                paddingBottom: shouldAddBottomSafeAreaPadding
                                    ? modalContainerStyle.paddingBottom + safeAreaPaddingBottom
                                    : modalContainerStyle.paddingBottom,
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
