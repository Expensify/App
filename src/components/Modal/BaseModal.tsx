import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef} from 'react';
import {View} from 'react-native';
import ReactNativeModal from 'react-native-modal';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import usePrevious from '@hooks/usePrevious';
import useWindowDimensions from '@hooks/useWindowDimensions';
import ComposerFocusManager from '@libs/ComposerFocusManager';
import useNativeDriver from '@libs/useNativeDriver';
import getModalStyles from '@styles/getModalStyles';
import * as StyleUtils from '@styles/StyleUtils';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import variables from '@styles/variables';
import * as Modal from '@userActions/Modal';
import CONST from '@src/CONST';
import ModalContent from './ModalContent';
import BaseModalProps, {ModalRef} from './types';

function BaseModal(
    {
        isVisible,
        onClose,
        shouldSetModalVisibility = true,
        onModalHide = () => {},
        type,
        popoverAnchorPosition = {},
        innerContainerStyle = {},
        outerStyle,
        onModalShow = () => {},
        propagateSwipe,
        fullscreen = true,
        animationIn,
        animationOut,
        useNativeDriver: useNativeDriverProp,
        hideModalContentWhileAnimating = false,
        animationInTiming,
        animationOutTiming,
        statusBarTranslucent = true,
        onLayout,
        restoreFocusType,
        avoidKeyboard = false,
        children,
    }: BaseModalProps,
    ref: React.ForwardedRef<ModalRef>,
) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {windowWidth, windowHeight, isSmallScreenWidth} = useWindowDimensions();

    const safeAreaInsets = useSafeAreaInsets();

    const isVisibleRef = useRef(isVisible);
    const wasVisible = usePrevious(isVisible);

    const modalId = useMemo(() => ComposerFocusManager.getId(), []);

    const saveFocusState = () => {
        ComposerFocusManager.saveFocusState(modalId);
        ComposerFocusManager.resetReadyToFocus(modalId);
    };

    /**
     * Hides modal
     * @param callHideCallback - Should we call the onModalHide callback
     */
    const hideModal = useCallback(
        (callHideCallback = true) => {
            Modal.willAlertModalBecomeVisible(false);
            if (shouldSetModalVisibility) {
                Modal.setModalVisibility(false);
            }
            if (callHideCallback) {
                onModalHide();
            }
            Modal.onModalDidClose();
            ComposerFocusManager.tryRestoreFocusAfterClosedCompletely(modalId, restoreFocusType);
        },
        [shouldSetModalVisibility, onModalHide, restoreFocusType, modalId],
    );

    useEffect(() => {
        isVisibleRef.current = isVisible;
        let removeOnCloseListener: () => void;
        if (isVisible) {
            Modal.willAlertModalBecomeVisible(true);
            // To handle closing any modal already visible when this modal is mounted, i.e. PopoverReportActionContextMenu
            removeOnCloseListener = Modal.setCloseModal(onClose);
        }

        return () => {
            if (!removeOnCloseListener) {
                return;
            }
            removeOnCloseListener();
        };
    }, [isVisible, wasVisible, onClose]);

    useEffect(
        () => () => {
            // Only trigger onClose and setModalVisibility if the modal is unmounting while visible.
            if (!isVisibleRef.current) {
                return;
            }
            hideModal(true);
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

    const handleBackdropPress = (e?: KeyboardEvent) => {
        if (e?.key === CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey) {
            return;
        }

        onClose();
    };

    const handleDismissModal = () => {
        ComposerFocusManager.setReadyToFocus(modalId);
    };

    useImperativeHandle(
        ref,
        () => ({
            removePromise: () => ComposerFocusManager.removePromise(modalId),
            setReadyToFocus: () => ComposerFocusManager.setReadyToFocus(modalId),
        }),
        [modalId],
    );

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
            onModalWillShow={saveFocusState}
            onDismiss={handleDismissModal}
            onSwipeComplete={onClose}
            swipeDirection={swipeDirection}
            isVisible={isVisible}
            backdropColor={theme.overlay}
            backdropOpacity={hideBackdrop ? 0 : variables.overlayOpacity}
            backdropTransitionOutTiming={0}
            hasBackdrop={fullscreen}
            coverScreen={fullscreen}
            style={modalStyle}
            deviceHeight={windowHeight}
            deviceWidth={windowWidth}
            animationIn={animationIn ?? modalStyleAnimationIn}
            animationOut={animationOut ?? modalStyleAnimationOut}
            useNativeDriver={useNativeDriverProp && useNativeDriver}
            hideModalContentWhileAnimating={hideModalContentWhileAnimating}
            animationInTiming={animationInTiming}
            animationOutTiming={animationOutTiming}
            statusBarTranslucent={statusBarTranslucent}
            onLayout={onLayout}
            avoidKeyboard={avoidKeyboard}
        >
            <ModalContent onDismiss={handleDismissModal}>
                <View style={[styles.defaultModalContainer, modalContainerStyle, modalPaddingStyles, !isVisible && styles.pointerEventsNone]}>{children}</View>
            </ModalContent>
        </ReactNativeModal>
    );
}

BaseModal.displayName = 'BaseModalWithRef';

export default forwardRef(BaseModal);
