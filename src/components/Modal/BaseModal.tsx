import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import type {LayoutChangeEvent} from 'react-native';
// Animated required for side panel navigation
// eslint-disable-next-line no-restricted-imports
import {Animated, DeviceEventEmitter, View} from 'react-native';
import ColorSchemeWrapper from '@components/ColorSchemeWrapper';
import NavigationBar from '@components/NavigationBar';
import ScreenWrapperOfflineIndicatorContext from '@components/ScreenWrapper/ScreenWrapperOfflineIndicatorContext';
import useKeyboardState from '@hooks/useKeyboardState';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useSidePanelState from '@hooks/useSidePanelState';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import ComposerFocusManager from '@libs/ComposerFocusManager';
import {canUseTouchScreen as canUseTouchScreenCheck} from '@libs/DeviceCapabilities';
import NarrowPaneContext from '@libs/Navigation/AppNavigator/Navigators/NarrowPaneContext';
import Overlay from '@libs/Navigation/AppNavigator/Navigators/Overlay';
import Navigation from '@libs/Navigation/Navigation';
import {areAllModalsHidden, closeTop, onModalDidClose, setCloseModal, setModalVisibility, willAlertModalBecomeVisible} from '@userActions/Modal';
import CONST from '@src/CONST';
import ModalContext from './ModalContext';
import ReanimatedModal from './ReanimatedModal';
import type BaseModalProps from './types';

