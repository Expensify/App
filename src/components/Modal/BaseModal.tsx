import React, {forwardRef, useCallback, useContext, useEffect, useMemo, useRef} from 'react';
import {View} from 'react-native';
import type {ModalProps as ReactNativeModalProps} from 'react-native-modal';
import ReactNativeModal from 'react-native-modal';
import type {ValueOf} from 'type-fest';
import ColorSchemeWrapper from '@components/ColorSchemeWrapper';
import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal';
import NavigationBar from '@components/NavigationBar';
import ScreenWrapperOfflineIndicatorContext from '@components/ScreenWrapper/ScreenWrapperOfflineIndicatorContext';
import useKeyboardState from '@hooks/useKeyboardState';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useSidePanel from '@hooks/useSidePanel';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import ComposerFocusManager from '@libs/ComposerFocusManager';
import NarrowPaneContext from '@libs/Navigation/AppNavigator/Navigators/NarrowPaneContext';
import Overlay from '@libs/Navigation/AppNavigator/Navigators/Overlay';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import {areAllModalsHidden, closeTop, onModalDidClose, setCloseModal, setModalVisibility, willAlertModalBecomeVisible} from '@userActions/Modal';
import CONST from '@src/CONST';
import BottomDockedModal from './BottomDockedModal';
import type ModalProps from './BottomDockedModal/types';
import ModalContent from './ModalContent';
import ModalContext from './ModalContext';
import type BaseModalProps from './types';

type ModalComponentProps = (ReactNativeModalProps | ModalProps) & {
    type?: ValueOf<typeof CONST.MODAL.MODAL_TYPE>;
};

