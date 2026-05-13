import noop from 'lodash/noop';
import React, {useEffect, useEffectEvent, useRef, useState} from 'react';
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
// eslint-disable-next-line no-restricted-imports
import TransitionTracker from '@libs/Navigation/TransitionTracker';
// eslint-disable-next-line no-restricted-imports
import type {TransitionHandle} from '@libs/Navigation/TransitionTracker';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import Backdrop from './Backdrop';
import Container from './Container';
import type ReanimatedModalProps from './types';

type ModalState = 'closed' | 'opening' | 'open' | 'closing';

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
    // --- Hooks ---
    const [modalState, setModalState] = useState<ModalState>('closed');
    const [prevIsVisible, setPrevIsVisible] = useState(isVisible);
    const {windowWidth, windowHeight} = useWindowDimensions();
    const styles = useThemeStyles();

    // --- Refs ---
    const backHandlerListener = useRef<NativeEventSubscription | null>(null);
    const handleRef = useRef<number | undefined>(undefined);
    const transitionHandleRef = useRef<TransitionHandle | null>(null);

    // --- Render-time state adjustment ---
    // When isVisible changes, advance the state machine from stable states only.
    // Mid-animation changes are ignored — the animation runs to completion and the
    // final isVisible value is honored when the callback fires.
    // See: https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
    if (prevIsVisible !== isVisible) {
        setPrevIsVisible(isVisible);
        if (isVisible && modalState === 'closed') {
            setModalState('opening');
        } else if (!isVisible && modalState === 'open') {
            setModalState('closing');
        }
    }

    // --- Derived values ---
    const isTransitioning = modalState === 'opening' || modalState === 'closing';
    const backdropStyle: ViewStyle = {width: windowWidth, height: windowHeight, backgroundColor: backdropColor};
    const modalStyle = {zIndex: StyleSheet.flatten(style)?.zIndex};

    // --- Callbacks ---
    const onBackButtonPressHandler = useEffectEvent(() => {
        if (shouldIgnoreBackHandlerDuringTransition && isTransitioning) {
            return false;
        }
        if (isVisible) {
            onBackButtonPress();
            return true;
        }
        return false;
    });

    const handleEscape = useEffectEvent((e: KeyboardEvent) => {
        if (e.key !== 'Escape' || onBackButtonPressHandler() !== true) {
            return;
        }
        e.stopImmediatePropagation();
    });

    const clearTransitionHandles = () => {
        if (handleRef.current) {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            InteractionManager.clearInteractionHandle(handleRef.current);
            handleRef.current = undefined;
        }
        if (transitionHandleRef.current) {
            TransitionTracker.endTransition(transitionHandleRef.current);
            transitionHandleRef.current = null;
        }
    };

    const onOpenCallBack = () => {
        setModalState('open');
        clearTransitionHandles();
        onModalShow();
    };

    const onCloseCallBack = () => {
        setModalState('closed');
        clearTransitionHandles();

        // Because on Android, the Modal's onDismiss callback does not work reliably. There's a reported issue at:
        // https://stackoverflow.com/questions/58937956/react-native-modal-ondismiss-not-invoked
        // Therefore, we manually call onModalHide() here for Android.
        if (getPlatform() === CONST.PLATFORM.ANDROID) {
            onModalHide();
        }
    };

    // --- Effects ---
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
    }, []);

    useEffect(() => {
        if (modalState === 'opening' || modalState === 'closing') {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            handleRef.current = InteractionManager.createInteractionHandle();
            transitionHandleRef.current = TransitionTracker.startTransition();
        }

        return () => {
            clearTransitionHandles();
        };
    }, [modalState]);

    const fireTransitionCallbacks = useEffectEvent(() => {
        if (modalState === 'opening') {
            onModalWillShow();
        } else if (modalState === 'closing') {
            onModalWillHide();
            blurActiveElement();
        }
    });

    useEffect(() => {
        fireTransitionCallbacks();
    }, [modalState]);

    // Safety net: release handles if the component unmounts mid-transition
    // (e.g. navigation removes the modal before its exit animation completes).
    useEffect(
        () => () => {
            clearTransitionHandles();
        },
        [],
    );

    // --- JSX ---
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

    if (!coverScreen && isVisible) {
        return (
            <View
                pointerEvents="box-none"
                style={[styles.modalBackdrop, styles.modalContainerBox]}
            >
                {hasBackdrop && backdropView}
                {containerView}
            </View>
        );
    }

    // Backdrop stays mounted on web during 'closing' so it can play its own exit animation
    // while the Container is still finishing its exit animation.
    const isBackdropMounted = isVisible || (modalState === 'closing' && getPlatform() === CONST.PLATFORM.WEB);
    const modalVisibility = modalState !== 'closed';

    return (
        <LayoutAnimationConfig skipExiting={getPlatform() !== CONST.PLATFORM.WEB}>
            <Modal
                transparent
                animationType="none"
                visible={modalVisibility}
                // eslint-disable-next-line react-hooks/rules-of-hooks
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
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            >
                {isBackdropMounted && hasBackdrop && backdropView}
                {avoidKeyboard ? (
                    <KeyboardAvoidingView
                        behavior="padding"
                        pointerEvents="box-none"
                        style={[style, {margin: 0}]}
                    >
                        {(modalState === 'opening' || modalState === 'open') && containerView}
                    </KeyboardAvoidingView>
                ) : (
                    <FocusTrapForModal
                        active={modalVisibility}
                        initialFocus={initialFocus}
                        shouldReturnFocus={shouldReturnFocus ?? !shouldEnableNewFocusManagement}
                        shouldPreventScroll={shouldPreventScrollOnFocus}
                    >
                        {(modalState === 'opening' || modalState === 'open') && containerView}
                    </FocusTrapForModal>
                )}
            </Modal>
        </LayoutAnimationConfig>
    );
}

export default ReanimatedModal;
