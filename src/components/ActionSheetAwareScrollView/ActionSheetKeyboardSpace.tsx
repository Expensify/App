import React, {useContext, useEffect} from 'react';
import type {ViewProps} from 'react-native';
import {useKeyboardHandler} from 'react-native-keyboard-controller';
import Reanimated, {runOnJS, useAnimatedReaction, useAnimatedStyle, useDerivedValue, useSharedValue, withSpring, withTiming} from 'react-native-reanimated';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {Actions, ActionSheetAwareScrollViewContext, States} from './ActionSheetAwareScrollViewContext';

const KeyboardState = {
    UNKNOWN: 0,
    OPENING: 1,
    OPEN: 2,
    CLOSING: 3,
    CLOSED: 4,
};

const SPRING_CONFIG = {
    mass: 3,
    stiffness: 1000,
    damping: 500,
};

const useAnimatedKeyboard = () => {
    const state = useSharedValue(KeyboardState.UNKNOWN);
    const height = useSharedValue(0);
    const lastHeight = useSharedValue(0);
    const heightWhenOpened = useSharedValue(0);

    useKeyboardHandler(
        {
            onStart: (e) => {
                'worklet';

                // save the last keyboard height
                if (e.height !== 0) {
                    // eslint-disable-next-line react-compiler/react-compiler
                    heightWhenOpened.value = e.height;
                    height.value = 0;
                }
                height.value = heightWhenOpened.value;
                lastHeight.value = e.height;
                state.value = e.height > 0 ? KeyboardState.OPENING : KeyboardState.CLOSING;
            },
            onMove: (e) => {
                'worklet';

                height.value = e.height;
            },
            onEnd: (e) => {
                'worklet';

                state.value = e.height > 0 ? KeyboardState.OPEN : KeyboardState.CLOSED;
                height.value = e.height;
            },
        },
        [],
    );

    return {state, height, heightWhenOpened};
};

const useSafeAreaPaddings = () => {
    const StyleUtils = useStyleUtils();
    const insets = useSafeAreaInsets();
    const {paddingTop, paddingBottom} = StyleUtils.getSafeAreaPadding(insets ?? undefined);

    return {top: paddingTop, bottom: paddingBottom};
};

