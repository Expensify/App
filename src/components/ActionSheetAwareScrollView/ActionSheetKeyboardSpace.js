import React, {useContext, useState, useEffect, useCallback} from 'react';
import Reanimated, {
    KeyboardState,
    useAnimatedKeyboard,
    useAnimatedStyle,
    useDerivedValue,
    withSpring,
    useAnimatedReaction,
    runOnJS,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useThemeStyles from '@hooks/useThemeStyles';

import useWindowDimensions from '../../hooks/useWindowDimensions';

import {Actions, States, ActionSheetAwareScrollViewContext} from './ActionSheetAwareScrollViewContext';

const config = {
    mass: 3,
    stiffness: 1000,
    damping: 500,
};

function ActionSheetKeyboardSpace(props) {
    const styles = useThemeStyles();
    const safeArea = useSafeAreaInsets();
    const keyboard = useAnimatedKeyboard();

    // similar to using `global` in worklet but it's just a local object
    const [syncLocalWorkletState] = useState({
        shouldRunAnimation: false,
        lastKeyboardHeight: 0,
    });
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

    // We need this because of the bug in useAnimatedKeyboard.
    // It calls the same state twice which triggers this thing again.
    // This should work after the fix:
    // return withSequence(withTiming(set, {
    //     duration: 0,
    // }), withSpring(animateTo, config));
    const setAndTiming = useCallback((set, animateTo) => {
        "worklet";

        return !syncLocalWorkletState.shouldRunAnimation
            ? (() => {
                  syncLocalWorkletState.shouldRunAnimation = true;
                  return set;
              })()
            : withSpring(animateTo, config, () => {
                  syncLocalWorkletState.shouldRunAnimation = false;
              });
        }
    );

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
            syncLocalWorkletState.lastKeyboardHeight = keyboardHeight;
        }
        const lastKeyboardHeight = syncLocalWorkletState.lastKeyboardHeight;

        const {popoverHeight, fy, height} = current.payload || {};

        const invertedKeyboardHeight = keyboard.state.value === KeyboardState.CLOSED ? lastKeyboardHeight : 0;

        const elementOffset = fy + safeArea.top + height - (windowHeight - popoverHeight);

        // when the sate is not idle we know for sure we have previous state
        const previousPayload = previous.payload || {};

        // it will be NaN when we don't have proper payload
        const previousElementOffset = previousPayload.fy + safeArea.top + previousPayload.height - (windowHeight - previousPayload.popoverHeight);

        // Depending on the current and sometimes previous state we can return
        // either animation or just a value
        switch (current.state) {
            case States.KEYBOARD_OPEN: {
                if (previous.state === States.KEYBOARD_CLOSED_POPOVER) {
                    // return withSpring(0, config, () => {
                    //     transition({
                    //         type: Actions.END_TRANSITION,
                    //     });
                    // });
                    return withSequence(
                        withTiming(elementOffset + invertedKeyboardHeight, {
                            duration: 0,
                        }),
                        withSpring(0, config, () => {
                            transition({type: Actions.END_TRANSITION});
                        }),
                    );
                }

                return 0;
            }

            case States.POPOVER_CLOSED:
                return withSpring(0, config, () => {
                    transition({
                        type: Actions.END_TRANSITION,
                    });
                });

            case States.MODAL_DELETED:
            case States.EMOJI_PICKER_POPOVER_OPEN:
            case States.POPOVER_OPEN: {
                if (popoverHeight) {
                    if (Number.isNaN(previousElementOffset) || elementOffset > previousElementOffset) {
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

                if (previous.payload.popoverHeight !== popoverHeight) {
                    const previousOffset = invertedKeyboardHeight + previousElementOffset;

                    if (Number.isNaN(previousOffset) || nextOffset > previousOffset) {
                        return withSpring(nextOffset, config);
                    }

                    return previousOffset;
                }

                return nextOffset;
            }

            case States.ATTACHMENTS_POPOVER_WITH_KEYBOARD_OPEN:
            case States.CALL_POPOVER_WITH_KEYBOARD_OPEN:
            case States.EMOJI_PICKER_WITH_KEYBOARD_OPEN: {
                if (keyboard.state.value === KeyboardState.OPEN) {
                    return 0;
                }

                return lastKeyboardHeight;
            }

            case States.KEYBOARD_POPOVER_CLOSED: {
                transition({type: Actions.END_TRANSITION});
                return invertedKeyboardHeight;
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

            case States.KEYBOARD_CLOSED_POPOVER: {
                if (elementOffset < 0) {
                    transition({type: Actions.END_TRANSITION});
                    return invertedKeyboardHeight;
                }

                if (keyboard.state.value === KeyboardState.CLOSED) {
                    return elementOffset + keyboardHeight;
                }

                // return elementOffset;
                return withSequence(
                    withTiming(elementOffset + lastKeyboardHeight, {
                        duration: 0,
                    }),
                    withTiming(
                        elementOffset,
                        {
                            duration: 0,
                        },
                        () => {
                            transition({type: Actions.END_TRANSITION});
                        },
                    ),
                );
            }

            default:
                return 0;
        }
    });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{translateY: translateY.value}],
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