function BaseModal({
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
    fullscreen = true,
    animationIn,
    animationOut,
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
    enableEdgeToEdgeBottomSafeAreaPadding,
    shouldApplySidePanelOffset = type === CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED,
    hasBackdrop,
    backdropOpacity,
    shouldDisableBottomSafeAreaPadding = false,
    shouldIgnoreBackHandlerDuringTransition = false,
    forwardedFSClass = CONST.FULLSTORY.CLASS.UNMASK,
    ref,
    shouldDisplayBelowModals = false,
}: BaseModalProps) {
    // When the `enableEdgeToEdgeBottomSafeAreaPadding` prop is explicitly set, we enable edge-to-edge mode.
    const isUsingEdgeToEdgeMode = enableEdgeToEdgeBottomSafeAreaPadding !== undefined;
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {windowWidth, windowHeight} = useWindowDimensions();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to apply correct modal width
    const canUseTouchScreen = canUseTouchScreenCheck();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth, shouldUseNarrowLayout, isInNarrowPaneModal} = useResponsiveLayout();

    const {sidePanelOffset} = useSidePanelState();
    const sidePanelAnimatedStyle = shouldApplySidePanelOffset && !isSmallScreenWidth ? {transform: [{translateX: Animated.multiply(sidePanelOffset.current, -1)}]} : undefined;
    const keyboardStateContextValue = useKeyboardState();

    const [modalOverlapsWithTopSafeArea, setModalOverlapsWithTopSafeArea] = useState(false);
    const [modalHeight, setModalHeight] = useState(0);

    const insets = useSafeAreaInsets();

    const shouldCallHideModalOnUnmount = useRef(false);
    const hideModalCallbackRef = useRef<(callHideCallback: boolean) => void>(undefined);

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
            shouldCallHideModalOnUnmount.current = false;
            willAlertModalBecomeVisible(false);
            if (areAllModalsHidden()) {
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

    const handleDismissModal = useCallback(() => {
        ComposerFocusManager.setReadyToFocus(uniqueModalId);
    }, [uniqueModalId]);

    useEffect(() => {
        let removeOnCloseListener: () => void;
        if (isVisible) {
            shouldCallHideModalOnUnmount.current = true;
            willAlertModalBecomeVisible(true, type === CONST.MODAL.MODAL_TYPE.POPOVER || type === CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED);
            // To handle closing any modal already visible when this modal is mounted, i.e. PopoverReportActionContextMenu
            if (onClose) {
                removeOnCloseListener = setCloseModal(onClose);
            }
        }

        // When the modal becomes not visible, run dismiss logic to setReadyToFocus after it fully closes.
        if (!isVisible && wasVisible) {
            handleDismissModal();
        }

        return () => {
            if (!removeOnCloseListener) {
                return;
            }
            removeOnCloseListener();
        };
    }, [isVisible, wasVisible, onClose, type, handleDismissModal]);

    useEffect(() => {
        hideModalCallbackRef.current = hideModal;
    }, [hideModal]);

    useEffect(
        () => () => {
            if (!shouldCallHideModalOnUnmount.current) {
                return;
            }
            hideModalCallbackRef.current?.(true);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    useEffect(() => () => DeviceEventEmitter.emit(CONST.MODAL_EVENTS.CLOSED), []);

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

    // Checks if modal overlaps with topSafeArea. Used to offset tall bottom docked modals with keyboard.
    useEffect(() => {
        if (type !== CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED || !canUseTouchScreen || !isSmallScreenWidth) {
            return;
        }
        const {paddingTop} = StyleUtils.getPlatformSafeAreaPadding(insets);
        const availableHeight = windowHeight - modalHeight - keyboardStateContextValue.keyboardActiveHeight - paddingTop;
        setModalOverlapsWithTopSafeArea((keyboardStateContextValue.isKeyboardAnimatingRef.current || keyboardStateContextValue.isKeyboardActive) && Math.floor(availableHeight) <= 0);
    }, [
        StyleUtils,
        insets,
        keyboardStateContextValue.isKeyboardActive,
        keyboardStateContextValue.isKeyboardAnimatingRef,
        keyboardStateContextValue.keyboardActiveHeight,
        modalHeight,
        type,
        windowHeight,
        modalOverlapsWithTopSafeArea,
        canUseTouchScreen,
        isSmallScreenWidth,
    ]);

    const onViewLayout = (e: LayoutChangeEvent) => {
        setModalHeight(e.nativeEvent.layout.height);
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
                    shouldUseNarrowLayout,
                },
                popoverAnchorPosition,
                innerContainerStyle,
                outerStyle,
                shouldUseModalPaddingStyle,
                {
                    modalOverlapsWithTopSafeArea,
                    shouldDisableBottomSafeAreaPadding: !!shouldDisableBottomSafeAreaPadding,
                },
                shouldDisplayBelowModals,
            ),
        [
            StyleUtils,
            type,
            windowWidth,
            windowHeight,
            isSmallScreenWidth,
            shouldUseNarrowLayout,
            popoverAnchorPosition,
            innerContainerStyle,
            outerStyle,
            shouldUseModalPaddingStyle,
            modalOverlapsWithTopSafeArea,
            shouldDisableBottomSafeAreaPadding,
            shouldDisplayBelowModals,
        ],
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

    // In Modals we need to reset the ScreenWrapperOfflineIndicatorContext to allow nested ScreenWrapper components to render offline indicators,
    // except if we are in a narrow pane navigator. In this case, we use the narrow pane's original values.
    const {isInNarrowPane} = useContext(NarrowPaneContext);
    const {originalValues} = useContext(ScreenWrapperOfflineIndicatorContext);
    const offlineIndicatorContextValue = useMemo(() => (isInNarrowPane ? (originalValues ?? {}) : {}), [isInNarrowPane, originalValues]);

    const backdropOpacityAdjusted =
        hideBackdrop || (type === CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED && !isSmallScreenWidth && (isInNarrowPane || isInNarrowPaneModal)) // right_docked modals shouldn't add backdrops when opened in same-width RHP
            ? 0
            : backdropOpacity;

    const dragArea = type === CONST.MODAL.MODAL_TYPE.CENTERED || type === CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE ? undefined : false;

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
                    <ReanimatedModal
                        dataSet={{dragArea}}
                        // Prevent the parent element to capture a click. This is useful when the modal component is put inside a pressable.
                        onClick={(e) => e.stopPropagation()}
                        onBackdropPress={handleBackdropPress}
                        // Note: Escape key on web will trigger onBackButtonPress callback
                        onBackButtonPress={closeTop}
                        onModalShow={handleShowModal}
                        onModalHide={hideModal}
                        onModalWillShow={() => {
                            saveFocusState();
                            onModalWillShow?.();
                        }}
                        onModalWillHide={() => {
                            // Reset willAlertModalBecomeVisible when modal is about to hide
                            // This ensures it's cleared before any other components check its value
                            if (areAllModalsHidden()) {
                                willAlertModalBecomeVisible(false);
                            }
                            onModalWillHide?.();
                        }}
                        onDismiss={handleDismissModal}
                        onSwipeComplete={onClose}
                        swipeDirection={swipeDirection}
                        shouldPreventScrollOnFocus={shouldPreventScrollOnFocus}
                        initialFocus={initialFocus}
                        swipeThreshold={swipeThreshold}
                        isVisible={isVisible}
                        backdropColor={theme.overlay}
                        backdropOpacity={backdropOpacityAdjusted}
                        backdropTransitionOutTiming={0}
                        hasBackdrop={hasBackdrop ?? fullscreen}
                        coverScreen={fullscreen}
                        style={modalStyle}
                        deviceHeight={windowHeight}
                        deviceWidth={windowWidth}
                        animationIn={animationIn ?? modalStyleAnimationIn}
                        animationInTiming={animationInTiming}
                        animationInDelay={animationInDelay}
                        animationOut={animationOut ?? modalStyleAnimationOut}
                        animationOutTiming={animationOutTiming}
                        hideModalContentWhileAnimating={hideModalContentWhileAnimating}
                        statusBarTranslucent={statusBarTranslucent}
                        navigationBarTranslucent={navigationBarTranslucent}
                        onLayout={onLayout}
                        avoidKeyboard={avoidKeyboard}
                        customBackdrop={shouldUseCustomBackdrop ? <Overlay onPress={handleBackdropPress} /> : undefined}
                        type={type}
                        shouldIgnoreBackHandlerDuringTransition={shouldIgnoreBackHandlerDuringTransition}
                        shouldEnableNewFocusManagement={shouldEnableNewFocusManagement}
                    >
                        <Animated.View
                            onLayout={onViewLayout}
                            style={[styles.defaultModalContainer, modalContainerStyle, modalPaddingStyles, !isVisible && styles.pointerEventsNone, sidePanelAnimatedStyle]}
                            ref={ref}
                            fsClass={forwardedFSClass}
                        >
                            <ColorSchemeWrapper>{children}</ColorSchemeWrapper>
                        </Animated.View>
                        {!keyboardStateContextValue?.isKeyboardActive && <NavigationBar />}
                    </ReanimatedModal>
                </View>
            </ScreenWrapperOfflineIndicatorContext.Provider>
        </ModalContext.Provider>
    );
}

export default BaseModal;
