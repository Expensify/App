import React, {useContext, useState, useEffect, useCallback} from 'react';
import Reanimated, {
    KeyboardState,
    useAnimatedStyle,
    useDerivedValue,
    withSpring,
    useAnimatedReaction,
    runOnJS,
    withSequence,
    withTiming,
    useSharedValue,
    withDelay,
} from 'react-native-reanimated';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useThemeStyles from '@hooks/useThemeStyles';

import { useKeyboardHandler } from 'react-native-keyboard-controller';
import useWindowDimensions from '@hooks/useWindowDimensions';

import {Actions, States, ActionSheetAwareScrollViewContext} from './ActionSheetAwareScrollViewContext';

const useAnimatedKeyboard2 = () => {
    const state = useSharedValue(KeyboardState.UNKNOWN);
    const height = useSharedValue(0);
    const heightWhenOpened = useSharedValue(0);

    useKeyboardHandler({
        onStart: (e) => {
            "worklet";

            // save the last height before dismiss
            if (e.height === 0) {
                heightWhenOpened.value = height.value;
            }

            console.log("onStart", e, new Date().getTime());

            if (e.height > 0) {
                state.value = KeyboardState.OPENING;
            } else {
                state.value = KeyboardState.CLOSING;
            }
        },
        onMove: (e) => {
            "worklet";

            console.log("onMove", e, new Date().getTime());

            height.value = e.height;
        },
        onEnd: (e) => {
            "worklet";

            console.log("onEnd", e, new Date().getTime());

            if (e.height > 0) {
                state.value = KeyboardState.OPEN;
            } else {
                state.value = KeyboardState.CLOSED;
            }

            height.value = e.height;
        },
    }, []);

    return { state, height, heightWhenOpened };
};

const config = {
    mass: 3,
    stiffness: 1000,
    damping: 500,
};

function ActionSheetKeyboardSpace(props) {
    const styles = useThemeStyles();
    const safeArea = useSafeAreaInsets();
    const keyboard = useAnimatedKeyboard2();

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
            console.log("TRANSITION #21", 0);
            return 0;
        }

        const keyboardHeight = keyboard.height.value === 0 ? 0 : keyboard.height.value - safeArea.bottom;
