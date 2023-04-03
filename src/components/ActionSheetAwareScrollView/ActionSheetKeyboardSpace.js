import React, {
    useContext, useEffect, useState,
} from 'react';
import {Dimensions, Keyboard} from 'react-native';
import Reanimated, {
    useWorkletCallback,
    Easing,
    KeyboardState,
    useAnimatedKeyboard,
    useAnimatedStyle, useDerivedValue, withTiming,
} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styles from '../../styles/styles';
import {Actions, States, ActionSheetAwareScrollViewContext} from './ActionSheetAwareScrollViewContext';

const config = {
    duration: 350,
    easing: Easing.bezier(0.33, 0.01, 0, 1),
};

function ActionSheetKeyboardSpace(props) {
    const safeArea = useSafeAreaInsets();
    const keyboard = useAnimatedKeyboard();

    // similar to using `global` in worklet but it's just a local object
    const [ctx] = useState({});
    const windowHeight = Dimensions.get('screen').height;
    const {
        currentActionSheetState, transitionActionSheetStateWorklet: transition, transitionActionSheetState, resetStateMachine,
    } = useContext(ActionSheetAwareScrollViewContext);

    useEffect(() => {
        // sometimes it might trigger multiple times the same actions
        let lastAction = null;
        const onDidShow = () => {
            if (lastAction === 'keyboardDidShow') {
                return;
            }

            lastAction = 'keyboardDidShow';

            transitionActionSheetState({
                type: Actions.ON_KEYBOARD_OPEN,
            });
        };
        const removeDidShow = Keyboard.addListener('keyboardDidShow', onDidShow);

        const onDidHide = () => {
            if (lastAction === 'keyboardDidHide') {
                return;
            }

            lastAction = 'keyboardDidHide';

            transitionActionSheetState({
                type: Actions.ON_KEYBOARD_CLOSE,
            });
        };
        const removeDidHide = Keyboard.addListener('keyboardDidHide', onDidHide);

        return () => {
            resetStateMachine();

            // We try to use the new API first, but it doesn't work all the time
            // Especially it's bad with hot reloading, so we fallback to the old API
            try {
                removeDidShow();
                removeDidHide();
            } catch (err) {
                Keyboard.removeSubscription(onDidShow);
                Keyboard.removeSubscription(onDidHide);
            }
        };
    }, []);

    // We need this because of the bug in useAnimatedKeyboard.
    // It calls the same state twice which triggers this thing again.
    // This should work after the fix:
    // return withSequence(withTiming(set, {
    //     duration: 0,
    // }), withTiming(animateTo, config));
    const setAndTiming = useWorkletCallback((set, animateTo) => (!ctx.shouldRunAnimation
        ? (() => {
            ctx.shouldRunAnimation = true;
            return set;
        })()
        : withTiming(animateTo, config, () => {
            ctx.shouldRunAnimation = false;
        })));

    const translateY = useDerivedValue(() => {
        const {current, previous} = currentActionSheetState.value;

        // we don't need to run any additional logic
        // it will always return 0 for idle state
        if (current.state === States.IDLE) {
            return 0;
        }

        const keyboardHeight = keyboard.height.value === 0 ? 0 : keyboard.height.value - safeArea.bottom;

        // sometimes we need to know the last keyboard height
        if (keyboard.state.value === KeyboardState.OPEN && keyboardHeight !== 0) {
            ctx.keyboardValue = keyboardHeight;
        }
        const lastKeyboardValue = (ctx.keyboardValue || 0);

        const {popoverHeight, fy, height} = current.payload || {};

        const invertedKeyboardHeight = keyboard.state.value === KeyboardState.CLOSED
            ? lastKeyboardValue
            : 0;

        const elementOffset = (fy + safeArea.top + height)
      - (windowHeight - popoverHeight);

        // when the sate is not idle we know for sure we have previous state
        const previousPayload = previous.payload || {};

        // it will be NaN when we don't have proper payload
        const previousElementOffset = (previousPayload.fy + safeArea.top + previousPayload.height)
      - (windowHeight - previousPayload.popoverHeight);

        // Depending on the current and sometimes previous state we can return
        // either animation or just a value
        switch (current.state) {
            case States.KEYBOARD_OPEN: {
                if (previous.state === States.KEYBOARD_CLOSING_POPOVER) {
                    return withTiming(0, config, () => {
                        transition({
                            type: Actions.END_TRANSITION,
                        });
                    });
                }

                return 0;
            }

            case States.POPOVER_CLOSED:
                return withTiming(0, config, () => {
                    transition({
                        type: Actions.END_TRANSITION,
                    });
                });

            case States.DELETE_MODAL:
            case States.EMOJI_PICKER_POPOVER_OPEN:
            case States.POPOVER_OPEN: {
                if (popoverHeight) {
                    if (Number.isNaN(previousElementOffset) || elementOffset > previousElementOffset) {
                        return withTiming(elementOffset < 0 ? 0 : elementOffset, config);
                    }

                    return previousElementOffset;
                }

                return 0;
            }

            case States.DELETE_MODAL_WITH_KEYBOARD_OPEN:
            case States.EMOJI_PICKER_POPOVER_WITH_KEYBOARD_OPEN: {
            // when item is higher than keyboard and bottom sheet
            // we should just stay in place
                if (elementOffset < 0) {
                    return invertedKeyboardHeight;
                }

                const nextOffset = invertedKeyboardHeight + elementOffset;

                if (previous.payload.popoverHeight !== popoverHeight) {
                    const previousOffset = invertedKeyboardHeight + previousElementOffset;

                    if (Number.isNaN(previousOffset) || nextOffset > previousOffset) {
                        return withTiming(nextOffset, config);
                    }

                    return previousOffset;
                }

                return nextOffset;
            }

            case States.CALL_POPOVER_WITH_KEYBOARD_OPEN:
            case States.EMOJI_PICKER_WITH_KEYBOARD_OPEN: {
                if (keyboard.state.value === KeyboardState.CLOSED) {
                    return lastKeyboardValue;
                }

                return 0;
            }

            case States.CLOSING_KEYBOARD_POPOVER: {
                return keyboardHeight;
            }

            case States.KEYBOARD_CLOSING_POPOVER: {
                if (elementOffset < 0) {
                    return invertedKeyboardHeight;
                }

                if (keyboard.state.value === KeyboardState.CLOSED) {
                    return elementOffset + keyboardHeight;
                }

                return elementOffset;
            }

            case States.KEYBOARD_POPOVER_OPEN: {
                if (keyboard.state.value === KeyboardState.OPEN) {
                    return 0;
                }

                const nextOffset = elementOffset + keyboardHeight;

                if (keyboard.state.value === KeyboardState.CLOSED && nextOffset > invertedKeyboardHeight) {
                    return setAndTiming(keyboardHeight, nextOffset < 0 ? 0 : nextOffset);
                }

                return keyboardHeight;
            }

            default:
                return 0;
        }
    });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{translateY: translateY.value}],
    }));

    // eslint-disable-next-line react/jsx-props-no-spreading
    return <Reanimated.View style={[styles.flex1, animatedStyle]} {...props} />;
}

ActionSheetKeyboardSpace.displayName = 'ReportKeyboardSpace';

export default ActionSheetKeyboardSpace;
