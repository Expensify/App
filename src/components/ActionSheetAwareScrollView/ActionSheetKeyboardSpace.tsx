import React, {useContext, useEffect} from 'react';
import type {ViewProps} from 'react-native';
import {useKeyboardHandler} from 'react-native-keyboard-controller';
import type {SharedValue} from 'react-native-reanimated';
import Reanimated, {useAnimatedReaction, useAnimatedStyle, useDerivedValue, useSharedValue, withSpring, withTiming} from 'react-native-reanimated';
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

                // Save the last keyboard height
                if (e.height !== 0) {
                    heightWhenOpened.set(e.height);
                    height.set(0);
                }
                height.set(heightWhenOpened.get());
                lastHeight.set(e.height);
                state.set(e.height > 0 ? KeyboardState.OPENING : KeyboardState.CLOSING);
            },
            onMove: (e) => {
                'worklet';

                height.set(e.height);
            },
            onEnd: (e) => {
                'worklet';

                state.set(e.height > 0 ? KeyboardState.OPEN : KeyboardState.CLOSED);
                height.set(e.height);
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

type ActionSheetKeyboardSpaceProps = ViewProps & {
    /** scroll offset of the parent ScrollView */
    position: SharedValue<number>;
};

function ActionSheetKeyboardSpace(props: ActionSheetKeyboardSpaceProps) {
    const styles = useThemeStyles();
    const safeArea = useSafeAreaPaddings();
    const keyboard = useAnimatedKeyboard();
    const {position} = props;

    // Similar to using `global` in worklet but it's just a local object
    const syncLocalWorkletState = useSharedValue(KeyboardState.UNKNOWN);
    const {windowHeight} = useWindowDimensions();
    const {currentActionSheetState, transitionActionSheetStateWorklet: transition, resetStateMachine} = useContext(ActionSheetAwareScrollViewContext);

    // Reset state machine when component unmounts
    // eslint-disable-next-line arrow-body-style
    useEffect(() => {
        return () => resetStateMachine();
    }, [resetStateMachine]);

    useAnimatedReaction(
        () => keyboard.state.get(),
        (lastState) => {
            if (lastState === syncLocalWorkletState.get()) {
                return;
            }
            // eslint-disable-next-line react-compiler/react-compiler
            syncLocalWorkletState.set(lastState);

            if (lastState === KeyboardState.OPEN) {
                transition({type: Actions.OPEN_KEYBOARD});
            } else if (lastState === KeyboardState.CLOSED) {
                transition({type: Actions.CLOSE_KEYBOARD});
            }
        },
        [],
    );

    const translateY = useDerivedValue(() => {
        const {current, previous} = currentActionSheetState.get();

        // We don't need to run any additional logic. it will always return 0 for idle state
        if (current.state === States.IDLE) {
            return withSpring(0, SPRING_CONFIG);
        }

        const keyboardHeight = keyboard.height.get() === 0 ? 0 : keyboard.height.get() - safeArea.bottom;

        // Sometimes we need to know the last keyboard height
        const lastKeyboardHeight = keyboard.heightWhenOpened.get() - safeArea.bottom;
        const {popoverHeight = 0, fy, height} = current.payload ?? {};
        const invertedKeyboardHeight = keyboard.state.get() === KeyboardState.CLOSED ? lastKeyboardHeight : 0;
        const elementOffset = fy !== undefined && height !== undefined && popoverHeight !== undefined ? fy + safeArea.top + height - (windowHeight - popoverHeight) : 0;

        // when the state is not idle we know for sure we have the previous state
        const previousPayload = previous.payload ?? {};
        const previousElementOffset =
            previousPayload.fy !== undefined && previousPayload.height !== undefined && previousPayload.popoverHeight !== undefined
                ? previousPayload.fy + safeArea.top + previousPayload.height - (windowHeight - previousPayload.popoverHeight)
                : 0;

        const isOpeningKeyboard = syncLocalWorkletState.get() === 1;
        const isClosingKeyboard = syncLocalWorkletState.get() === 3;
        const isClosedKeyboard = syncLocalWorkletState.get() === 4;

        // Depending on the current and sometimes previous state we can return
        // either animation or just a value
        switch (current.state) {
            case States.KEYBOARD_OPEN: {
                if (isClosedKeyboard || isOpeningKeyboard) {
                    return lastKeyboardHeight - keyboardHeight;
                }
                if (previous.state === States.KEYBOARD_CLOSED_POPOVER || (previous.state === States.KEYBOARD_OPEN && elementOffset < 0)) {
                    return Math.max(keyboard.heightWhenOpened.get() - keyboard.height.get() - safeArea.bottom, 0) + Math.max(elementOffset, 0);
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
                if (keyboard.state.get() === KeyboardState.OPEN) {
                    return withSpring(0, SPRING_CONFIG);
                }

                const nextOffset = elementOffset + lastKeyboardHeight;

                if (keyboard.state.get() === KeyboardState.CLOSED && nextOffset > invertedKeyboardHeight) {
                    return withSpring(nextOffset < 0 ? 0 : nextOffset, SPRING_CONFIG);
                }

                if (elementOffset < 0) {
                    return isClosingKeyboard ? 0 : lastKeyboardHeight + Math.min(elementOffset + position.get(), 0);
                }

                return lastKeyboardHeight;
            }

            case States.KEYBOARD_CLOSED_POPOVER: {
                if (elementOffset < 0) {
                    transition({type: Actions.END_TRANSITION});

                    return 0;
                }

                if (keyboard.state.get() === KeyboardState.CLOSED) {
                    return elementOffset + lastKeyboardHeight;
                }

                if (keyboard.height.get() > 0) {
                    return keyboard.heightWhenOpened.get() - keyboard.height.get() + elementOffset;
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
        paddingTop: translateY.get(),
    }));

    return (
        <Reanimated.View
            style={[styles.flex1, animatedStyle]}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

ActionSheetKeyboardSpace.displayName = 'ActionSheetKeyboardSpace';

export default ActionSheetKeyboardSpace;
