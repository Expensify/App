import React from 'react';
import PropTypes from 'prop-types';
import {View, useWindowDimensions} from 'react-native';
import ReactNativeModal from 'react-native-modal';
import {SafeAreaInsetsContext} from 'react-native-safe-area-context';
import CustomStatusBar from './CustomStatusBar';
import styles, {getSafeAreaPadding} from '../styles/styles';
import themeColors from '../styles/themes/default';
import getModalStyles from '../styles/getModalStyles';
import CONST from '../CONST';

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
        CONST.MODAL.MODAL_TYPE.CREATE_MENU,
    ]),
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
        needsSafeAreaPadding,
        hideBackdrop,
    } = getModalStyles(props.type, useWindowDimensions());

    return (
        <ReactNativeModal
            onBackdropPress={props.onClose}
            onBackButtonPress={props.onClose}
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
export default Modal;
