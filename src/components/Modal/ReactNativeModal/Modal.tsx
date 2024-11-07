import React, {useCallback, useEffect, useRef, useState} from 'react';
import type {EmitterSubscription, PanResponderInstance} from 'react-native';
import {Animated, BackHandler, DeviceEventEmitter, Dimensions, KeyboardAvoidingView, Modal, PanResponder, Platform, View} from 'react-native';
import Backdrop from './Backdrop';
import Container from './Container';
import styles from './modal.style';
import type {EnhancedGestureEvent} from './panResponders';
import {onMoveShouldSetPanResponder, onPanResponderMove, onPanResponderRelease, onStartShouldSetPanResponder} from './panResponders';
import type ModalProps from './types';
import type {AnimationEvent, Direction} from './types';
import {defaultProps} from './utils';

type TransactionType = 'open' | 'close';

function ReactNativeModal(incomingProps: ModalProps) {
    const {
        animationIn,
        animationOut,
        animationInTiming,
        animationOutTiming,
        backdropTransitionInTiming,
        backdropTransitionOutTiming,
        children,
        coverScreen,
        customBackdrop,
        hasBackdrop,
        backdropColor,
        backdropOpacity,
        useNativeDriver,
        isVisible,
        onBackButtonPress,
        onModalShow,
        testID,
        style,
        avoidKeyboard,
        testName,
        ...props
    } = {
        ...defaultProps,
        ...incomingProps,
    };
    const [measuredHeight, setMeasuredHeight] = useState<number>(0);
    const [showContent, setShowContent] = useState(isVisible);
    const [isVisibleState, setIsVisibleState] = useState(isVisible);
    const [isContainerOpen, setIsContainerOpen] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isHeightCalculated, setIsHeightCalculated] = useState(false);
    const [deviceWidth, setDeviceWidth] = useState(Dimensions.get('window').width);
    const [deviceHeight, setDeviceHeight] = useState(Dimensions.get('window').height);
    const [pan, setPan] = useState<Animated.ValueXY>(new Animated.ValueXY());
    const [panResponder, setPanResponder] = useState<PanResponderInstance | null>(null);
    const [currentSwipingDirection, setCurrentSwipingDirection] = useState<Direction | null>(null);
    const [inSwipeClosingState, setInSwipeClosingState] = useState(false);
    const isSwipeable = !!props.swipeDirection;

    const animEvt = useRef<AnimationEvent | null>(null);

    const setAnimEvt = (currentAnim: AnimationEvent | null): void => {
        animEvt.current = currentAnim;
    };

    const didUpdateDimensionsEmitter = useRef<EmitterSubscription | null>(null);

    const getDeviceHeight = () => props.deviceHeight ?? deviceHeight;
    const getDeviceWidth = () => props.deviceWidth ?? deviceWidth;

    const buildPanResponder = useCallback(() => {
        setPanResponder(
            PanResponder.create({
                onMoveShouldSetPanResponder: onMoveShouldSetPanResponder(props, setAnimEvt, setCurrentSwipingDirection, pan),
                onStartShouldSetPanResponder: (a, b) => onStartShouldSetPanResponder(props, setCurrentSwipingDirection)(a as EnhancedGestureEvent, b),
                onPanResponderMove: onPanResponderMove(props, currentSwipingDirection, setCurrentSwipingDirection, setAnimEvt, animEvt, pan, deviceHeight, deviceWidth),
                onPanResponderRelease: onPanResponderRelease(props, currentSwipingDirection, setInSwipeClosingState, pan),
            }),
        );
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    const handleDimensionsUpdate = () => {
        if (!(!props.deviceHeight && !props.deviceWidth)) {
            return;
        }

        const deviceWidthTemp = Dimensions.get('window').width;
        const deviceHeightTemp = Dimensions.get('window').height;
        if (deviceWidthTemp !== deviceWidth || deviceHeightTemp !== deviceHeight) {
            setDeviceWidth(deviceWidthTemp);
            setDeviceHeight(deviceHeightTemp);
        }
    };

    const onBackButtonPressHandler = () => {
        if (onBackButtonPress && isVisible) {
            onBackButtonPress();
            return true;
        }
        return false;
    };

    const handleTransition = (type: TransactionType, onFinish: () => void) => {
        const shouldAnimate = isVisible !== isContainerOpen;

        if (shouldAnimate && !isTransitioning && isHeightCalculated) {
            setIsTransitioning(true);

            setTimeout(() => {
                setIsContainerOpen(isVisible);
                setIsTransitioning(false);

                onFinish();
            }, 300);
            // TODO: type === 'open' ? animationInTiming : animationOutTiming,
        }
    };

    // TODO: VERIFY THAT OPEN() LOGIC IS WORKING PROPERLY
    const open = () => {
        if (isTransitioning) {
            return;
        }
        // TODO: Could certainly be improved - no idea for the moment.
        if (isSwipeable) {
            pan.setValue?.({x: 0, y: 0});
        }

        if (props.onModalWillShow) {
            props.onModalWillShow();
        }
        setIsVisibleState(true);
        setShowContent(true);
        handleTransition('open', () => {
            if (!isVisible) {
                setIsContainerOpen(false);
            } else {
                onModalShow();
            }
        });
    };

    // TODO: VERIFY THAT CLOSE() LOGIC WORKS PROPERLY
    const close = () => {
        if (isTransitioning) {
            return;
        }

        if (inSwipeClosingState) {
            setInSwipeClosingState(false);
        }

        if (props.onModalWillHide) {
            props.onModalWillHide();
        }

        setIsVisibleState(false);
        handleTransition('close', () => {
            if (isVisible) {
                setIsContainerOpen(true);
            } else {
                setShowContent(false);
                setMeasuredHeight(0);
                setIsHeightCalculated(false);
                props.onModalHide();
            }
        });
    };

    // TODO: this was a constructor - verify if it works
    useEffect(() => {
        if (!isSwipeable) {
            return;
        }

        setPan(new Animated.ValueXY());
        buildPanResponder();
    }, [isSwipeable, buildPanResponder]);

    useEffect(() => {
        didUpdateDimensionsEmitter.current = DeviceEventEmitter.addListener('didUpdateDimensions', handleDimensionsUpdate);
        BackHandler.addEventListener('hardwareBackPress', onBackButtonPressHandler);

        return () => {
            BackHandler.removeEventListener('hardwareBackPress', onBackButtonPressHandler);
            if (didUpdateDimensionsEmitter.current) {
                didUpdateDimensionsEmitter.current.remove();
            }
            if (isVisibleState) {
                props.onModalHide();
            }
        };
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // TODO: CHECK THIS LOGIC - maybe add handling for prevProps?
        if (isVisible && !isContainerOpen && !isTransitioning) {
            open();
        } else if (!isVisible && isContainerOpen && !isTransitioning) {
            close();
        }
        // TODO: verify if this dependency array is OK
    }, [isVisible, isContainerOpen, isHeightCalculated]);

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const {propagateSwipe: _, ...otherProps} = props;

    const computedStyle = [{margin: getDeviceWidth() * 0.05}, styles.content, style];

    // FIXME: RESTORE PAN POSITION & OTHER LOGIC HERE
    let panPosition = {};
    if (isSwipeable && panResponder) {
        if (useNativeDriver) {
            panPosition = {
                transform: pan.getTranslateTransform(),
            };
        } else {
            panPosition = pan.getLayout();
        }
    }

    const containerView = (
        <Container
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...(isSwipeable && panResponder ? panResponder.panHandlers : {})}
            panHandlers={panResponder?.panHandlers}
            isVisible={isVisibleState}
            style={[panPosition, computedStyle]}
            pointerEvents="box-none"
            useNativeDriver={useNativeDriver}
            isHeightCalculated={isHeightCalculated}
            toggleCalculatedHeight={setIsHeightCalculated}
            isContainerOpen={isContainerOpen}
            isTransitioning={isTransitioning}
            setMeasuredHeight={setMeasuredHeight}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
        >
            {children}
        </Container>
    );

    if (!coverScreen && isVisibleState) {
        return (
            <View
                pointerEvents="box-none"
                style={[styles.backdrop, styles.containerBox]}
            >
                <Backdrop
                    getDeviceWidth={getDeviceWidth}
                    getDeviceHeight={getDeviceHeight}
                    backdropColor={testName === 'AttachmentPicker' ? 'red' : backdropColor}
                    customBackdrop={customBackdrop}
                    hasBackdrop={hasBackdrop}
                    isVisible={isVisibleState}
                    isTransitioning={isTransitioning}
                    backdropOpacity={backdropOpacity}
                    onBackdropPress={props.onBackdropPress}
                />
                {containerView}
            </View>
        );
    }

    return (
        <Modal
            transparent
            animationType="none"
            visible={isVisibleState || isTransitioning || isContainerOpen !== isVisibleState}
            onRequestClose={onBackButtonPress}
            testID={testID}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
        >
            <Backdrop
                getDeviceWidth={getDeviceWidth}
                getDeviceHeight={getDeviceHeight}
                backdropColor={testName === 'AttachmentPicker' ? 'red' : backdropColor}
                customBackdrop={customBackdrop}
                hasBackdrop={hasBackdrop}
                isVisible={isVisibleState}
                isTransitioning={isTransitioning}
                backdropOpacity={backdropOpacity}
                onBackdropPress={props.onBackdropPress}
            />

            {avoidKeyboard ? (
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    pointerEvents="box-none"
                    style={computedStyle.concat([{margin: 0}])}
                >
                    {containerView}
                </KeyboardAvoidingView>
            ) : (
                containerView
            )}
        </Modal>
    );
}

export default ReactNativeModal;