console.log("ActionSheetKeyboardSpace", {keyboardHeight, hook: keyboard.height.value});
        // sometimes we need to know the last keyboard height
        if (keyboard.state.value === KeyboardState.OPEN && keyboardHeight !== 0) {
            console.log("update keyboard height", keyboardHeight);
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
                console.log({prevState: previous.state});
                if (previous.state === States.KEYBOARD_CLOSED_POPOVER) {
                    // return withSpring(0, config, () => {
                    //     transition({
                    //         type: Actions.END_TRANSITION,
                    //     });
                    // });
                    console.log("TRANSITION #3 -> withTiming(elementOffset + invertedKeyboardHeight, {", { elementOffset, invertedKeyboardHeight });
                    // return 374;
                    return withSequence(
                        withTiming(elementOffset + invertedKeyboardHeight, {
                            duration: 0,
                        }),
                        withSpring(0, config, () => {
                            transition({type: Actions.END_TRANSITION});
                        }),
                    );
                }

                console.log("TRANSITION #4 -> withSpring(0, config)")
                return withSpring(0, config);
                // return 0;
            }

            case States.POPOVER_CLOSED: {
                console.log("TRANSITION #5 -> withSpring(0, config");
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
                    if (Number.isNaN(previousElementOffset) || elementOffset > previousElementOffset) {
                        console.log("TRANSITION #6", elementOffset);
                        return withSpring(elementOffset < 0 ? 0 : elementOffset, config);
                    }

                    console.log("TRANSITION #7", Math.max(previousElementOffset, 0));
                    return withSpring(Math.max(previousElementOffset, 0), config);
                }

                console.log("TRANSITION #8 -> 0");
                return 0;
            }

            case States.MODAL_WITH_KEYBOARD_OPEN_DELETED:
            case States.EMOJI_PICKER_POPOVER_WITH_KEYBOARD_OPEN: {
                // when item is higher than keyboard and bottom sheet
                // we should just stay in place
                if (elementOffset < 0) {
                    console.log("TRANSITION #9", invertedKeyboardHeight);
                    return invertedKeyboardHeight;
                }

                const nextOffset = invertedKeyboardHeight + elementOffset;

                if (previous.payload.popoverHeight !== popoverHeight) {
                    const previousOffset = invertedKeyboardHeight + previousElementOffset;

                    if (Number.isNaN(previousOffset) || nextOffset > previousOffset) {
                        console.log("TRANSITION #10 -> ", nextOffset);
                        return withSpring(nextOffset, config);
                    }

                    console.log("TRANSITION #11 -> ", previousOffset);
                    return previousOffset;
                }

                console.log("TRANSITION #12 -> ", nextOffset);
                return nextOffset;
            }

            case States.ATTACHMENTS_POPOVER_WITH_KEYBOARD_OPEN:
            case States.CALL_POPOVER_WITH_KEYBOARD_OPEN:
            case States.EMOJI_PICKER_WITH_KEYBOARD_OPEN: {
                if (keyboard.state.value === KeyboardState.CLOSED) {
                    console.log("TRANSITION #14 -> ", lastKeyboardHeight, new Date().getTime());
                    return lastKeyboardHeight;
                    // return 451;
                    // return withTiming(lastKeyboardHeight, {duration: 250});
                    return withSequence(
                        // artificial delay for one frame, because `paddingBottom` in KAV is updated only in next frame
                        withTiming(0, {
                            duration: 8,
                        }),
                        withTiming(lastKeyboardHeight, {
                            duration: 0,
                        }),
                    );
                    // return lastKeyboardHeight;
                    /*console.log("TRANSITION #13 ->", 0);
                    return 0;*/
                }

                /*console.log("TRANSITION #14 -> ", lastKeyboardHeight);
                return lastKeyboardHeight;*/
                console.log("TRANSITION #13 ->", 0);
                return 0;
            }

            case States.KEYBOARD_POPOVER_CLOSED: {
                // transition({type: Actions.END_TRANSITION});
                console.log("TRANSITION #15 -> ", lastKeyboardHeight, {keyboard: keyboard.height.value, lastKeyboardHeight});
                if (keyboard.heightWhenOpened.value === keyboard.height.value) {
                    return 0;
                    /*return withSequence(
                        // artificial delay for one frame, because `paddingBottom` in KAV is updated only in next frame
                        withTiming(keyboard.heightWhenOpened.value - safeArea.bottom, {
                            duration: 8,
                        }),
                        withTiming(0, {
                            duration: 0,
                        }),
                    );*/
                }

                return keyboard.heightWhenOpened.value - safeArea.bottom;
            }

            case States.KEYBOARD_POPOVER_OPEN: {
                if (keyboard.state.value === KeyboardState.OPEN) {
                    console.log("TRANSITION #16 -> 0");
                    return 0;
                }

                const nextOffset = elementOffset + lastKeyboardHeight;

                console.log({elementOffset, keyboardHeight1: lastKeyboardHeight, state: keyboard.state.value, nextOffset});

                if (keyboard.state.value === KeyboardState.CLOSED && nextOffset > invertedKeyboardHeight) {
                    console.log("TRANSITION #17", lastKeyboardHeight, nextOffset < 0 ? 0 : nextOffset);
                    return setAndTiming(lastKeyboardHeight, nextOffset < 0 ? 0 : nextOffset);
                }

                console.log("TRANSITION #18 -> ", lastKeyboardHeight);
                return lastKeyboardHeight;
            }

            case States.KEYBOARD_CLOSED_POPOVER: {
                if (elementOffset < 0) {
                    transition({type: Actions.END_TRANSITION});
                    console.log("TRANSITION #19 -> ", invertedKeyboardHeight);
                    return invertedKeyboardHeight;
                }

                if (keyboard.state.value === KeyboardState.CLOSED) {
                    console.log("TRANSITION #1 -> ", {keyboardHeight, lastKeyboardHeight, elementOffset});
                    return elementOffset + lastKeyboardHeight;
                }

                console.log("TRANSITION #2 -> ", {keyboardHeight, lastKeyboardHeight, elementOffset});
                // return elementOffset;
                // return 374;
                return withSequence(
                    withTiming(elementOffset + lastKeyboardHeight, {
                        duration: 0,
                    }),
                    /*withTiming(
                        elementOffset,
                        {
                            duration: 0,
                        },
                        () => {
                            transition({type: Actions.END_TRANSITION});
                        },
                    ),*/
                );
            }

            default:
                console.log("TRANSITION #20 -> 0");
                return 0;
        }
    });

    const animatedStyle = useAnimatedStyle(() => console.log("translateY", translateY.value, new Date().getTime()) || ({
        // transform: [{translateY: translateY.value}],
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