function ActionSheetKeyboardSpace(props: ViewProps) {
    const styles = useThemeStyles();
    const safeArea = useSafeAreaPaddings();
    const keyboard = useAnimatedKeyboard();

    // similar to using `global` in worklet but it's just a local object
    const syncLocalWorkletStateL = useSharedValue(KeyboardState.UNKNOWN);
    const {windowHeight} = useWindowDimensions();
    const {currentActionSheetState, transitionActionSheetStateWorklet: transition, transitionActionSheetState, resetStateMachine} = useContext(ActionSheetAwareScrollViewContext);

    // Reset state machine when component unmounts
    // eslint-disable-next-line arrow-body-style
    useEffect(() => {
        return () => resetStateMachine();
    }, [resetStateMachine]);

    useAnimatedReaction(
        () => keyboard.state.value,
        (lastState) => {
            if (lastState === syncLocalWorkletStateL.value) {
                return;
            }
            // eslint-disable-next-line react-compiler/react-compiler
            syncLocalWorkletStateL.value = lastState;

            if (lastState === KeyboardState.OPEN) {
                runOnJS(transitionActionSheetState)({type: Actions.OPEN_KEYBOARD});
            } else if (lastState === KeyboardState.CLOSED) {
                runOnJS(transitionActionSheetState)({type: Actions.CLOSE_KEYBOARD});
            }
        },
        [],
    );

    const translateY = useDerivedValue(() => {
        const {current, previous} = currentActionSheetState.value;

        // we don't need to run any additional logic
        // it will always return 0 for idle state
        if (current.state === States.IDLE) {
            return withSpring(0, SPRING_CONFIG);
        }

        const keyboardHeight = keyboard.height.value === 0 ? 0 : keyboard.height.value - safeArea.bottom;
        // sometimes we need to know the last keyboard height
        const lastKeyboardHeight = keyboard.heightWhenOpened.value - safeArea.bottom;
        const {popoverHeight = 0, fy, height} = current.payload ?? {};
        const invertedKeyboardHeight = keyboard.state.value === KeyboardState.CLOSED ? lastKeyboardHeight : 0;
        const elementOffset = fy !== undefined && height !== undefined && popoverHeight !== undefined ? fy + safeArea.top + height - (windowHeight - popoverHeight) : 0;
        // when the sate is not idle we know for sure we have previous state
        const previousPayload = previous.payload ?? {};
        const previousElementOffset =
            previousPayload.fy !== undefined && previousPayload.height !== undefined && previousPayload.popoverHeight !== undefined
                ? previousPayload.fy + safeArea.top + previousPayload.height - (windowHeight - previousPayload.popoverHeight)
                : 0;

        const isOpeningKeyboard = syncLocalWorkletStateL.value === 1;
        const isClosingKeyboard = syncLocalWorkletStateL.value === 3;
        const isClosedKeyboard = syncLocalWorkletStateL.value === 4;
        // Depending on the current and sometimes previous state we can return
        // either animation or just a value
        switch (current.state) {
            case States.KEYBOARD_OPEN: {
                if (isClosedKeyboard || isOpeningKeyboard) {
                    return lastKeyboardHeight - keyboardHeight;
                }
                if (previous.state === States.KEYBOARD_CLOSED_POPOVER || (previous.state === States.KEYBOARD_OPEN && elementOffset < 0)) {
                    return Math.max(keyboard.heightWhenOpened.value - keyboard.height.value - safeArea.bottom, 0) + Math.max(elementOffset, 0);
                }
                return withSpring(0, SPRING_CONFIG);
            }

            case States.POPOVER_CLOSED: {
                return withSpring(0, SPRING_CONFIG, () => {
                    transition({
                        type: Actions.END_TRANSITION,
                    });
                });
            }

            case States.POPOVER_OPEN: {
                if (popoverHeight) {
                    if (previousElementOffset !== 0 || elementOffset > previousElementOffset) {
                        return withSpring(elementOffset < 0 ? 0 : elementOffset, SPRING_CONFIG);
                    }

                    return withSpring(Math.max(previousElementOffset, 0), SPRING_CONFIG);
                }

                return 0;
            }

            case States.KEYBOARD_POPOVER_OPEN: {
                if (keyboard.state.value === KeyboardState.OPEN) {
                    return withSpring(0, SPRING_CONFIG);
                }

                const nextOffset = elementOffset + lastKeyboardHeight;

                if (keyboard.state.value === KeyboardState.CLOSED && nextOffset > invertedKeyboardHeight) {
                    return withSpring(nextOffset < 0 ? 0 : nextOffset, SPRING_CONFIG);
                }

                if (elementOffset < 0) {
                    return isClosingKeyboard ? 0 : lastKeyboardHeight - keyboardHeight;
                }

                return lastKeyboardHeight;
            }

            case States.KEYBOARD_CLOSED_POPOVER: {
                if (elementOffset < 0) {
                    transition({type: Actions.END_TRANSITION});

                    return 0;
                }

                if (keyboard.state.value === KeyboardState.CLOSED) {
                    return elementOffset + lastKeyboardHeight;
                }

                if (keyboard.height.value > 0) {
                    return keyboard.heightWhenOpened.value - keyboard.height.value + elementOffset;
                }

                return withTiming(elementOffset + lastKeyboardHeight, {
                    duration: 0,
                });
            }

            default:
                return 0;
        }
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        paddingTop: translateY.value,
    }));

    return (
        <Reanimated.View
            style={[styles.flex1, animatedStyle]}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

ActionSheetKeyboardSpace.displayName = 'ReportKeyboardSpace';

export default ActionSheetKeyboardSpace;
