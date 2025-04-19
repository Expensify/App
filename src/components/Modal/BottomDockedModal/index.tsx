import noop from 'lodash/noop';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {NativeEventSubscription, ViewStyle} from 'react-native';
import {BackHandler, DeviceEventEmitter, Dimensions, InteractionManager, KeyboardAvoidingView, Modal, View} from 'react-native';
import {LayoutAnimationConfig} from 'react-native-reanimated';
import useThemeStyles from '@hooks/useThemeStyles';
import getPlatform from '@libs/getPlatform';
import CONST from '@src/CONST';
import Backdrop from './Backdrop';
import Container from './Container';
import type ModalProps from './types';

function BottomDockedModal({
    testID,
    animationInDelay,
    animationInTiming = 300,
    animationOutTiming = 300,
    avoidKeyboard = false,
    coverScreen = true,
    children,
    hasBackdrop = true,
    backdropColor = 'black',
    backdropOpacity = 0.72,
    customBackdrop = null,
    deviceHeight: deviceHeightProp = null,
    deviceWidth: deviceWidthProp = null,
    isVisible = false,
    onModalWillShow = noop,
    onModalShow = noop,
    onModalWillHide = noop,
    onModalHide = noop,
    onDismiss,
    onBackdropPress = noop,
    onBackButtonPress = noop,
    style,
    statusBarTranslucent = false,
    ...props
}: ModalProps) {
    const [isVisibleState, setIsVisibleState] = useState(isVisible);
    const [isContainerOpen, setIsContainerOpen] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [deviceWidth, setDeviceWidth] = useState(() => Dimensions.get('window').width);
    const [deviceHeight, setDeviceHeight] = useState(() => Dimensions.get('window').height);
    const backHandlerListener = useRef<NativeEventSubscription | null>(null);
    const handleRef = useRef<number>();

    const styles = useThemeStyles();

    const handleDimensionsUpdate = useCallback(() => {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (deviceHeightProp || deviceWidthProp) {
            return;
        }

        const deviceWidthTemp = Dimensions.get('window').width;
        const deviceHeightTemp = Dimensions.get('window').height;
        if (deviceWidthTemp !== deviceWidth || deviceHeightTemp !== deviceHeight) {
            setDeviceWidth(deviceWidthTemp);
            setDeviceHeight(deviceHeightTemp);
        }
    }, [deviceWidth, deviceWidthProp, deviceHeight, deviceHeightProp]);

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

    useEffect(() => {
        const deviceEventListener = DeviceEventEmitter.addListener('didUpdateDimensions', handleDimensionsUpdate);
        return () => deviceEventListener.remove();
    }, [handleDimensionsUpdate]);

    useEffect(
        () => () => {
            onModalWillHide();

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
        return {
            width: deviceWidthProp ?? deviceWidth,
            height: deviceHeightProp ?? deviceHeight,
            backgroundColor: backdropColor,
            ...(getPlatform() === CONST.PLATFORM.WEB ? {opacity: backdropOpacity} : {}),
        };
    }, [deviceHeightProp, deviceWidthProp, deviceWidth, deviceHeight, backdropColor, backdropOpacity]);

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
            style={style}
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
        />
    );

    if (!coverScreen && isVisibleState) {
        return (
            <View
                pointerEvents="box-none"
                style={[styles.modalBackdrop, styles.modalContainerBox]}
            >
                {isVisibleState && (
                    <>
                        {hasBackdrop && backdropView}
                        {containerView}
                    </>
                )}
            </View>
        );
    }

    return (
        <LayoutAnimationConfig skipExiting={getPlatform() !== CONST.PLATFORM.WEB}>
            <Modal
                transparent
                animationType="none"
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                visible={isVisibleState || isTransitioning || isContainerOpen !== isVisibleState}
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
                {isVisibleState && hasBackdrop && backdropView}
                {avoidKeyboard ? (
                    <KeyboardAvoidingView
                        behavior="padding"
                        pointerEvents="box-none"
                        style={[style, {margin: 0}]}
                    >
                        {isVisibleState && containerView}
                    </KeyboardAvoidingView>
                ) : (
                    isVisibleState && containerView
                )}
            </Modal>
        </LayoutAnimationConfig>
    );
}

BottomDockedModal.displayName = 'BottomDockedModal';

export default BottomDockedModal;
