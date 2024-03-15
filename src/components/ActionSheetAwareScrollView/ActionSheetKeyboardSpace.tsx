import React, {useContext, useEffect, useRef} from 'react';
import type {ViewProps} from 'react-native';
import {useKeyboardHandler} from 'react-native-keyboard-controller';
import Reanimated, {interpolate, runOnJS, useAnimatedReaction, useAnimatedStyle, useDerivedValue, useSharedValue, withSequence, withSpring, withTiming} from 'react-native-reanimated';
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

const useAnimatedKeyboard = () => {
    const state = useSharedValue(KeyboardState.UNKNOWN);
    const height = useSharedValue(0);
    const progress = useSharedValue(0);
    const heightWhenOpened = useSharedValue(0);

    useKeyboardHandler(
        {
            onStart: (e) => {
                'worklet';

                // save the last keyboard height
                if (e.height === 0) {
                    heightWhenOpened.value = height.value;
                }

                if (e.height > 0) {
                    state.value = KeyboardState.OPENING;
                } else {
                    state.value = KeyboardState.CLOSING;
                }
            },
            onMove: (e) => {
                'worklet';

                progress.value = e.progress;
                height.value = e.height;
            },
            onEnd: (e) => {
                'worklet';

                if (e.height > 0) {
                    state.value = KeyboardState.OPEN;
                } else {
                    state.value = KeyboardState.CLOSED;
                }

                height.value = e.height;
                progress.value = e.progress;
            },
        },
        [],
    );

    return {state, height, heightWhenOpened, progress};
};

const setInitialValueAndRunAnimation = (value: number, animation: number) => {
    'worklet';

    return withSequence(withTiming(value, {duration: 0}), animation);
};

const useSafeAreaPaddings = () => {
    const StyleUtils = useStyleUtils();
    const insets = useSafeAreaInsets();
    const {paddingTop, paddingBottom} = StyleUtils.getSafeAreaPadding(insets ?? undefined);

    return {top: paddingTop, bottom: paddingBottom};
};

const config = {
    mass: 3,
    stiffness: 1000,
    damping: 500,
};

