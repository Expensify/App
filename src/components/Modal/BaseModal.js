import React, {forwardRef, useCallback, useEffect, useMemo, useRef} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import ReactNativeModal from 'react-native-modal';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styles from '../../styles/styles';
import * as Modal from '../../libs/actions/Modal';
import * as StyleUtils from '../../styles/StyleUtils';
import themeColors from '../../styles/themes/default';
import {propTypes as modalPropTypes, defaultProps as modalDefaultProps} from './modalPropTypes';
import getModalStyles from '../../styles/getModalStyles';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import variables from '../../styles/variables';
import CONST from '../../CONST';
import ComposerFocusManager from '../../libs/ComposerFocusManager';
import useNativeDriver from '../../libs/useNativeDriver';
import usePrevious from '../../hooks/usePrevious';

const propTypes = {
    ...modalPropTypes,

    /** The ref to the modal container */
    forwardedRef: PropTypes.func,
};

const defaultProps = {
    ...modalDefaultProps,
    forwardedRef: () => {},
};

function BaseModal({
    isVisible,
    onClose,
    shouldSetModalVisibility,
    onModalHide,
    type,
    popoverAnchorPosition,
    innerContainerStyle,
    outerStyle,
    onModalShow,
    propagateSwipe,
    fullscreen,
    animationIn,
    animationOut,
    useNativeDriver: useNativeDriverProp,
    hideModalContentWhileAnimating,
    animationInTiming,
    animationOutTiming,
    statusBarTranslucent,
    onLayout,
    avoidKeyboard,
    forwardedRef,
    children,
}) {
    const {windowWidth, windowHeight, isSmallScreenWidth} = useWindowDimensions();

    const safeAreaInsets = useSafeAreaInsets();

    const isVisibleRef = useRef(isVisible);
    const wasVisible = usePrevious(isVisible);

    /**
     * Hides modal
     * @param {Boolean} [callHideCallback=true] Should we call the onModalHide callback
     */
    const hideModal = useCallback(
        (callHideCallback = true) => {
            if (shouldSetModalVisibility) {
                Modal.setModalVisibility(false);
            }
            if (callHideCallback) {
                onModalHide();
            }
            Modal.onModalDidClose();
            if (!fullscreen) {
                ComposerFocusManager.setReadyToFocus();
            }
        },
        [shouldSetModalVisibility, onModalHide, fullscreen],
    );

    useEffect(() => {
        isVisibleRef.current = isVisible;
        if (isVisible) {
            Modal.willAlertModalBecomeVisible(true);
            // To handle closing any modal already visible when this modal is mounted, i.e. PopoverReportActionContextMenu
            Modal.setCloseModal(onClose);
        } else if (wasVisible && !isVisible) {
            Modal.willAlertModalBecomeVisible(false);
            Modal.setCloseModal(null);
        }
    }, [isVisible, wasVisible, onClose]);

    useEffect(
        () => () => {
            // Only trigger onClose and setModalVisibility if the modal is unmounting while visible.
            if (!isVisibleRef.current) {
                return;
            }
            hideModal(true);
            Modal.willAlertModalBecomeVisible(false);
            // To prevent closing any modal already unmounted when this modal still remains as visible state
            Modal.setCloseModal(null);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    const handleShowModal = () => {
        if (shouldSetModalVisibility) {
            Modal.setModalVisibility(true);
        }
        onModalShow();
    };

    const handleBackdropPress = (e) => {
        if (e && e.key === CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey) {
            return;
        }
        onClose();
    };

    const handleDismissModal = () => {
        ComposerFocusManager.setReadyToFocus();
    };

    const {
        modalStyle,
        modalContainerStyle,
        swipeDirection,
        animationIn: modalStyleAnimationIn,
        animationOut: modalStyleAnimationOut,
        shouldAddTopSafeAreaMargin,
        shouldAddBottomSafeAreaMargin,
        shouldAddTopSafeAreaPadding,
        shouldAddBottomSafeAreaPadding,
        hideBackdrop,
    } = useMemo(
        () =>
            getModalStyles(
                type,
                {
                    windowWidth,
                    windowHeight,
                    isSmallScreenWidth,
                },
                popoverAnchorPosition,
                innerContainerStyle,
                outerStyle,
            ),
        [innerContainerStyle, isSmallScreenWidth, outerStyle, popoverAnchorPosition, type, windowHeight, windowWidth],
    );

    const {
        paddingTop: safeAreaPaddingTop,
        paddingBottom: safeAreaPaddingBottom,
        paddingLeft: safeAreaPaddingLeft,
        paddingRight: safeAreaPaddingRight,
    } = StyleUtils.getSafeAreaPadding(safeAreaInsets);

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
        insets: safeAreaInsets,
    });

    return (
        <ReactNativeModal
            onBackdropPress={handleBackdropPress}
            // Note: Escape key on web/desktop will trigger onBackButtonPress callback
            // eslint-disable-next-line react/jsx-props-no-multi-spaces
            onBackButtonPress={onClose}
            onModalShow={handleShowModal}
            propagateSwipe={propagateSwipe}
            onModalHide={hideModal}
            onDismiss={handleDismissModal}
            onSwipeComplete={onClose}
            swipeDirection={swipeDirection}
            isVisible={isVisible}
            backdropColor={themeColors.overlay}
            backdropOpacity={hideBackdrop ? 0 : variables.overlayOpacity}
            backdropTransitionOutTiming={0}
            hasBackdrop={fullscreen}
            coverScreen={fullscreen}
            style={modalStyle}
            deviceHeight={windowHeight}
            deviceWidth={windowWidth}
            animationIn={animationIn || modalStyleAnimationIn}
            animationOut={animationOut || modalStyleAnimationOut}
            useNativeDriver={useNativeDriverProp && useNativeDriver}
            hideModalContentWhileAnimating={hideModalContentWhileAnimating}
            animationInTiming={animationInTiming}
            animationOutTiming={animationOutTiming}
            statusBarTranslucent={statusBarTranslucent}
            onLayout={onLayout}
            avoidKeyboard={avoidKeyboard}
        >
            <View
                style={[styles.defaultModalContainer, modalContainerStyle, modalPaddingStyles, !isVisible && styles.pointerEventsNone]}
                ref={forwardedRef}
            >
                {children}
            </View>
        </ReactNativeModal>
    );
}

BaseModal.propTypes = propTypes;
BaseModal.defaultProps = defaultProps;
BaseModal.displayName = 'BaseModal';

const BaseModalWithRef = forwardRef((props, ref) => (
    <BaseModal
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));

BaseModalWithRef.displayName = 'BaseModalWithRef';

export default BaseModalWithRef;
