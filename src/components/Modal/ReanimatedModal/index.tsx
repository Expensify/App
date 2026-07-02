import noop from 'lodash/noop';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {NativeEventSubscription, ViewStyle} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import {BackHandler, InteractionManager, Modal, StyleSheet, View} from 'react-native';
import {LayoutAnimationConfig} from 'react-native-reanimated';
import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal';
import KeyboardAvoidingView from '@components/KeyboardAvoidingView';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import blurActiveElement from '@libs/Accessibility/blurActiveElement';
import getPlatform from '@libs/getPlatform';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import type {TransitionHandle} from '@libs/Navigation/TransitionTracker';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import Backdrop from './Backdrop';
import Container from './Container';
import HiddenForOverlayContext from './HiddenForOverlayContext';
import type ReanimatedModalProps from './types';

function ReanimatedModal({
    testID,
    animationInDelay,
    animationInTiming = CONST.MODAL.ANIMATION_TIMING.DEFAULT_IN,
    animationOutTiming = CONST.MODAL.ANIMATION_TIMING.DEFAULT_OUT,
    animationIn = 'fadeIn',
    animationOut = 'fadeOut',
    avoidKeyboard = false,
    coverScreen = true,
    children,
    hasBackdrop = true,
    backdropColor = 'black',
    backdropOpacity = variables.overlayOpacity,
    customBackdrop = null,
    isVisible = false,
    onModalWillShow = noop,
    onModalShow = noop,
    onModalWillHide = noop,
    onModalHide = noop,
    onDismiss,
    onBackdropPress = noop,
    onBackButtonPress = noop,
    style,
    type,
    statusBarTranslucent = false,
    onSwipeComplete,
    swipeDirection,
    swipeThreshold,
    shouldPreventScrollOnFocus,
    initialFocus,
    shouldIgnoreBackHandlerDuringTransition = false,
    shouldEnableNewFocusManagement,
    shouldReturnFocus,
    ...props
}: ReanimatedModalProps) {
    const [isVisibleState, setIsVisibleState] = useState(isVisible);
    const [isContainerOpen, setIsContainerOpen] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    // Content inside this modal (e.g. a CalendarPicker whose year selector opened as a route on top) can ask
    // the modal to hide in place — visually hidden, no backdrop, pointer-transparent — while staying mounted.
    // See HiddenForOverlayContext.
    const [isHiddenForOverlay, setIsHiddenForOverlay] = useState(false);
    const {windowWidth, windowHeight} = useWindowDimensions();

    const backHandlerListener = useRef<NativeEventSubscription | null>(null);
    const handleRef = useRef<number | undefined>(undefined);
    const transitionHandleRef = useRef<TransitionHandle | null>(null);
    // Web-only: RNW forwards the <Modal> ref to ModalContent's outermost element; its parentElement is the
    // full-screen portal root (ModalAnimation). See the pointer-events effect below.
    const modalContentRef = useRef<unknown>(null);

    const styles = useThemeStyles();

    const onBackButtonPressHandler = useCallback(() => {
        if (shouldIgnoreBackHandlerDuringTransition && isTransitioning) {
            return false;
        }
        if (isVisibleState) {
            onBackButtonPress();
            return true;
        }
        return false;
    }, [isVisibleState, onBackButtonPress, isTransitioning, shouldIgnoreBackHandlerDuringTransition]);

    const handleEscape = useCallback(
        (e: KeyboardEvent) => {
            if (e.key !== 'Escape' || onBackButtonPressHandler() !== true) {
                return;
            }
            e.stopImmediatePropagation();
        },
        [onBackButtonPressHandler],
    );

    useEffect(() => {
        if (getPlatform() === CONST.PLATFORM.WEB) {
            document.body.addEventListener('keyup', handleEscape, {capture: true});
        } else {
            backHandlerListener.current = BackHandler.addEventListener('hardwareBackPress', onBackButtonPressHandler);
        }

        return () => {
            if (getPlatform() === CONST.PLATFORM.WEB) {
                document.body.removeEventListener('keyup', handleEscape, {capture: true});
            } else {
                backHandlerListener.current?.remove();
            }
        };
    }, [handleEscape, onBackButtonPressHandler]);

    useEffect(
        () => () => {
            if (handleRef.current) {
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                InteractionManager.clearInteractionHandle(handleRef.current);
            }
            if (transitionHandleRef.current) {
                TransitionTracker.endTransition(transitionHandleRef.current);
                transitionHandleRef.current = null;
            }

            setIsVisibleState(false);
            setIsContainerOpen(false);
        },

        [],
    );

    useEffect(() => {
        if (isVisible && !isContainerOpen && !isTransitioning) {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            handleRef.current = InteractionManager.createInteractionHandle();
            transitionHandleRef.current = TransitionTracker.startTransition();
            onModalWillShow();

            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsVisibleState(true);
            setIsTransitioning(true);
        } else if (!isVisible && isContainerOpen && !isTransitioning) {
            handleRef.current = InteractionManager.createInteractionHandle();
            transitionHandleRef.current = TransitionTracker.startTransition();
            onModalWillHide();

            blurActiveElement();
            setIsVisibleState(false);
            setIsTransitioning(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isVisible, isContainerOpen, isTransitioning]);

    const backdropStyle: ViewStyle = useMemo(() => {
        return {width: windowWidth, height: windowHeight, backgroundColor: backdropColor};
    }, [windowWidth, windowHeight, backdropColor]);

    const onOpenCallBack = useCallback(() => {
        setIsTransitioning(false);
        setIsContainerOpen(true);
        if (handleRef.current) {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            InteractionManager.clearInteractionHandle(handleRef.current);
        }
        if (transitionHandleRef.current) {
            TransitionTracker.endTransition(transitionHandleRef.current);
            transitionHandleRef.current = null;
        }
        onModalShow();
    }, [onModalShow]);

    const onCloseCallBack = useCallback(() => {
        setIsTransitioning(false);
        setIsContainerOpen(false);
        if (handleRef.current) {
            InteractionManager.clearInteractionHandle(handleRef.current);
        }
        if (transitionHandleRef.current) {
            TransitionTracker.endTransition(transitionHandleRef.current);
            transitionHandleRef.current = null;
        }

        // Because on Android, the Modal's onDismiss callback does not work reliably. There's a reported issue at:
        // https://stackoverflow.com/questions/58937956/react-native-modal-ondismiss-not-invoked
        // Therefore, we manually call onModalHide() here for Android.
        if (getPlatform() === CONST.PLATFORM.ANDROID) {
            onModalHide();
        }
    }, [onModalHide]);

    const modalStyle = useMemo(() => {
        return {zIndex: StyleSheet.flatten(style)?.zIndex};
    }, [style]);

    // react-native-web's <Modal> renders two full-screen wrappers around the content: ModalAnimation
    // (position:fixed, inset 0, z-index 9996 — the portal root) and ModalContent. While a route (the dynamic
    // year-selector RHP) is intentionally shown over this kept-mounted popover, those wrappers would swallow
    // the clicks meant for it, and RNW forwards no prop to make the root pointer-transparent (only `zIndex`).
    // RNW does forward the <Modal> ref to ModalContent's outermost element, whose parentElement IS the portal
    // root — so it can be toggled directly, no DOM traversal needed. The content stays mounted (state survives
    // the round-trip) and is already visually hidden, so disabling pointer events on the subtree is safe.
    useEffect(() => {
        if (getPlatform() !== CONST.PLATFORM.WEB) {
            return;
        }
        const modalContent = modalContentRef.current;
        const portalRoot = modalContent instanceof HTMLElement ? modalContent.parentElement : null;
        if (!portalRoot) {
            return;
        }
        portalRoot.style.pointerEvents = isHiddenForOverlay ? 'none' : '';
        return () => {
            portalRoot.style.pointerEvents = '';
        };
    }, [isHiddenForOverlay, isVisibleState]);

    const containerView = (
        <Container
            pointerEvents="box-none"
            animationInTiming={animationInTiming}
            animationOutTiming={animationOutTiming}
            animationInDelay={animationInDelay}
            onOpenCallBack={onOpenCallBack}
            onCloseCallBack={onCloseCallBack}
            animationIn={animationIn}
            animationOut={animationOut}
            style={[style, isHiddenForOverlay && [styles.opacity0, styles.visibilityHidden]]}
            type={type}
            onSwipeComplete={onSwipeComplete}
            swipeDirection={swipeDirection}
        >
            <HiddenForOverlayContext.Provider value={setIsHiddenForOverlay}>{children}</HiddenForOverlayContext.Provider>
        </Container>
    );

    const backdropView = (
        <Backdrop
            isBackdropVisible={isVisible}
            style={backdropStyle}
            customBackdrop={customBackdrop}
            onBackdropPress={onBackdropPress}
            animationInTiming={animationInTiming}
            animationOutTiming={animationOutTiming}
            animationInDelay={animationInDelay}
            backdropOpacity={backdropOpacity}
        />
    );

    if (!coverScreen && isVisibleState) {
        return (
            <View
                pointerEvents={isHiddenForOverlay ? 'none' : 'box-none'}
                style={[styles.modalBackdrop, styles.modalContainerBox]}
            >
                {hasBackdrop && !isHiddenForOverlay && backdropView}
                {containerView}
            </View>
        );
    }
    const isBackdropMounted = isVisibleState || ((isTransitioning || isContainerOpen !== isVisibleState) && getPlatform() === CONST.PLATFORM.WEB);
    const modalVisibility = isVisibleState || isTransitioning || isContainerOpen !== isVisibleState;
    return (
        <LayoutAnimationConfig skipExiting={getPlatform() !== CONST.PLATFORM.WEB}>
            <Modal
                // On web, RNW forwards this ref to ModalContent's outermost element (an HTMLElement); on native
                // it resolves to the Modal instance and the instanceof guard in the effect above makes it a no-op.
                ref={(node) => {
                    modalContentRef.current = node;
                }}
                transparent
                animationType="none"
                visible={modalVisibility}
                onRequestClose={onBackButtonPressHandler}
                statusBarTranslucent={statusBarTranslucent}
                testID={testID}
                onDismiss={() => {
                    onDismiss?.();
                    if (getPlatform() !== CONST.PLATFORM.ANDROID) {
                        onModalHide();
                    }
                }}
                style={modalStyle}
                {...props}
            >
                {isBackdropMounted && hasBackdrop && !isHiddenForOverlay && backdropView}
                {avoidKeyboard ? (
                    <KeyboardAvoidingView
                        behavior="padding"
                        pointerEvents="box-none"
                        style={[style, {margin: 0}]}
                    >
                        {isVisibleState && containerView}
                    </KeyboardAvoidingView>
                ) : (
                    <FocusTrapForModal
                        active={modalVisibility}
                        initialFocus={initialFocus}
                        shouldReturnFocus={shouldReturnFocus ?? !shouldEnableNewFocusManagement}
                        shouldPreventScroll={shouldPreventScrollOnFocus}
                    >
                        {isVisibleState && containerView}
                    </FocusTrapForModal>
                )}
            </Modal>
        </LayoutAnimationConfig>
    );
}

export default ReanimatedModal;
