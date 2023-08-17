import React, {useEffect} from 'react';
import {View} from 'react-native';
import ReactNativeModal from 'react-native-modal';
import {SafeAreaInsetsContext} from 'react-native-safe-area-context';
import styles from '../../styles/styles';
import * as StyleUtils from '../../styles/StyleUtils';
import themeColors from '../../styles/themes/default';
import {propTypes, defaultProps} from './modalPropTypes';
import * as Modal from '../../libs/actions/Modal';
import getModalStyles from '../../styles/getModalStyles';
import variables from '../../styles/variables';

function BaseModal(props) {
    /**
     * Hides modal
     * @param {Boolean} [callHideCallback=true] Should we call the onModalHide callback
     */
    const hideModal = (callHideCallback = true) => {
        if (props.shouldSetModalVisibility) {
            Modal.setModalVisibility(false);
        }
        if (callHideCallback) {
            props.onModalHide();
        }
        Modal.onModalDidClose();
    };

    // eslint-disable-next-line arrow-body-style
    useEffect(() => {
        return () => {
            if (hideModal && props.isVisible) hideModal(props.isVisible);
            Modal.willAlertModalBecomeVisible(false);
            Modal.setCloseModal(null);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        Modal.willAlertModalBecomeVisible(props.isVisible);
        Modal.setCloseModal(props.isVisible ? props.onClose : null);
    }, [props.isVisible, props.onClose]);

    const {
        modalStyle,
        modalContainerStyle,
        swipeDirection,
        animationIn,
        animationOut,
        shouldAddTopSafeAreaMargin,
        shouldAddBottomSafeAreaMargin,
        shouldAddTopSafeAreaPadding,
        shouldAddBottomSafeAreaPadding,
        hideBackdrop,
    } = getModalStyles(
        props.type,
        {
            windowWidth: props.windowWidth,
            windowHeight: props.windowHeight,
            isSmallScreenWidth: props.isSmallScreenWidth,
        },
        props.popoverAnchorPosition,
        props.innerContainerStyle,
        props.outerStyle,
    );

    return (
        <ReactNativeModal
            onBackdropPress={(e) => {
                if (e && e.key === 'Enter') {
                    return;
                }
                props.onClose();
            }}
            // Note: Escape key on web/desktop will trigger onBackButtonPress callback
            // eslint-disable-next-line react/jsx-props-no-multi-spaces
            onBackButtonPress={props.onClose}
            onModalShow={() => {
                if (props.shouldSetModalVisibility) {
                    Modal.setModalVisibility(true);
                }
                props.onModalShow();
            }}
            propagateSwipe={props.propagateSwipe}
            onModalHide={hideModal}
            onSwipeComplete={props.onClose}
            swipeDirection={swipeDirection}
            isVisible={props.isVisible}
            backdropColor={themeColors.overlay}
            backdropOpacity={hideBackdrop ? 0 : variables.overlayOpacity}
            backdropTransitionOutTiming={0}
            hasBackdrop={props.fullscreen}
            coverScreen={props.fullscreen}
            style={modalStyle}
            deviceHeight={props.windowHeight}
            deviceWidth={props.windowWidth}
            animationIn={props.animationIn || animationIn}
            animationOut={props.animationOut || animationOut}
            useNativeDriver={props.useNativeDriver}
            hideModalContentWhileAnimating={props.hideModalContentWhileAnimating}
            animationInTiming={props.animationInTiming}
            animationOutTiming={props.animationOutTiming}
            statusBarTranslucent={props.statusBarTranslucent}
            onLayout={props.onLayout}
            avoidKeyboard={props.avoidKeyboard}
        >
            <SafeAreaInsetsContext.Consumer>
                {(insets) => {
                    const {
                        paddingTop: safeAreaPaddingTop,
                        paddingBottom: safeAreaPaddingBottom,
                        paddingLeft: safeAreaPaddingLeft,
                        paddingRight: safeAreaPaddingRight,
                    } = StyleUtils.getSafeAreaPadding(insets);

                    const modalPaddingStyles = StyleUtils.getModalPaddingStyles({
                        safeAreaPaddingTop,
                        safeAreaPaddingBottom,
                        safeAreaPaddingLeft,
                        safeAreaPaddingRight,
                        shouldAddBottomSafeAreaMargin,
                        shouldAddTopSafeAreaMargin,
                        shouldAddBottomSafeAreaPadding,
                        shouldAddTopSafeAreaPadding,
                        modalContainerStyleMarginTop: modalContainerStyle.marginTop,
                        modalContainerStyleMarginBottom: modalContainerStyle.marginBottom,
                        modalContainerStylePaddingTop: modalContainerStyle.paddingTop,
                        modalContainerStylePaddingBottom: modalContainerStyle.paddingBottom,
                        insets,
                    });

                    return (
                        <View
                            style={[styles.defaultModalContainer, modalContainerStyle, modalPaddingStyles, !props.isVisible ? styles.pointerEventsNone : {}]}
                            ref={props.forwardedRef}
                            nativeID="no-drag-area"
                        >
                            {props.children}
                        </View>
                    );
                }}
            </SafeAreaInsetsContext.Consumer>
        </ReactNativeModal>
    );
}

BaseModal.propTypes = propTypes;
BaseModal.defaultProps = defaultProps;
BaseModal.displayName = 'BaseModal';
export default BaseModal;