function ModalComponent({type, ...props}: ModalComponentProps) {
    if (type === CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED) {
        // eslint-disable-next-line react/jsx-props-no-spreading
        return <BottomDockedModal {...(props as ModalProps)} />;
    }
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <ReactNativeModal {...(props as ReactNativeModalProps)} />;
}

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
        onModalWillShow,
        onModalWillHide,
        propagateSwipe,
        fullscreen = true,
        animationIn,
        animationOut,
        useNativeDriver,
        useNativeDriverForBackdrop,
        hideModalContentWhileAnimating = false,
        animationInTiming,
        animationOutTiming,
        animationInDelay,
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
        swipeThreshold = 150,
        swipeDirection,
        shouldPreventScrollOnFocus = false,
        disableAnimationIn = false,
        enableEdgeToEdgeBottomSafeAreaPadding,
        shouldApplySidePanelOffset = type === CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED,
    }: BaseModalProps,
    ref: React.ForwardedRef<View>,
) {
    // When the `enableEdgeToEdgeBottomSafeAreaPadding` prop is explicitly set, we enable edge-to-edge mode.
    const isUsingEdgeToEdgeMode = enableEdgeToEdgeBottomSafeAreaPadding !== undefined;
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {windowWidth, windowHeight} = useWindowDimensions();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to apply correct modal width
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {sidePanelOffset} = useSidePanel();
    const sidePanelStyle = shouldApplySidePanelOffset && !isSmallScreenWidth ? {paddingRight: sidePanelOffset.current} : undefined;
    const keyboardStateContextValue = useKeyboardState();

    const insets = useSafeAreaInsets();

    const isVisibleRef = useRef(isVisible);
    const hideModalCallbackRef = useRef<(callHideCallback: boolean) => void>();

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
            if (areAllModalsHidden()) {
                willAlertModalBecomeVisible(false);
                if (shouldSetModalVisibility && !Navigation.isTopmostRouteModalScreen()) {
                    setModalVisibility(false);
                }
            }
            if (callHideCallback) {
                onModalHide();
            }
            onModalDidClose();
            ComposerFocusManager.refocusAfterModalFullyClosed(uniqueModalId, restoreFocusType);
        },
        [shouldSetModalVisibility, onModalHide, restoreFocusType, uniqueModalId],
    );

    useEffect(() => {
        isVisibleRef.current = isVisible;
        let removeOnCloseListener: () => void;
        if (isVisible) {
            willAlertModalBecomeVisible(true, type === CONST.MODAL.MODAL_TYPE.POPOVER || type === CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED);
            // To handle closing any modal already visible when this modal is mounted, i.e. PopoverReportActionContextMenu
            if (onClose) {
                removeOnCloseListener = setCloseModal(onClose);
            }
        }

        return () => {
            if (!removeOnCloseListener) {
                return;
            }
            removeOnCloseListener();
        };
    }, [isVisible, wasVisible, onClose, type]);

    useEffect(() => {
        hideModalCallbackRef.current = hideModal;
    }, [hideModal]);

    useEffect(
        () => () => {
            // Only trigger onClose and setModalVisibility if the modal is unmounting while visible.
            if (!isVisibleRef.current) {
                return;
            }
            hideModalCallbackRef.current?.(true);
        },
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
        [],
    );

    const handleShowModal = useCallback(() => {
        if (shouldSetModalVisibility) {
            setModalVisibility(true, type);
        }
        onModalShow();
    }, [onModalShow, shouldSetModalVisibility, type]);

    const handleBackdropPress = (e?: KeyboardEvent) => {
        if (e?.key === CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey) {
            return;
        }

        if (onBackdropPress) {
            onBackdropPress();
        } else {
            onClose?.();
        }
    };

    const handleDismissModal = () => {
        ComposerFocusManager.setReadyToFocus(uniqueModalId);
    };

    const {
        modalStyle,
        modalContainerStyle,
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
                shouldUseModalPaddingStyle,
            ),
        [StyleUtils, type, windowWidth, windowHeight, isSmallScreenWidth, popoverAnchorPosition, innerContainerStyle, outerStyle, shouldUseModalPaddingStyle],
    );

    const modalPaddingStyles = useMemo(() => {
        const paddings = StyleUtils.getModalPaddingStyles({
            shouldAddBottomSafeAreaMargin,
            shouldAddTopSafeAreaMargin,
            // enableEdgeToEdgeBottomSafeAreaPadding is used as a temporary solution to disable safe area bottom spacing on modals, to allow edge-to-edge content
            shouldAddBottomSafeAreaPadding: !isUsingEdgeToEdgeMode && (!avoidKeyboard || !keyboardStateContextValue.isKeyboardActive) && shouldAddBottomSafeAreaPadding,
            shouldAddTopSafeAreaPadding,
            modalContainerStyle,
            insets,
        });
        return shouldUseModalPaddingStyle ? paddings : {paddingLeft: paddings.paddingLeft, paddingRight: paddings.paddingRight};
    }, [
        StyleUtils,
        avoidKeyboard,
        insets,
        isUsingEdgeToEdgeMode,
        keyboardStateContextValue.isKeyboardActive,
        modalContainerStyle,
        shouldAddBottomSafeAreaMargin,
        shouldAddBottomSafeAreaPadding,
        shouldAddTopSafeAreaMargin,
        shouldAddTopSafeAreaPadding,
        shouldUseModalPaddingStyle,
    ]);

    const modalContextValue = useMemo(
        () => ({
            activeModalType: isVisible ? type : undefined,
            default: false,
        }),
        [isVisible, type],
    );

    const animationInProps = useMemo(() => {
        if (disableAnimationIn) {
            // We need to apply these animation props to completely disable the "animation in". Simply setting it to 0 and undefined will not work.
            // Based on: https://github.com/react-native-modal/react-native-modal/issues/191
            return {
                animationIn: {from: {opacity: 1}, to: {opacity: 1}},
                animationInTiming: 0,
            };
        }

        return {
            animationIn: animationIn ?? modalStyleAnimationIn,
            animationInDelay,
            animationInTiming,
        };
    }, [animationIn, animationInDelay, animationInTiming, disableAnimationIn, modalStyleAnimationIn]);

    // In Modals we need to reset the ScreenWrapperOfflineIndicatorContext to allow nested ScreenWrapper components to render offline indicators,
    // except if we are in a narrow pane navigator. In this case, we use the narrow pane's original values.
    const {isInNarrowPane} = useContext(NarrowPaneContext);
    const {originalValues} = useContext(ScreenWrapperOfflineIndicatorContext);
    const offlineIndicatorContextValue = useMemo(() => (isInNarrowPane ? (originalValues ?? {}) : {}), [isInNarrowPane, originalValues]);

    return (
        <ModalContext.Provider value={modalContextValue}>
            <ScreenWrapperOfflineIndicatorContext.Provider value={offlineIndicatorContextValue}>
                <View
                    // this is a workaround for modal not being visible on the new arch in some cases
                    // it's necessary to have a non-collapsible view as a parent of the modal to prevent
                    // a conflict between RN core and Reanimated shadow tree operations
                    // position absolute is needed to prevent the view from interfering with flex layout
                    collapsable={false}
                    style={[styles.pAbsolute, {zIndex: 1}]}
                >
                    <ModalComponent
                        // Prevent the parent element to capture a click. This is useful when the modal component is put inside a pressable.
                        onClick={(e) => e.stopPropagation()}
                        onBackdropPress={handleBackdropPress}
                        // Note: Escape key on web/desktop will trigger onBackButtonPress callback
                        // eslint-disable-next-line react/jsx-props-no-multi-spaces
                        onBackButtonPress={closeTop}
                        onModalShow={handleShowModal}
                        propagateSwipe={propagateSwipe}
                        onModalHide={hideModal}
                        onModalWillShow={() => {
                            saveFocusState();
                            onModalWillShow?.();
                        }}
                        onModalWillHide={onModalWillHide}
                        onDismiss={handleDismissModal}
                        onSwipeComplete={onClose}
                        swipeDirection={swipeDirection}
                        swipeThreshold={swipeThreshold}
                        isVisible={isVisible}
                        backdropColor={theme.overlay}
                        backdropOpacity={!shouldUseCustomBackdrop && hideBackdrop ? 0 : variables.overlayOpacity}
                        backdropTransitionOutTiming={0}
                        hasBackdrop={fullscreen}
                        coverScreen={fullscreen}
                        style={[modalStyle, sidePanelStyle]}
                        deviceHeight={windowHeight}
                        deviceWidth={windowWidth}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...animationInProps}
                        animationOut={animationOut ?? modalStyleAnimationOut}
                        animationOutTiming={animationOutTiming}
                        useNativeDriver={useNativeDriver}
                        useNativeDriverForBackdrop={useNativeDriverForBackdrop}
                        hideModalContentWhileAnimating={hideModalContentWhileAnimating}
                        statusBarTranslucent={statusBarTranslucent}
                        navigationBarTranslucent={navigationBarTranslucent}
                        onLayout={onLayout}
                        avoidKeyboard={avoidKeyboard}
                        customBackdrop={shouldUseCustomBackdrop ? <Overlay onPress={handleBackdropPress} /> : undefined}
                        type={type}
                    >
                        <ModalContent
                            onModalWillShow={saveFocusState}
                            onDismiss={handleDismissModal}
                        >
                            <FocusTrapForModal
                                active={isVisible}
                                initialFocus={initialFocus}
                                shouldPreventScroll={shouldPreventScrollOnFocus}
                            >
                                <View
                                    style={[styles.defaultModalContainer, modalContainerStyle, modalPaddingStyles, !isVisible && styles.pointerEventsNone]}
                                    ref={ref}
                                >
                                    <ColorSchemeWrapper>{children}</ColorSchemeWrapper>
                                </View>
                            </FocusTrapForModal>
                        </ModalContent>
                        {!keyboardStateContextValue?.isKeyboardActive && <NavigationBar />}
                    </ModalComponent>
                </View>
            </ScreenWrapperOfflineIndicatorContext.Provider>
        </ModalContext.Provider>
    );
}

BaseModal.displayName = 'BaseModalWithRef';

export default forwardRef(BaseModal);
