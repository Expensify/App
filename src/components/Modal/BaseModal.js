import React, {memo} from 'react';
import {View} from 'react-native';
import ReactNativeModal from 'react-native-modal';
import {SafeAreaInsetsContext} from 'react-native-safe-area-context';
import CustomStatusBar from '../CustomStatusBar';
import KeyboardShortcut from '../../libs/KeyboardShortcut';
import styles, {getSafeAreaPadding} from '../../styles/styles';
import themeColors from '../../styles/themes/default';
import modalPropTypes from './ModalPropTypes';
import getModalStyles from '../../styles/getModalStyles';


const defaultProps = {
    onSubmit: null,
    type: '',
    onModalHide: () => { },
};

const BaseModal = (props) => {
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
            useNativeDriver={props.useNativeDriver}
            statusBarTranslucent
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

BaseModal.propTypes = modalPropTypes;
BaseModal.defaultProps = defaultProps;
BaseModal.displayName = 'BaseModal';
export default memo(BaseModal);
