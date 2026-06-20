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
import viewRef from '@src/types/utils/viewRef';
import Backdrop from './Backdrop';
import Container from './Container';
import type ReanimatedModalProps from './types';

// Zero-footprint sentinel used only to locate the RNW Modal portal root for the pointer-events toggle.
const POINTER_EVENTS_PROBE_STYLE = {position: 'absolute', width: 0, height: 0} as const;

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
    shouldDisablePointerEvents = false,
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
    const {windowWidth, windowHeight} = useWindowDimensions();

    const backHandlerListener = useRef<NativeEventSubscription | null>(null);
    const handleRef = useRef<number | undefined>(undefined);
    const transitionHandleRef = useRef<TransitionHandle | null>(null);
    // Web-only: a zero-size sentinel used to locate the RNW Modal's full-screen portal root (ModalAnimation) so
    // its pointer-events can be toggled when shouldDisablePointerEvents is set. See the effect below.
    const pointerEventsProbeRef = useRef<View | HTMLElement | null>(null);

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

    // react-native-web's <Modal> renders its own full-screen portal root (ModalAnimation: position:fixed, inset 0,
    // z-index 9996, pointer-events:auto) plus a full-screen ModalContent View. RNW only forwards `zIndex` to that
    // root, so there is no prop to make it pointer-transparent. When `shouldDisablePointerEvents` is set, a route/RHP
    // (the dynamic year selector) is intentionally shown over this kept-mounted popover and must receive clicks, but
    // those full-screen wrappers would otherwise swallow them. We keep the popover mounted (so its state survives the
    // round-trip — no remount/reset) and instead toggle pointer-events on the portal root imperatively. The popover
    // content is already visually hidden by the caller, so disabling pointer events on the whole subtree is safe.
    useEffect(() => {
        if (getPlatform() !== CONST.PLATFORM.WEB) {
            return;
        }
        const probe = pointerEventsProbeRef.current;
        if (!(probe instanceof HTMLElement)) {
            return;
        }
        // The outermost fixed-position ancestor of the probe is the RNW Modal portal root (ModalAnimation).
        let portalRoot: HTMLElement | null = null;
        for (let node = probe.parentElement; node && node !== document.body; node = node.parentElement) {
            if (window.getComputedStyle(node).position === 'fixed') {
                portalRoot = node;
            }
        }
        if (!portalRoot) {
            return;
        }
        portalRoot.style.pointerEvents = shouldDisablePointerEvents ? 'none' : '';
        return () => {
            portalRoot.style.pointerEvents = '';
        };
    }, [shouldDisablePointerEvents, isVisibleState]);

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
            style={style}
            type={type}
            onSwipeComplete={onSwipeComplete}
            swipeDirection={swipeDirection}
        >
            {children}
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
                pointerEvents={shouldDisablePointerEvents ? 'none' : 'box-none'}
                style={[styles.modalBackdrop, styles.modalContainerBox]}
            >
                {hasBackdrop && backdropView}
                {containerView}
            </View>
        );
    }
    const isBackdropMounted = isVisibleState || ((isTransitioning || isContainerOpen !== isVisibleState) && getPlatform() === CONST.PLATFORM.WEB);
    const modalVisibility = isVisibleState || isTransitioning || isContainerOpen !== isVisibleState;
    return (
        <LayoutAnimationConfig skipExiting={getPlatform() !== CONST.PLATFORM.WEB}>
            <Modal
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
                <View
                    ref={viewRef(pointerEventsProbeRef)}
                    pointerEvents="none"
                    style={POINTER_EVENTS_PROBE_STYLE}
                />
                {isBackdropMounted && hasBackdrop && backdropView}
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
