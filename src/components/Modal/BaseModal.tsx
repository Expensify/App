import {PortalHost} from '@gorhom/portal';
import React, {forwardRef, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import ReactNativeModal from 'react-native-modal';
import ColorSchemeWrapper from '@components/ColorSchemeWrapper';
import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal';
import useKeyboardState from '@hooks/useKeyboardState';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
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
import ModalContext from './ModalContext';
import type BaseModalProps from './types';

function BaseModal(
    {
        isVisible: isVisibleProp,
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
        useNativeDriverForBackdrop,
        hideModalContentWhileAnimating = false,
        animationInTiming,
        animationOutTiming,
        statusBarTranslucent = true,
        navigationBarTranslucent = true,
        onLayout,
        avoidKeyboard = false,
        children,
        shouldUseCustomBackdrop = false,
        onBackdropPress,
        modalId,
        shouldEnableNewFocusManagement = false,
        restoreFocusType,
        shouldUseModalPaddingStyle = true,
        initialFocus = false,
    }: BaseModalProps,
    ref: React.ForwardedRef<View>,
) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {windowWidth, windowHeight} = useWindowDimensions();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to apply correct modal width
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const keyboardStateContextValue = useKeyboardState();

    const safeAreaInsets = useSafeAreaInsets();

    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => {
        if (isVisibleProp) {
            InteractionManager.runAfterInteractions(() => {
                setIsVisible(true);
            });
            return;
        }

        setIsVisible(false);
    }, [isVisibleProp]);

    const isVisibleRef = useRef(isVisible);
    const wasVisible = usePrevious(isVisible);

    const uniqueModalId = useMemo(() => modalId ?? ComposerFocusManager.getId(), [modalId]);
    const saveFocusState = useCallback(() => {
        if (shouldEnableNewFocusManagement) {
            ComposerFocusManager.saveFocusState(uniqueModalId);
        }
        ComposerFocusManager.resetReadyToFocus(uniqueModalId);
    }, [shouldEnableNewFocusManagement, uniqueModalId]);

    /**
     * Hides modal
     * @param callHideCallback - Should we call the onModalHide callback
     */
    const hideModal = useCallback(
        (callHideCallback = true) => {
            if (Modal.areAllModalsHidden()) {
                Modal.willAlertModalBecomeVisible(false);
                if (shouldSetModalVisibility) {
                    Modal.setModalVisibility(false);
                }
            }
            if (callHideCallback) {
                onModalHide();
            }
            Modal.onModalDidClose();
            ComposerFocusManager.refocusAfterModalFullyClosed(uniqueModalId, restoreFocusType);
        },
        [shouldSetModalVisibility, onModalHide, restoreFocusType, uniqueModalId],
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
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
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
        ComposerFocusManager.setReadyToFocus(uniqueModalId);
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

    const modalPaddingStyles = shouldUseModalPaddingStyle
        ? StyleUtils.getModalPaddingStyles({
              safeAreaPaddingTop,
              safeAreaPaddingBottom,
              safeAreaPaddingLeft,
              safeAreaPaddingRight,
              shouldAddBottomSafeAreaMargin,
              shouldAddTopSafeAreaMargin,
              shouldAddBottomSafeAreaPadding: (!avoidKeyboard || !keyboardStateContextValue?.isKeyboardShown) && shouldAddBottomSafeAreaPadding,
              shouldAddTopSafeAreaPadding,
              modalContainerStyleMarginTop: modalContainerStyle.marginTop,
              modalContainerStyleMarginBottom: modalContainerStyle.marginBottom,
              modalContainerStylePaddingTop: modalContainerStyle.paddingTop,
              modalContainerStylePaddingBottom: modalContainerStyle.paddingBottom,
              insets: safeAreaInsets,
          })
        : {
              paddingLeft: safeAreaPaddingLeft ?? 0,
              paddingRight: safeAreaPaddingRight ?? 0,
          };

    const modalContextValue = useMemo(
        () => ({
            activeModalType: isVisible ? type : undefined,
            default: false,
        }),
        [isVisible, type],
    );

    return (
        <ModalContext.Provider value={modalContextValue}>
            <View
                // this is a workaround for modal not being visible on the new arch in some cases
                // it's necessary to have a non-collapseable view as a parent of the modal to prevent
                // a conflict between RN core and Reanimated shadow tree operations
                // position absolute is needed to prevent the view from interfering with flex layout
                collapsable={false}
                style={[styles.pAbsolute, {zIndex: 1}]}
            >
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
                    // eslint-disable-next-line react-compiler/react-compiler
                    useNativeDriver={useNativeDriverProp && useNativeDriver}
                    // eslint-disable-next-line react-compiler/react-compiler
                    useNativeDriverForBackdrop={useNativeDriverForBackdrop && useNativeDriver}
                    hideModalContentWhileAnimating={hideModalContentWhileAnimating}
                    animationInTiming={animationInTiming}
                    animationOutTiming={animationOutTiming}
                    statusBarTranslucent={statusBarTranslucent}
                    navigationBarTranslucent={navigationBarTranslucent}
                    onLayout={onLayout}
                    avoidKeyboard={avoidKeyboard}
                    customBackdrop={shouldUseCustomBackdrop ? <Overlay onPress={handleBackdropPress} /> : undefined}
                >
                    <ModalContent
                        onModalWillShow={saveFocusState}
                        onDismiss={handleDismissModal}
                    >
                        <PortalHost name="modal" />
                        <FocusTrapForModal
                            active={isVisible}
                            initialFocus={initialFocus}
                        >
                            <View
                                style={[styles.defaultModalContainer, modalPaddingStyles, modalContainerStyle, !isVisible && styles.pointerEventsNone]}
                                ref={ref}
                            >
                                <ColorSchemeWrapper>{children}</ColorSchemeWrapper>
                            </View>
                        </FocusTrapForModal>
                    </ModalContent>
                </ReactNativeModal>
            </View>
        </ModalContext.Provider>
    );
}

BaseModal.displayName = 'BaseModalWithRef';

export default forwardRef(BaseModal);
