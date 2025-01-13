import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {PanResponderInstance, ViewStyle} from 'react-native';
import {Animated, BackHandler, DeviceEventEmitter, Dimensions, KeyboardAvoidingView, Modal, PanResponder, View} from 'react-native';
import {useSharedValue} from 'react-native-reanimated';
import useThemeStyles from '@hooks/useThemeStyles';
import getPlatform from '@libs/getPlatform';
import CONST from '@src/CONST';
import Backdrop from './Backdrop';
import Container from './Container';
import type {EnhancedGestureEvent} from './panResponders';
import {onMoveShouldSetPanResponder, onPanResponderMove, onPanResponderRelease, onStartShouldSetPanResponder} from './panResponders';
import type ModalProps from './types';
import type {AnimationEvent, Direction} from './types';

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
    backdropOpacity = 0.7,
    backdropTransitionInTiming = 300,
    backdropTransitionOutTiming = 300,
    customBackdrop = null,
    deviceHeight: deviceHeightProp = null,
    deviceWidth: deviceWidthProp = null,
    propagateSwipe = false,
    isVisible = false,
    panResponderThreshold = 4,
    swipeThreshold = 100,
    onModalWillShow = () => {},
    onModalShow = () => {},
    onModalWillHide = () => {},
    onModalHide = () => {},
    onDismiss,
    onBackdropPress = () => {},
    onBackButtonPress = () => {},
    style,
    scrollTo = null,
    scrollOffset = 0,
    scrollOffsetMax = 0,
    scrollHorizontal = false,
    onSwipeStart,
    onSwipeMove,
    onSwipeComplete,
    onSwipeCancel,
    statusBarTranslucent = false,
    swipeDirection,
    ...props
}: ModalProps) {
    const [isVisibleState, setIsVisibleState] = useState(isVisible);
    const [isContainerOpen, setIsContainerOpen] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [deviceWidth, setDeviceWidth] = useState(() => Dimensions.get('window').width);
    const [deviceHeight, setDeviceHeight] = useState(() => Dimensions.get('window').height);
    const [pan, setPan] = useState(new Animated.ValueXY());
    const [panResponder, setPanResponder] = useState<PanResponderInstance | null>(null);
    const [inSwipeClosingState, setInSwipeClosingState] = useState(false);

    const styles = useThemeStyles();

    const isSwipeable = !!swipeDirection;
    const currentSwipingDirectionRef = useRef<Direction | null>(null);
    const animEvt = useRef<AnimationEvent | null>(null);
    const yOffset = useSharedValue(0);
    const xOffset = useSharedValue(0);

    const setCurrentSwipingDirection = (direction: Direction | null) => {
        currentSwipingDirectionRef.current = direction;
    };

    const setAnimEvt = (currentAnim: AnimationEvent | null): void => {
        animEvt.current = currentAnim;
    };

    const buildPanResponder = useCallback(() => {
        const gestureProps = {
            propagateSwipe,
            panResponderThreshold,
            swipeThreshold,
            swipeDirection,
            scrollTo,
            scrollOffset,
            scrollOffsetMax,
            scrollHorizontal,
            onSwipeStart,
            onSwipeMove,
            onSwipeComplete,
            onSwipeCancel,
            deviceHeight: deviceHeightProp,
            deviceWidth: deviceWidthProp,
        };

        setPanResponder(
            PanResponder.create({
                onMoveShouldSetPanResponder: onMoveShouldSetPanResponder(gestureProps, setAnimEvt, setCurrentSwipingDirection, pan),
                onStartShouldSetPanResponder: (a, b) => onStartShouldSetPanResponder(gestureProps, setCurrentSwipingDirection)(a as EnhancedGestureEvent, b),
                onPanResponderMove: onPanResponderMove(
                    gestureProps,
                    currentSwipingDirectionRef,
                    setCurrentSwipingDirection,
                    setAnimEvt,
                    animEvt,
                    pan,
                    deviceHeight,
                    deviceWidth,
                    xOffset,
                    yOffset,
                    swipeDirection,
                ),
                onPanResponderRelease: onPanResponderRelease(gestureProps, currentSwipingDirectionRef, setInSwipeClosingState, xOffset, yOffset),
            }),
        );
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

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
        if (isVisible) {
            onBackButtonPress();
            return true;
        }
        return false;
    }, [isVisible, onBackButtonPress]);

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
        if (!isSwipeable) {
            return;
        }

        setPan(new Animated.ValueXY());
        buildPanResponder();
    }, [isSwipeable, buildPanResponder]);

    useEffect(() => {
        const deviceEventListener = DeviceEventEmitter.addListener('didUpdateDimensions', handleDimensionsUpdate);
        if (getPlatform() === CONST.PLATFORM.WEB) {
            document.body.addEventListener('keyup', handleEscape, {capture: true});
        } else {
            BackHandler.addEventListener('hardwareBackPress', onBackButtonPressHandler);
        }

        return () => {
            if (getPlatform() === CONST.PLATFORM.WEB) {
                document.body.removeEventListener('keyup', handleEscape, {capture: true});
            } else {
                BackHandler.removeEventListener('hardwareBackPress', onBackButtonPressHandler);
            }
            deviceEventListener.remove();
        };
    }, [handleDimensionsUpdate, handleEscape, onBackButtonPressHandler]);

    useEffect(() => {
        if (isVisible && !isContainerOpen && !isTransitioning) {
            onModalWillShow();

            setIsVisibleState(true);
            setIsTransitioning(true);
        } else if (!isVisible && isContainerOpen && !isTransitioning) {
            if (inSwipeClosingState) {
                setInSwipeClosingState(false);
            }

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
            opacity: backdropOpacity,
        };
    }, [deviceHeightProp, deviceWidthProp, deviceWidth, deviceHeight, backdropColor, backdropOpacity]);

    const onOpenCallBack = useCallback(() => {
        setIsTransitioning(false);
        setIsContainerOpen(true);
        onModalShow();
    }, [onModalShow]);

    const onCloseCallBack = useCallback(() => {
        setIsTransitioning(false);
        setIsContainerOpen(false);
        if (getPlatform() !== CONST.PLATFORM.IOS) {
            onModalHide();
        }
    }, [onModalHide]);

    const containerView = (
        <Container
            animationInTiming={animationInTiming}
            animationOutTiming={animationOutTiming}
            animationInDelay={animationInDelay}
            style={style}
            panPosition={isSwipeable ? {translateX: xOffset, translateY: yOffset} : undefined}
            pointerEvents="box-none"
            onOpenCallBack={onOpenCallBack}
            onCloseCallBack={onCloseCallBack}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...(isSwipeable && panResponder ? panResponder.panHandlers : {})}
        >
            {children}
        </Container>
    );

    const backdropView = (
        <Backdrop
            style={backdropStyle}
            customBackdrop={customBackdrop}
            hasBackdrop={hasBackdrop}
            onBackdropPress={onBackdropPress}
            animationInTiming={backdropTransitionInTiming}
            animationOutTiming={backdropTransitionOutTiming}
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
                        {backdropView}
                        {containerView}
                    </>
                )}
            </View>
        );
    }

    return (
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
            {isVisibleState && backdropView}

            {avoidKeyboard ? (
                <KeyboardAvoidingView
                    behavior={getPlatform() === CONST.PLATFORM.IOS ? 'padding' : undefined}
                    pointerEvents="box-none"
                    style={[style, {margin: 0}]}
                >
                    {isVisibleState && containerView}
                </KeyboardAvoidingView>
            ) : (
                isVisibleState && containerView
            )}
        </Modal>
    );
}

export default BottomDockedModal;
