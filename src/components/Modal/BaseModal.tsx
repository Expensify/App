import React, {forwardRef, useCallback, useEffect, useMemo, useRef} from 'react';
import {View} from 'react-native';
import ReactNativeModal from 'react-native-modal';
import ColorSchemeWrapper from '@components/ColorSchemeWrapper';
import useKeyboardState from '@hooks/useKeyboardState';
import usePrevious from '@hooks/usePrevious';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import ComposerFocusManager from '@libs/ComposerFocusManager';
import Overlay from '@libs/Navigation/AppNavigator/Navigators/Overlay';
import useNativeDriver from '@libs/useNativeDriver';
import variables from '@styles/variables';
import * as Modal from '@userActions/Modal';
import CONST from '@src/CONST';
import ModalContent from './ModalContent';
import type BaseModalProps from './types';

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
        avoidKeyboard = false,
        children,
        shouldUseCustomBackdrop = false,
        onBackdropPress,
        shouldEnableNewFocusManagement = false,
        restoreFocusType,
    }: BaseModalProps,
    ref: React.ForwardedRef<View>,
) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {windowWidth, windowHeight, isSmallScreenWidth} = useWindowDimensions();
    const keyboardStateContextValue = useKeyboardState();

    const safeAreaInsets = useSafeAreaInsets();

    const isVisibleRef = useRef(isVisible);
    const wasVisible = usePrevious(isVisible);

    const modalId = useMemo(() => ComposerFocusManager.getId(), []);
    const saveFocusState = () => {
        if (shouldEnableNewFocusManagement) {
            ComposerFocusManager.saveFocusState(modalId);
        }
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
            ComposerFocusManager.refocusAfterModalFullyClosed(modalId, restoreFocusType);
        },
        [shouldSetModalVisibility, onModalHide, restoreFocusType, modalId],
    );

    useEffect(() => {
        isVisibleRef.current = isVisible;
        let removeOnCloseListener: () => void;
        if (isVisible) {
            Modal.willAlertModalBecomeVisible(true, type === CONST.MODAL.MODAL_TYPE.POPOVER || type === CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED);
            // To handle closing any modal already visible when this modal is mounted, i.e. PopoverReportActionContextMenu
            removeOnCloseListener = Modal.setCloseModal(onClose);
        }

        return () => {
            if (!removeOnCloseListener) {
                return;
            }
            removeOnCloseListener();
        };
    }, [isVisible, wasVisible, onClose, type]);

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

        if (onBackdropPress) {
            onBackdropPress();
        } else {
            onClose();
        }
    };

    const handleDismissModal = () => {
        ComposerFocusManager.setReadyToFocus(modalId);
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
            StyleUtils.getModalStyles(
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
        [StyleUtils, type, windowWidth, windowHeight, isSmallScreenWidth, popoverAnchorPosition, innerContainerStyle, outerStyle],
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
        shouldAddBottomSafeAreaPadding: !keyboardStateContextValue?.isKeyboardShown && shouldAddBottomSafeAreaPadding,
        shouldAddTopSafeAreaPadding,
        modalContainerStyleMarginTop: modalContainerStyle.marginTop,
        modalContainerStyleMarginBottom: modalContainerStyle.marginBottom,
        modalContainerStylePaddingTop: modalContainerStyle.paddingTop,
        modalContainerStylePaddingBottom: modalContainerStyle.paddingBottom,
        insets: safeAreaInsets,
    });

    return (
        <ReactNativeModal
            // Prevent the parent element to capture a click. This is useful when the modal component is put inside a pressable.
            onClick={(e) => e.stopPropagation()}
            onBackdropPress={handleBackdropPress}
            // Note: Escape key on web/desktop will trigger onBackButtonPress callback
            // eslint-disable-next-line react/jsx-props-no-multi-spaces
            onBackButtonPress={Modal.closeTop}
            onModalShow={handleShowModal}
            propagateSwipe={propagateSwipe}
            onModalHide={hideModal}
            onModalWillShow={saveFocusState}
            onDismiss={handleDismissModal}
            onSwipeComplete={() => onClose?.()}
            swipeDirection={swipeDirection}
            isVisible={isVisible}
            backdropColor={theme.overlay}
            backdropOpacity={!shouldUseCustomBackdrop && hideBackdrop ? 0 : variables.overlayOpacity}
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
            customBackdrop={shouldUseCustomBackdrop ? <Overlay onPress={handleBackdropPress} /> : undefined}
        >
            <ModalContent onDismiss={handleDismissModal}>
                <View
                    style={[styles.defaultModalContainer, modalPaddingStyles, modalContainerStyle, !isVisible && styles.pointerEventsNone]}
                    ref={ref}
                >
                    <ColorSchemeWrapper>{children}</ColorSchemeWrapper>
                </View>
            </ModalContent>
        </ReactNativeModal>
    );
}

BaseModal.displayName = 'BaseModalWithRef';

export default forwardRef(BaseModal);
