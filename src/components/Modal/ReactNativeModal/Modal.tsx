import React, {useCallback, useEffect, useRef, useState} from 'react';
import type {EmitterSubscription, PanResponderGestureState, PanResponderInstance} from 'react-native';
import {Animated, BackHandler, DeviceEventEmitter, Dimensions, KeyboardAvoidingView, Modal, PanResponder, Platform, View} from 'react-native';
import Backdrop from './Backdrop';
import Container from './Container';
import styles from './modal.style';
import {shouldPropagateSwipe} from './panHandlers';
import {onMoveShouldSetPanResponder, onPanResponderMove, onPanResponderRelease} from './panResponders';
import type ModalProps from './types';
import type {AnimationEvent, Direction, OrNull} from './types';
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
    const [currentSwipingDirection, setCurrentSwipingDirection] = useState<OrNull<Direction>>(null);
    const [inSwipeClosingState, setInSwipeClosingState] = useState(false);
    const isSwipeable = !!props.swipeDirection;

    const animEvt = useRef<AnimationEvent | null>(null);

    const setAnimEvt = (currentAnim: AnimationEvent | null): void => {
        animEvt.current = currentAnim;
    };

    const didUpdateDimensionsEmitter = useRef<EmitterSubscription | null>(null);

    const getDeviceHeight = () => props.deviceHeight || deviceHeight;
    const getDeviceWidth = () => props.deviceWidth || deviceWidth;

    const buildPanResponder = useCallback(() => {
        setPanResponder(
            PanResponder.create({
                onMoveShouldSetPanResponder: onMoveShouldSetPanResponder(props, setAnimEvt, setCurrentSwipingDirection, pan),
                onStartShouldSetPanResponder: (e: any, gestureState: PanResponderGestureState) => {
                    const hasScrollableView = e._dispatchInstances ?? e._dispatchInstances.some((instance: any) => /scrollview|flatlist/i.test(instance.type));

                    if (hasScrollableView && shouldPropagateSwipe(e, gestureState) && props.scrollTo && props.scrollOffset > 0) {
                        return false;
                    }
                    if (props.onSwipeStart) {
                        props.onSwipeStart(gestureState);
                    }

                    setCurrentSwipingDirection(null);
                    return true;
                },
                onPanResponderMove: onPanResponderMove(props, currentSwipingDirection, setCurrentSwipingDirection, setAnimEvt, animEvt, pan, deviceHeight, deviceWidth),
                onPanResponderRelease: onPanResponderRelease(props, currentSwipingDirection, setInSwipeClosingState, pan),
            }),
        );
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
        // const isReadyToAnimate = isHeightCalculated && measuredHeight !== 0;
        // console.log(testName, ' Modal: HandleTransition', isTransitioning);
        // // console.log('handleTransition', shouldAnimate, isReadyToAnimate);

        if (shouldAnimate && !isTransitioning && isHeightCalculated) {
            // if (isReadyToAnimate && shouldAnimate && !isTransitioning) {
            setIsTransitioning(true);

            // console.log(testName, ' Modal: setting timeout');
            setTimeout(() => {
                setIsContainerOpen(isVisible);
                setIsTransitioning(false);

                // console.log(testName, ' Modal: Timeout Finished', isVisible, isVisibleState, isContainerOpen, isTransitioning);
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

        // This is for resetting the pan position,otherwise the modal gets stuck
        // at the last released position when you try to open it.
        // TODO: Could certainly be improved - no idea for the moment.
        if (isSwipeable) {
            pan.setValue?.({x: 0, y: 0});
        }

        if (props.onModalWillShow) {
            // console.log(testName, ' Modal: open() -> onModalWillShow()');
            props.onModalWillShow();
        }
        // console.log(testName, ' Modal: open() -> setIsVisibleState(true)');
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
        // console.log(testName, ' Modal: close()');
        if (isTransitioning) {
            return;
        }

        if (inSwipeClosingState) {
            setInSwipeClosingState(false);
        }

        if (props.onModalWillHide) {
            // console.log(testName, ' Modal: close() -> onModalWillHide()');
            props.onModalWillHide();
        }

        // console.log(testName, ' Modal: close() -> setIsVisibleState(false)');
        setIsVisibleState(false);
        handleTransition('close', () => {
            if (isVisible) {
                setIsContainerOpen(true);
            } else {
                // console.log(testName, ' Modal: onModalHide()');
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
        // console.log(testName, ' Modal: Mounted');
        didUpdateDimensionsEmitter.current = DeviceEventEmitter.addListener('didUpdateDimensions', handleDimensionsUpdate);
        BackHandler.addEventListener('hardwareBackPress', onBackButtonPressHandler);

        return () => {
            // console.log(testName, ' Modal: UnMounted');
            BackHandler.removeEventListener('hardwareBackPress', onBackButtonPressHandler);
            if (didUpdateDimensionsEmitter.current) {
                didUpdateDimensionsEmitter.current.remove();
            }
            if (isVisibleState) {
                // console.log(testName, ' Modal: useEffect(()=>{}) -> onModalHide()');
                props.onModalHide();
            }
        };
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // TODO: CHECK THIS LOGIC - maybe add handling for prevProps?
        if (isVisible && !isContainerOpen && !isTransitioning) {
            // console.log(testName, ' Modal: useEffect(()=>{}, [isVisible]) -> open()');
            open();
        } else if (!isVisible && isContainerOpen && !isTransitioning) {
            // console.log(testName, ' Modal: useEffect(()=>{}, [isVisible]) -> close()');
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
            // ref={(ref) => (this.contentRef = ref)}
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
            {/* {props.hideModalContentWhileAnimating && useNativeDriver && !showContent ? <View /> : children} */}
        </Container>
    );

    // If coverScreen is set to false by the user
    // we render the modal inside the parent view directly
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
