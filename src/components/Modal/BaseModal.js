import React, {PureComponent} from 'react';
import {View} from 'react-native';
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
import ComposerFocusManager from '../../libs/ComposerFocusManager';

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

    componentDidMount() {
        if (!this.props.isVisible) {
            return;
        }

        Modal.willAlertModalBecomeVisible(true);

        // To handle closing any modal already visible when this modal is mounted, i.e. PopoverReportActionContextMenu
        Modal.setCloseModal(this.props.onClose);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.isVisible === this.props.isVisible) {
            return;
        }

        Modal.willAlertModalBecomeVisible(this.props.isVisible);
        Modal.setCloseModal(this.props.isVisible ? this.props.onClose : null);
    }

    componentWillUnmount() {
        // Only trigger onClose and setModalVisibility if the modal is unmounting while visible.
        if (this.props.isVisible) {
            this.hideModal(true);
            Modal.willAlertModalBecomeVisible(false);
        }

        // To prevent closing any modal already unmounted when this modal still remains as visible state
        Modal.setCloseModal(null);
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
        Modal.onModalDidClose();
        if (!this.props.fullscreen) {
            ComposerFocusManager.setReadyToFocus();
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
            this.props.innerContainerStyle,
            this.props.outerStyle,
        );
        return (
            <ReactNativeModal
                onBackdropPress={(e) => {
                    if (e && e.key === 'Enter') {
                        return;
                    }
                    this.props.onClose();
                }}
                // Note: Escape key on web/desktop will trigger onBackButtonPress callback
                // eslint-disable-next-line react/jsx-props-no-multi-spaces
                onBackButtonPress={this.props.onClose}
                onModalWillShow={() => {
                    ComposerFocusManager.resetReadyToFocus();
                }}
                onModalShow={() => {
                    if (this.props.shouldSetModalVisibility) {
                        Modal.setModalVisibility(true);
                    }
                    this.props.onModalShow();
                }}
                propagateSwipe={this.props.propagateSwipe}
                onModalHide={this.hideModal}
                onDismiss={() => ComposerFocusManager.setReadyToFocus()}
                onSwipeComplete={this.props.onClose}
                swipeDirection={swipeDirection}
                isVisible={this.props.isVisible}
                backdropColor={themeColors.overlay}
                backdropOpacity={hideBackdrop ? 0 : variables.overlayOpacity}
                backdropTransitionOutTiming={0}
                hasBackdrop={this.props.fullscreen}
                coverScreen={this.props.fullscreen}
                style={modalStyle}
                deviceHeight={this.props.windowHeight}
                deviceWidth={this.props.windowWidth}
                animationIn={this.props.animationIn || animationIn}
                animationOut={this.props.animationOut || animationOut}
                useNativeDriver={this.props.useNativeDriver}
                hideModalContentWhileAnimating={this.props.hideModalContentWhileAnimating}
                animationInTiming={this.props.animationInTiming}
                animationOutTiming={this.props.animationOutTiming}
                statusBarTranslucent={this.props.statusBarTranslucent}
                onLayout={this.props.onLayout}
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
                            insets,
                        });

                        return (
                            <View
                                style={[styles.defaultModalContainer, modalContainerStyle, modalPaddingStyles, !this.props.isVisible ? styles.pointerEventsNone : {}]}
                                ref={this.props.forwardedRef}
                                nativeID="no-drag-area"
                            >
                                {this.props.children}
                            </View>
                        );
                    }}
                </SafeAreaInsetsContext.Consumer>
            </ReactNativeModal>
        );
    }
}

BaseModal.propTypes = propTypes;
BaseModal.defaultProps = defaultProps;

export default React.forwardRef((props, ref) => (
    <BaseModal
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));
