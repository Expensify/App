import React, {PureComponent} from 'react';
import {StatusBar, View, KeyboardAvoidingView} from 'react-native';
import PropTypes from 'prop-types';
import ReactNativeModal from 'react-native-modal';
import {SafeAreaInsetsContext} from 'react-native-safe-area-context';
import styles from '../../styles/styles';
import * as StyleUtils from '../../styles/StyleUtils';
import themeColors from '../../styles/themes/default';
import {propTypes as modalPropTypes, defaultProps as modalDefaultProps} from './modalPropTypes';
import * as Modal from '../../libs/actions/Modal';
import getModalStyles from '../../styles/getModalStyles';
import variables from '../../styles/variables';

const propTypes = {
    ...modalPropTypes,

    /** The ref to the modal container */
    forwardedRef: PropTypes.func,
};

const defaultProps = {
    ...modalDefaultProps,
    forwardedRef: () => {},
};

class BaseModal extends PureComponent {
    constructor(props) {
        super(props);

        this.hideModal = this.hideModal.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.isVisible === this.props.isVisible) {
            return;
        }

        Modal.willAlertModalBecomeVisible(this.props.isVisible);
    }

    componentWillUnmount() {
        // we don't want to call the onModalHide on unmount
        this.hideModal(this.props.isVisible);
    }

    /**
     * Hides modal
     * @param {Boolean} [callHideCallback=true] Should we call the onModalHide callback
     */
    hideModal(callHideCallback = true) {
        if (this.props.shouldSetModalVisibility) {
            Modal.setModalVisibility(false);
        }
        if (callHideCallback) {
            this.props.onModalHide();
        }
    }

    render() {
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
            this.props.type,
            {
                windowWidth: this.props.windowWidth,
                windowHeight: this.props.windowHeight,
                isSmallScreenWidth: this.props.isSmallScreenWidth,
            },
            this.props.popoverAnchorPosition,
            this.props.containerStyle,
        );
        return (
            <ReactNativeModal
                onBackdropPress={(e) => {
                    if (e && e.type === 'keydown' && e.key === 'Enter') {
                        return;
                    }
                    this.props.onClose();
                }}

                // Note: Escape key on web/desktop will trigger onBackButtonPress callback
                // eslint-disable-next-line react/jsx-props-no-multi-spaces
                onBackButtonPress={this.props.onClose}
                onModalShow={() => {
                    if (this.props.shouldSetModalVisibility) {
                        Modal.setModalVisibility(true);
                    }
                    this.props.onModalShow();
                }}
                propagateSwipe={this.props.propagateSwipe}
                onModalHide={this.hideModal}
                onSwipeComplete={this.props.onClose}
                swipeDirection={swipeDirection}
                isVisible={this.props.isVisible}
                backdropColor={themeColors.overlay}
                backdropOpacity={hideBackdrop ? 0 : variables.overlayOpacity}
                backdropTransitionOutTiming={0}
                hasBackdrop={this.props.fullscreen}
                coverScreen={this.props.fullscreen}
                style={modalStyle}

                // When `statusBarTranslucent` is true on Android, the modal fully covers the status bar.
                // Since `windowHeight` doesn't include status bar height, it should be added in the `deviceHeight` calculation.
                deviceHeight={this.props.windowHeight + ((this.props.statusBarTranslucent && StatusBar.currentHeight) || 0)}
                deviceWidth={this.props.windowWidth}
                animationIn={this.props.animationIn || animationIn}
                animationOut={this.props.animationOut || animationOut}
                useNativeDriver={this.props.useNativeDriver}
                hideModalContentWhileAnimating={this.props.hideModalContentWhileAnimating}
                animationInTiming={this.props.animationInTiming}
                animationOutTiming={this.props.animationOutTiming}
                statusBarTranslucent={this.props.statusBarTranslucent}
                avoidKeyboard={this.props.avoidKeyboard}
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
                        });

                        const content = (
                            <View
                                style={{
                                    ...styles.defaultModalContainer,
                                    ...modalContainerStyle,
                                    ...modalPaddingStyles,
                                }}
                                ref={this.props.forwardedRef}
                            >
                                {this.props.children}
                            </View>
                        );

                        return this.props.isUseKeyboardAvoidingView ? (
                            <KeyboardAvoidingView
                                behavior="padding"
                            >
                                {content}
                            </KeyboardAvoidingView>
                        )
                            : content;
                    }}
                </SafeAreaInsetsContext.Consumer>
            </ReactNativeModal>
        );
    }
}

BaseModal.propTypes = propTypes;
BaseModal.defaultProps = defaultProps;

export default React.forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <BaseModal {...props} forwardedRef={ref} />
));
