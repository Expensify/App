import noop from 'lodash/noop';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import type {NativeEventSubscription} from 'react-native';
import {BackHandler, Modal} from 'react-native';
import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal';
import KeyboardAvoidingView from '@components/KeyboardAvoidingView';
import useWindowDimensions from '@hooks/useWindowDimensions';
import getPlatform from '@libs/getPlatform';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import Backdrop from './Backdrop';
import Container from './Container';
import type ReanimatedModalProps from './types';

function ReanimatedModal({
    testID,
    animationInDelay,
    animationInTiming = CONST.MODAL.ANIMATION_TIMING.DEFAULT_IN,
    animationOutTiming = CONST.MODAL.ANIMATION_TIMING.DEFAULT_OUT,
    animationIn = 'fadeIn',
    animationOut = 'fadeOut',
    avoidKeyboard = false,
    children,
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
    ...props
}: ReanimatedModalProps) {
    const {windowWidth, windowHeight} = useWindowDimensions();
    const isModalOpen = useRef(false);

    useEffect(() => {
        if (isVisible) {
            onModalWillShow();
        } else {
            onModalWillHide();
        }
    }, [isVisible, onModalWillShow, onModalWillHide]);

    const backHandlerListener = useRef<NativeEventSubscription | null>(null);

    const onBackButtonPressHandler = useCallback(() => {
        if (shouldIgnoreBackHandlerDuringTransition && !isModalOpen.current) {
            return false;
        }

        if (isVisible) {
            onBackButtonPress();
            return true;
        }
        return false;
    }, [isVisible, onBackButtonPress, shouldIgnoreBackHandlerDuringTransition]);

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
        if (getPlatform() === CONST.PLATFORM.WEB || getPlatform() === CONST.PLATFORM.DESKTOP) {
            document.body.addEventListener('keyup', handleEscape, {capture: true});
        } else {
            backHandlerListener.current = BackHandler.addEventListener('hardwareBackPress', onBackButtonPressHandler);
        }

        return () => {
            if (getPlatform() === CONST.PLATFORM.WEB || getPlatform() === CONST.PLATFORM.DESKTOP) {
                document.body.removeEventListener('keyup', handleEscape, {capture: true});
            } else {
                backHandlerListener.current?.remove();
            }
        };
    }, [handleEscape, onBackButtonPressHandler]);

    const onOpenCallBack = useCallback(() => {
        onModalShow();
        isModalOpen.current = true;
    }, [onModalShow]);

    const onCloseCallBack = useCallback(() => {
        onModalHide();
        onDismiss?.();
        isModalOpen.current = false;
    }, [onDismiss, onModalHide]);

    const backdropStyle = useMemo(() => ({width: windowWidth, height: windowHeight, backgroundColor: backdropColor}), [windowWidth, windowHeight, backdropColor]);

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
            style={backdropStyle}
            customBackdrop={customBackdrop}
            onBackdropPress={onBackdropPress}
            animationInTiming={animationInTiming}
            animationOutTiming={animationOutTiming}
            animationInDelay={animationInDelay}
            backdropOpacity={backdropOpacity}
        />
    );

    return (
        isVisible && (
            <Modal
                transparent
                animationType="none"
                statusBarTranslucent={statusBarTranslucent}
                testID={testID}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            >
                {backdropView}
                {avoidKeyboard ? (
                    <KeyboardAvoidingView
                        behavior="padding"
                        pointerEvents="box-none"
                        style={[style, {margin: 0}]}
                    >
                        {containerView}
                    </KeyboardAvoidingView>
                ) : (
                    <FocusTrapForModal
                        active
                        initialFocus={initialFocus}
                        shouldPreventScroll={shouldPreventScrollOnFocus}
                    >
                        {containerView}
                    </FocusTrapForModal>
                )}
            </Modal>
        )
    );
}

ReanimatedModal.displayName = 'ReanimatedModal';

export default ReanimatedModal;