function ActionSheetKeyboardSpace(props: ViewProps) {
    const styles = useThemeStyles();
    const safeArea = useSafeAreaPaddings();
    const keyboard = useAnimatedKeyboard();

    // similar to using `global` in worklet but it's just a local object
    const syncLocalWorkletState = useRef({
        lastState: KeyboardState.UNKNOWN,
    }).current;
    const {windowHeight} = useWindowDimensions();
    const {currentActionSheetState, transitionActionSheetStateWorklet: transition, transitionActionSheetState, resetStateMachine} = useContext(ActionSheetAwareScrollViewContext);

    // Reset state machine when component unmounts
    useEffect(() => () => resetStateMachine(), [resetStateMachine]);

    useAnimatedReaction(
        () => keyboard.state.value,
        (lastState) => {
            if (lastState === syncLocalWorkletState.lastState) {
                return;
            }

            syncLocalWorkletState.lastState = lastState;

            if (lastState === KeyboardState.OPEN) {
                runOnJS(transitionActionSheetState)({
                    type: Actions.OPEN_KEYBOARD,
                });
            } else if (lastState === KeyboardState.CLOSED) {
                runOnJS(transitionActionSheetState)({
                    type: Actions.CLOSE_KEYBOARD,
                });
            }
        },
        [],
    );

    const translateY = useDerivedValue(() => {
        const {current, previous} = currentActionSheetState.value;

        // we don't need to run any additional logic
        // it will always return 0 for idle state
        if (current.state === States.IDLE) {
            return withSpring(0, config);
        }

        const keyboardHeight = keyboard.height.value === 0 ? 0 : keyboard.height.value - safeArea.bottom;
        // sometimes we need to know the last keyboard height
        const lastKeyboardHeight = keyboard.heightWhenOpened.value - safeArea.bottom;

        const {popoverHeight = 0, fy, height, composerHeight = 0} = current.payload ?? {};

        const invertedKeyboardHeight = keyboard.state.value === KeyboardState.CLOSED ? lastKeyboardHeight : 0;

        const elementOffset = fy !== undefined && height !== undefined && popoverHeight !== undefined ? fy + safeArea.top + height - (windowHeight - popoverHeight) : 0;

        // when the sate is not idle we know for sure we have previous state
        const previousPayload = previous.payload ?? {};

        const previousElementOffset =
            previousPayload.fy !== undefined && previousPayload.height !== undefined && previousPayload.popoverHeight !== undefined
                ? previousPayload.fy + safeArea.top + previousPayload.height - (windowHeight - previousPayload.popoverHeight)
                : 0;

        // Depending on the current and sometimes previous state we can return
        // either animation or just a value
        switch (current.state) {
            case States.KEYBOARD_OPEN: {
                if (previous.state === States.KEYBOARD_CLOSED_POPOVER) {
                    return Math.max(keyboard.heightWhenOpened.value - keyboard.height.value - safeArea.bottom, 0) + Math.max(elementOffset, 0);
                }

                return withSpring(0, config);
            }

            case States.POPOVER_CLOSED: {
                return withSpring(0, config, () => {
                    transition({
                        type: Actions.END_TRANSITION,
                    });
                });
            }

            case States.MODAL_DELETED:
            case States.EMOJI_PICKER_POPOVER_OPEN:
            case States.POPOVER_OPEN: {
                if (popoverHeight) {
                    if (previousElementOffset !== 0 || elementOffset > previousElementOffset) {
                        return withSpring(elementOffset < 0 ? 0 : elementOffset, config);
                    }

                    return withSpring(Math.max(previousElementOffset, 0), config);
                }

                return 0;
            }

            case States.MODAL_WITH_KEYBOARD_OPEN_DELETED:
            case States.EMOJI_PICKER_POPOVER_WITH_KEYBOARD_OPEN: {
                // when item is higher than keyboard and bottom sheet
                // we should just stay in place
                if (elementOffset < 0) {
                    return invertedKeyboardHeight;
                }

                const nextOffset = invertedKeyboardHeight + elementOffset;
                if (previous?.payload?.popoverHeight !== popoverHeight) {
                    const previousOffset = invertedKeyboardHeight + previousElementOffset;

                    if (previousElementOffset === 0 || nextOffset > previousOffset) {
                        return withSpring(nextOffset, config);
                    }

                    return previousOffset;
                }

                return nextOffset;
            }

            case States.ATTACHMENTS_POPOVER_WITH_KEYBOARD_CLOSED:
            case States.ATTACHMENTS_POPOVER_WITH_KEYBOARD_OPEN: {
                return interpolate(keyboard.progress.value, [0, 1], [popoverHeight - composerHeight, 0]);
            }
            case States.CALL_POPOVER_WITH_KEYBOARD_OPEN: {
                if (keyboard.height.value > 0) {
                    return 0;
                }

                return setInitialValueAndRunAnimation(lastKeyboardHeight, withSpring(popoverHeight - composerHeight, config));
            }
            case States.CALL_POPOVER_WITH_KEYBOARD_CLOSED: {
                // keyboard is opened
                if (keyboard.height.value > 0) {
                    return 0;
                }

                return withSpring(lastKeyboardHeight, config);
            }
            case States.EMOJI_PICKER_WITH_KEYBOARD_OPEN: {
                if (keyboard.state.value === KeyboardState.CLOSED) {
                    return popoverHeight - composerHeight;
                }

                return 0;
            }

            case States.KEYBOARD_POPOVER_CLOSED: {
                if (keyboard.heightWhenOpened.value === keyboard.height.value) {
                    return 0;
                }

                return popoverHeight - composerHeight;
            }

            case States.KEYBOARD_POPOVER_OPEN: {
                if (keyboard.state.value === KeyboardState.OPEN) {
                    return 0;
                }

                const nextOffset = elementOffset + lastKeyboardHeight;

                if (keyboard.state.value === KeyboardState.CLOSED && nextOffset > invertedKeyboardHeight) {
                    return withSpring(nextOffset < 0 ? 0 : nextOffset, config);
                }

                if (elementOffset < 0) {
                    return lastKeyboardHeight - keyboardHeight;
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
