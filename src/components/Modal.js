import React from 'react';
import PropTypes from 'prop-types';
import {View, useWindowDimensions} from 'react-native';
import ReactNativeModal from 'react-native-modal';
import {SafeAreaInsetsContext} from 'react-native-safe-area-context';
import CustomStatusBar from './CustomStatusBar';
import {getSafeAreaPadding, colors} from '../styles/StyleSheet';

const WIDTH_BREAKPOINT = 1000;

const propTypes = {
    // Callback method fired when the user has taken an action that
    // should close the modal
    onClose: PropTypes.func.isRequired,

    // State that determines whether to display the modal or not
    isVisible: PropTypes.bool.isRequired,

    // Modal contents
    children: PropTypes.node.isRequired,

    // Style of modal to display
    type: PropTypes.string,
};

const defaultProps = {
    type: '',
};

const Modal = props => {
    const windowDimensions = useWindowDimensions();
    const isSmallScreen = windowDimensions.width < WIDTH_BREAKPOINT;

    let modalStyle;
    let modalContainerStyle;
    let swipeDirection;
    let animationIn;
    let animationOut;
    let needsSafeAreaPadding = false;

    switch (props.type) {
        /**
         * A centered modal is one that has a visible backdrop
         * and can be dismissed by clicking outside of the modal.
         * This modal should take up the entire visible area when
         * viewed on a smaller device (e.g. mobile or mobile web).
         **/
        case 'centered':
            const marginVertical = windowDimensions.height * 0.025;
            modalStyle = {
                alignItems: 'center',
            };
            modalContainerStyle = {
                // Shadow Styles
                shadowColor: colors.black,
                shadowOffset: {
                    width: 0,
                    height: 0,
                },
                shadowOpacity: 0.3,
                shadowRadius: 20,

                flex: 1,
                marginTop: isSmallScreen ? 0 : marginVertical,
                marginBottom: isSmallScreen ? 0 : marginVertical,
                borderRadius: isSmallScreen ? 0 : 20,
                overflow: 'hidden',
                width: isSmallScreen ? '100%' : '95%',
            };

            swipeDirection = undefined;
            animationIn = 'fadeIn';
            animationOut = 'fadeOut';
            needsSafeAreaPadding = true;
            break;
        default:
            modalStyle = {};
            modalContainerStyle = {};
            swipeDirection = 'down';
            animationIn = 'slideInUp';
            animationOut = 'slideOutDown';
    }

    return (
        <ReactNativeModal
            onBackdropPress={props.onClose}
            onBackButtonPress={props.onClose}
            onSwipeComplete={props.onClose}
            swipeDirection={swipeDirection}
            isVisible={props.isVisible}
            backdropOpacity={0.3}
            backdropTransitionOutTiming={0}
            style={{
                margin: 0,
                ...modalStyle,
            }}
            animationIn={animationIn}
            animationOut={animationOut}
        >
            <CustomStatusBar />
            <SafeAreaInsetsContext.Consumer>
                {insets => {
                    const {paddingTop, paddingBottom} = getSafeAreaPadding(insets);
                    return (
                        <View
                            style={{
                                paddingBottom,
                                ...modalContainerStyle,
                                paddingTop: needsSafeAreaPadding ? paddingTop : 20,
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
