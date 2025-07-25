import React, {forwardRef, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import type {LayoutChangeEvent} from 'react-native';
// Animated required for side panel navigation
// eslint-disable-next-line no-restricted-imports
import {Animated, View} from 'react-native';
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
import {canUseTouchScreen as canUseTouchScreenCheck} from '@libs/DeviceCapabilities';
import NarrowPaneContext from '@libs/Navigation/AppNavigator/Navigators/NarrowPaneContext';
import Overlay from '@libs/Navigation/AppNavigator/Navigators/Overlay';
import Navigation from '@libs/Navigation/Navigation';
import {areAllModalsHidden, closeTop, onModalDidClose, setCloseModal, setModalVisibility, willAlertModalBecomeVisible} from '@userActions/Modal';
import CONST from '@src/CONST';
import ModalContent from './ModalContent';
import ModalContext from './ModalContext';
import ReanimatedModal from './ReanimatedModal';
import type ReanimatedModalProps from './ReanimatedModal/types';
import type BaseModalProps from './types';

const REANIMATED_MODAL_TYPES: Array<ValueOf<typeof CONST.MODAL.MODAL_TYPE>> = [CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED, CONST.MODAL.MODAL_TYPE.FULLSCREEN];

type ModalComponentProps = (ReactNativeModalProps | ReanimatedModalProps) & {
    type?: ValueOf<typeof CONST.MODAL.MODAL_TYPE>;
    shouldUseReanimatedModal?: boolean;
};

function ModalComponent({type, shouldUseReanimatedModal, ...props}: ModalComponentProps) {
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    if ((type && REANIMATED_MODAL_TYPES.includes(type)) || shouldUseReanimatedModal) {
        return (
            <ReanimatedModal
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...(props as ReanimatedModalProps)}
                type={type}
            />
        );
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
        hasBackdrop,
        backdropOpacity,
        shouldUseReanimatedModal = false,
        shouldDisableBottomSafeAreaPadding = false,
        forwardFSClass,
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
    const canUseTouchScreen = canUseTouchScreenCheck();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const {sidePanelOffset} = useSidePanel();
    const sidePanelStyle = !shouldUseReanimatedModal && shouldApplySidePanelOffset && !isSmallScreenWidth ? {paddingRight: sidePanelOffset.current} : undefined;
    const sidePanelReanimatedStyle =
        shouldUseReanimatedModal && shouldApplySidePanelOffset && !isSmallScreenWidth ? {transform: [{translateX: Animated.multiply(sidePanelOffset.current, -1)}]} : undefined;
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
        let removeOnCloseListener: () => void;
        if (isVisible) {
            shouldCallHideModalOnUnmount.current = true;
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
            if (!shouldCallHideModalOnUnmount.current) {
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
                shouldUseReanimatedModal,
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
            shouldUseReanimatedModal,
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
                        backdropOpacity={!shouldUseCustomBackdrop && hideBackdrop ? 0 : backdropOpacity}
                        backdropTransitionOutTiming={0}
                        hasBackdrop={hasBackdrop ?? fullscreen}
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
                        shouldUseReanimatedModal={shouldUseReanimatedModal}
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
                                <Animated.View
                                    onLayout={onViewLayout}
                                    style={[styles.defaultModalContainer, modalContainerStyle, modalPaddingStyles, !isVisible && styles.pointerEventsNone, sidePanelReanimatedStyle]}
                                    ref={ref}
                                    fsClass={forwardFSClass ?? CONST.FULL_STORY.UNMASK}
                                >
                                    <ColorSchemeWrapper>{children}</ColorSchemeWrapper>
                                </Animated.View>
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
