import noop from 'lodash/noop';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {NativeEventSubscription, ViewStyle} from 'react-native';
import {BackHandler, Dimensions, InteractionManager, Modal, View} from 'react-native';
import {LayoutAnimationConfig} from 'react-native-reanimated';
import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal';
import KeyboardAvoidingView from '@components/KeyboardAvoidingView';
import useThemeStyles from '@hooks/useThemeStyles';
import getPlatform from '@libs/getPlatform';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import Backdrop from './Backdrop';
import Container from './Container';
import type ReanimatedModalProps from './types';
import type {AnimationInType, AnimationOutType} from './types';

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
    ...props
}: ReanimatedModalProps) {
    const [isVisibleState, setIsVisibleState] = useState(isVisible);
    const [isContainerOpen, setIsContainerOpen] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const backHandlerListener = useRef<NativeEventSubscription | null>(null);
    const handleRef = useRef<number | undefined>(undefined);

    const styles = useThemeStyles();

    const onBackButtonPressHandler = useCallback(() => {
        if (isVisibleState) {
            onBackButtonPress();
            return true;
        }
        return false;
    }, [isVisibleState, onBackButtonPress]);

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

    useEffect(
        () => () => {
            if (handleRef.current) {
                InteractionManager.clearInteractionHandle(handleRef.current);
            }

            setIsVisibleState(false);
            setIsContainerOpen(false);
        },
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
        [],
    );

    useEffect(() => {
        if (isVisible && !isContainerOpen && !isTransitioning) {
            handleRef.current = InteractionManager.createInteractionHandle();
            onModalWillShow();

            setIsVisibleState(true);
            setIsTransitioning(true);
        } else if (!isVisible && isContainerOpen && !isTransitioning) {
            handleRef.current = InteractionManager.createInteractionHandle();
            onModalWillHide();

            setIsVisibleState(false);
            setIsTransitioning(true);
        }
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [isVisible, isContainerOpen, isTransitioning]);

    const backdropStyle: ViewStyle = useMemo(() => {
        const {width, height} = Dimensions.get('screen');
        return {width, height, backgroundColor: backdropColor};
    }, [backdropColor]);

    const onOpenCallBack = useCallback(() => {
        setIsTransitioning(false);
        setIsContainerOpen(true);
        if (handleRef.current) {
            InteractionManager.clearInteractionHandle(handleRef.current);
        }
        onModalShow();
    }, [onModalShow]);

    const onCloseCallBack = useCallback(() => {
        setIsTransitioning(false);
        setIsContainerOpen(false);
        if (handleRef.current) {
            InteractionManager.clearInteractionHandle(handleRef.current);
        }
        if (getPlatform() !== CONST.PLATFORM.IOS) {
            onModalHide();
        }
    }, [onModalHide]);

    const containerView = (
        <Container
            pointerEvents="box-none"
            animationInTiming={animationInTiming}
            animationOutTiming={animationOutTiming}
            animationInDelay={animationInDelay}
            onOpenCallBack={onOpenCallBack}
            onCloseCallBack={onCloseCallBack}
            animationIn={animationIn as AnimationInType}
            animationOut={animationOut as AnimationOutType}
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
                pointerEvents="box-none"
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
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                visible={modalVisibility}
                onRequestClose={onBackButtonPress}
                statusBarTranslucent={statusBarTranslucent}
                testID={testID}
                onDismiss={() => {
                    onDismiss?.();
                    if (getPlatform() === CONST.PLATFORM.IOS) {
                        onModalHide();
                    }
                }}
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
                        {isVisibleState && containerView}
                    </KeyboardAvoidingView>
                ) : (
                    <FocusTrapForModal
                        active={modalVisibility}
                        initialFocus={initialFocus}
                        shouldPreventScroll={shouldPreventScrollOnFocus}
                    >
                        {isVisibleState && containerView}
                    </FocusTrapForModal>
                )}
            </Modal>
        </LayoutAnimationConfig>
    );
}

ReanimatedModal.displayName = 'ReanimatedModal';

export default ReanimatedModal;
