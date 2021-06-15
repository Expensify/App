import React, {PureComponent} from 'react';
import {View} from 'react-native';
import ReactNativeModal from 'react-native-modal';
import {SafeAreaInsetsContext} from 'react-native-safe-area-context';

import KeyboardShortcut from '../../libs/KeyboardShortcut';
import styles, {getModalPaddingStyles, getSafeAreaPadding} from '../../styles/styles';
import themeColors from '../../styles/themes/default';
import {propTypes, defaultProps} from './ModalPropTypes';
import getModalStyles from '../../styles/getModalStyles';
import {setModalVisibility} from '../../libs/actions/Modal';

class BaseModal extends PureComponent {
    constructor(props) {
        super(props);

        this.hideModalAndRemoveEventListeners = this.hideModalAndRemoveEventListeners.bind(this);
        this.subscribeToKeyEvents = this.subscribeToKeyEvents.bind(this);
        this.unsubscribeFromKeyEvents = this.unsubscribeFromKeyEvents.bind(this);
    }

    componentWillUnmount() {
        this.hideModalAndRemoveEventListeners();
    }

    /**
     * Hides modal and unsubscribes from key event listeners
     */
    hideModalAndRemoveEventListeners() {
        this.unsubscribeFromKeyEvents();
        if (this.props.shouldSetModalVisibility) {
            setModalVisibility(false);
        }
        this.props.onModalHide();
    }

    /**
     * Listens to specific keyboard keys when the modal has been opened
     */
    subscribeToKeyEvents() {
        KeyboardShortcut.subscribe('Enter', this.props.onSubmit, [], true);
    }

    /**
     * Stops listening to keyboard keys when modal has been closed
     */
    unsubscribeFromKeyEvents() {
        KeyboardShortcut.unsubscribe('Enter');
    }

    render() {
        const {
            modalStyle,
            modalContainerStyle,
            swipeDirection,
            animationIn,
            animationOut,
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
                    this.subscribeToKeyEvents();
                    if (this.props.shouldSetModalVisibility) {
                        setModalVisibility(true);
                    }
                    this.props.onModalShow();
                }}
                onModalHide={this.hideModalAndRemoveEventListeners}
                onSwipeComplete={this.props.onClose}
                swipeDirection={swipeDirection}
                isVisible={this.props.isVisible}
                backdropColor={themeColors.modalBackdrop}
                backdropOpacity={hideBackdrop ? 0 : 0.5}
                backdropTransitionOutTiming={0}
                style={modalStyle}
                deviceHeight={this.props.windowHeight}
                deviceWidth={this.props.windowWidth}
                animationIn={this.props.animationIn || animationIn}
                animationOut={this.props.animationOut || animationOut}
                useNativeDriver={this.props.useNativeDriver}
                statusBarTranslucent
                hideModalContentWhileAnimating={this.props.hideModalContentWhileAnimating}
                animationInTiming={this.props.animationInTiming}
                animationOutTiming={this.props.animationOutTiming}
            >
                <SafeAreaInsetsContext.Consumer>
                    {(insets) => {
                        const {
                            paddingTop: safeAreaPaddingTop,
                            paddingBottom: safeAreaPaddingBottom,
                        } = getSafeAreaPadding(insets);

                        const modalPaddingStyles = getModalPaddingStyles({
                            safeAreaPaddingTop,
                            safeAreaPaddingBottom,
                            shouldAddBottomSafeAreaPadding,
                            shouldAddTopSafeAreaPadding,
                            modalContainerStylePaddingTop: modalContainerStyle.paddingTop,
                            modalContainerStylePaddingBottom: modalContainerStyle.paddingBottom,
                        });

                        return (
                            <View
                                style={{
                                    ...styles.defaultModalContainer,
                                    ...modalContainerStyle,
                                    ...modalPaddingStyles,
                                }}
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
BaseModal.displayName = 'BaseModal';
export default BaseModal;
