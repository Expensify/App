import React, {forwardRef, useCallback, useEffect, useMemo, useRef} from 'react';
import {View} from 'react-native';
import type {ModalProps as ReactNativeModalProps} from 'react-native-modal';
import ReactNativeModal from 'react-native-modal';
import type {ValueOf} from 'type-fest';
import ColorSchemeWrapper from '@components/ColorSchemeWrapper';
import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal';
import NavigationBar from '@components/NavigationBar';
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
    shouldUseNewModal: boolean;
};

function ModalComponent({type, shouldUseNewModal, ...props}: ModalComponentProps) {
    if (type === CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED && shouldUseNewModal) {
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
        shouldUseNewModal = false,
        onBackdropPress,
        modalId,
        shouldEnableNewFocusManagement = false,
        restoreFocusType,
        shouldUseModalPaddingStyle = true,
        initialFocus = false,
        swipeThreshold = 150,
        swipeDirection,
        shouldPreventScrollOnFocus = false,
        enableEdgeToEdgeBottomSafeAreaPadding = false,
        shouldApplySidePanelOffset = type === CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED,
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
            removeOnCloseListener = setCloseModal(onClose);
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
            onClose();
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
            ),
        [StyleUtils, type, windowWidth, windowHeight, isSmallScreenWidth, popoverAnchorPosition, innerContainerStyle, outerStyle],
    );

    const modalPaddingStyles = useMemo(() => {
        const paddings = StyleUtils.getModalPaddingStyles({
            shouldAddBottomSafeAreaMargin,
            shouldAddTopSafeAreaMargin,
            // enableEdgeToEdgeBottomSafeAreaPadding is used as a temporary solution to disable safe area bottom spacing on modals, to allow edge-to-edge content
            shouldAddBottomSafeAreaPadding: !enableEdgeToEdgeBottomSafeAreaPadding && (!avoidKeyboard || !keyboardStateContextValue.isKeyboardActive) && shouldAddBottomSafeAreaPadding,
            shouldAddTopSafeAreaPadding,
            modalContainerStyle,
            insets,
        });
        return shouldUseModalPaddingStyle ? paddings : {paddingLeft: paddings.paddingLeft, paddingRight: paddings.paddingRight};
    }, [
        StyleUtils,
        avoidKeyboard,
        enableEdgeToEdgeBottomSafeAreaPadding,
        insets,
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
                    onModalWillShow={saveFocusState}
                    onDismiss={handleDismissModal}
                    onSwipeComplete={() => onClose?.()}
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
                    animationIn={animationIn ?? modalStyleAnimationIn}
                    animationInDelay={animationInDelay}
                    animationOut={animationOut ?? modalStyleAnimationOut}
                    useNativeDriver={useNativeDriver}
                    useNativeDriverForBackdrop={useNativeDriverForBackdrop}
                    hideModalContentWhileAnimating={hideModalContentWhileAnimating}
                    animationInTiming={animationInTiming}
                    animationOutTiming={animationOutTiming}
                    statusBarTranslucent={statusBarTranslucent}
                    navigationBarTranslucent={navigationBarTranslucent}
                    onLayout={onLayout}
                    avoidKeyboard={avoidKeyboard}
                    customBackdrop={shouldUseCustomBackdrop ? <Overlay onPress={handleBackdropPress} /> : undefined}
                    type={type}
                    shouldUseNewModal={shouldUseNewModal}
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
                                style={[styles.defaultModalContainer, modalPaddingStyles, modalContainerStyle, !isVisible && styles.pointerEventsNone]}
                                ref={ref}
                            >
                                <ColorSchemeWrapper>{children}</ColorSchemeWrapper>
                            </View>
                        </FocusTrapForModal>
                    </ModalContent>
                    {!keyboardStateContextValue?.isKeyboardShown && <NavigationBar />}
                </ModalComponent>
            </View>
        </ModalContext.Provider>
    );
}

BaseModal.displayName = 'BaseModalWithRef';

export default forwardRef(BaseModal);
