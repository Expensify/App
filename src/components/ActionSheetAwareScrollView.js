import React, {
    useContext, useEffect,
    createContext, forwardRef, useCallback, useMemo,
} from 'react';
import PropTypes from 'prop-types';
import {Dimensions, Keyboard, ScrollView} from 'react-native';
import Reanimated, {
    runOnUI,
    useSharedValue,
    useWorkletCallback,
    Easing,
    KeyboardState,
    useAnimatedKeyboard,
    useAnimatedStyle, useDerivedValue, withSequence, withTiming,
} from 'react-native-reanimated';
import {makeRemote} from 'react-native-reanimated/src/reanimated2/core';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import getComponentDisplayName from '../libs/getComponentDisplayName';

function useStateMachine(stateMachine, initialState) {
    const currentState = useSharedValue(initialState);

    const transitionWorklet = useWorkletCallback((action) => {
        if (!action) {
            throw new Error('state machine action is required');
        }

        const state = currentState.value;

        // uncomment for debugging
        // console.log('Current STATE: ', state.current.state);
        // console.log('Next ACTION: ', action.type, action.payload);

        const nextMachine = stateMachine[state.current.state];

        if (!nextMachine) {
            // console.log('No next machine found for state: ', state.current.state);
            return;
        }

        const nextState = nextMachine[action.type];

        if (!nextState) {
            // console.log('No next state found for action: ', action.type);
            return;
        }

        // eslint-disable-next-line no-nested-ternary
        const nextPayload = typeof action.payload === 'undefined' ? state.current.payload : nextState === state.current.state ? {
            ...state.current.payload,
            ...action.payload,
        } : action.payload;

        // console.log('Next STATE: ', nextState, nextPayload);

        currentState.value = {
            previous: state.current,
            current: {
                state: nextState,
                payload: nextPayload,
            },
        };
    });

    const transition = useCallback((action) => {
        runOnUI(transitionWorklet)(action);
    }, []);

    return {
        currentState,
        transitionWorklet,
        transition,
    };
}

const ActionSheetAwareScrollViewContext = createContext();

const stateMachine = {
    idle: {
        POPOVER_OPEN: 'popoverOpen',
        ON_KEYBOARD_OPEN: 'keyboardOpen',
        MEASURE_POPOVER: 'idle',
        OPEN_EMOJI_PICKER_POPOVER: 'emojiPickerPopoverOpen',
    },
    popoverOpen: {
        CLOSE_POPOVER: 'popoverClosed',
        MEASURE_POPOVER: 'popoverOpen',
        OPEN_EMOJI_PICKER_POPOVER: 'emojiPickerPopoverOpen',
        POPOVER_ANY_ACTION: 'popoverClosed',
        HIDE_WITHOUT_ANIMATION: 'idle',
        EDIT_REPORT: 'edit',
    },
    edit: {
        CLOSE_POPOVER: 'edit',
        END_TRANSITION: 'idle',
    },
    popoverClosed: {
        END_TRANSITION: 'idle',
    },
    emojiPickerPopoverOpen: {
        MEASURE_EMOJI_PICKER_POPOVER: 'emojiPickerPopoverOpen',
        CLOSE_EMOJI_PICKER_POPOVER: 'popoverClosed',
    },
    keyboardOpen: {
        ON_KEYBOARD_OPEN: 'keyboardOpen',
        POPOVER_OPEN: 'keyboardPopoverOpen',
        OPEN_EMOJI_PICKER_POPOVER_STANDALONE: 'emojiPickerWithKeyboardOpen',
        ON_KEYBOARD_CLOSE: 'idle',
    },
    keyboardPopoverOpen: {
        MEASURE_POPOVER: 'keyboardPopoverOpen',
        CLOSE_POPOVER: 'keyboardClosingPopover',
    },
    emojiPickerWithKeyboardOpen: {
        MEASURE_EMOJI_PICKER_POPOVER: 'emojiPickerWithKeyboardOpen',
        CLOSE_EMOJI_PICKER_POPOVER_STANDALONE: 'closingStandaloneEmojiPicker',
    },
    closingStandaloneEmojiPicker: {
        ON_KEYBOARD_OPEN: 'keyboardOpen',
    },
    keyboardClosingPopover: {
        END_TRANSITION: 'keyboardOpen',
        ON_KEYBOARD_OPEN: 'keyboardOpen',
    },
};

function ActionSheetAwareScrollViewProvider(props) {
    const {currentState, transition, transitionWorklet} = useStateMachine(stateMachine, {
        previous: null,
        current: {
            state: 'idle',
            payload: null,
        },
    });

    const value = useMemo(() => ({
        currentActionSheetState: currentState,
        transitionActionSheetState: transition,
        transitionActionSheetStateWorklet: transitionWorklet,
    }), []);

    return (
        <ActionSheetAwareScrollViewContext.Provider
            value={value}
        >
            {props.children}
        </ActionSheetAwareScrollViewContext.Provider>
    );
}

function withActionSheetAwareScrollViewContext(WrappedComponent) {
    const WithActionSheetAwareScrollViewContext = forwardRef((props, ref) => (
        <ActionSheetAwareScrollViewContext.Consumer>
            {context => (
                // eslint-disable-next-line react/jsx-props-no-spreading
                <WrappedComponent {...context} {...props} ref={ref} />
            )}
        </ActionSheetAwareScrollViewContext.Consumer>
    ));

    WithActionSheetAwareScrollViewContext.displayName = `withActionSheetAwareScrollViewContext(${getComponentDisplayName(WrappedComponent)})`;

    return WithActionSheetAwareScrollViewContext;
}

const ReportKeyboardSpace = (props) => {
    const safeArea = useSafeAreaInsets();
    const keyboard = useAnimatedKeyboard();
    const ctx = useMemo(() => makeRemote({}), []);
    const windowHeight = Dimensions.get('screen').height;
    const {currentActionSheetState, transitionActionSheetStateWorklet: transition, transitionActionSheetState} = useContext(ActionSheetAwareScrollViewContext);

    useEffect(() => {
        let lastAction = null;
        const removeDidShow = Keyboard.addListener('keyboardDidShow', () => {
            if (lastAction === 'keyboardDidShow') {
                return;
            }

            lastAction = 'keyboardDidShow';

            transitionActionSheetState({
                type: 'ON_KEYBOARD_OPEN',
            });
        });

        const removeDidHide = Keyboard.addListener('keyboardDidHide', () => {
            if (lastAction === 'keyboardDidHide') {
                return;
            }

            lastAction = 'keyboardDidHide';

            transitionActionSheetState({
                type: 'ON_KEYBOARD_CLOSE',
            });
        });

        return () => {
            try {
                removeDidShow();
                removeDidHide();
            } catch (err) {
                // noop so Hot reloading doesn't break
            }
        };
    }, []);

    const config = {
        duration: 350,
        easing: Easing.bezier(0.33, 0.01, 0, 1),
    };

    const translateY = useDerivedValue(() => {
        let lastKeyboardValue;

        if (keyboard.state.value === KeyboardState.OPEN && keyboard.height.value !== 0) {
            ctx.keyboardValue = keyboard.height.value;
        } else {
            lastKeyboardValue = ctx.keyboardValue || 0;
        }

        const {current, previous} = currentActionSheetState.value;

        const {popoverHeight, fy, height} = current.payload || {};

        switch (current.state) {
            case 'idle':
                return 0;

            case 'keyboardOpen': {
                if (previous.state === 'keyboardClosingPopover') {
                    return withTiming(0, config, () => {
                        transition({
                            type: 'END_TRANSITION',
                        });
                    });
                }

                return 0;
            }

            case 'popoverClosed':
                return withTiming(0, config, () => {
                    transition({
                        type: 'END_TRANSITION',
                    });
                });

            case 'emojiPickerPopoverOpen':
            case 'popoverOpen': {
                if (popoverHeight) {
                    const offset = popoverHeight - (windowHeight - fy - safeArea.top)
                        + height;

                    return withTiming(offset < 0 ? 0 : offset, config);
                }

                return 0;
            }

            case 'edit': {
                const offset = popoverHeight - (windowHeight - fy - safeArea.top)
                    + height + safeArea.bottom;

                return withSequence(withTiming(offset - keyboard.height.value, {
                    duration: 0,
                }), withTiming(0, {
                    ...config,
                    duration: 400,
                }, () => {
                    transition({
                        type: 'END_TRANSITION',
                    });
                }));
            }

            case 'emojiPickerWithKeyboardOpen': {
                if (keyboard.state.value === KeyboardState.CLOSED) {
                    return lastKeyboardValue;
                }

                return 0;
            }

            case 'closingStandaloneEmojiPicker': {
                return keyboard.height.value;
            }

            case 'keyboardClosingPopover': {
                const offset = popoverHeight
                    - (windowHeight - fy - safeArea.top)
                    - safeArea.bottom
                    + height;

                if (offset < 0) {
                    const invertedHeight = keyboard.state.value === KeyboardState.CLOSED
                        ? lastKeyboardValue - safeArea.bottom
                        : 0;

                    return invertedHeight;
                }

                if (keyboard.state.value === KeyboardState.CLOSED) {
                    return offset + keyboard.height.value;
                }

                return offset;
            }

            case 'keyboardPopoverOpen': {
                if (keyboard.state.value === KeyboardState.OPEN) {
                    return 0;
                }

                const keyboardHeight = keyboard.height.value;

                const invertedHeight = keyboard.state.value === KeyboardState.CLOSED
                    ? keyboardHeight - safeArea.bottom
                    : 0;

                const offset = popoverHeight
                    - (windowHeight - fy - safeArea.top)
                    - safeArea.bottom
                    + height
                    + keyboardHeight;

                if (keyboard.state.value === KeyboardState.CLOSED && offset > invertedHeight) {
                    // we need this because of the bug in useAnimatedKeyboard
                    // it calls the same state twice which triggers this thing again
                    return !global.spacer_shouldRunSpring
                        ? (() => {
                            global.spacer_shouldRunSpring = true;
                            return keyboardHeight;
                        })()
                        : withTiming(offset < 0 ? 0 : offset, config, () => {
                            global.spacer_shouldRunSpring = false;
                        });

                    // this should work after the fix
                    // return withSequence(withTiming(keyboardHeight, {
                    //     duration: 0,
                    // }), withTiming(offset < 0 ? 0 : offset, config));
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

    return <Reanimated.View style={[{flex: 1}, animatedStyle]} {...props} />;
};

ReportKeyboardSpace.displayName = 'ReportKeyboardSpace';

export default function ActionSheetAwareScrollView(props) {
    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <ScrollView {...props}>
            <ReportKeyboardSpace ref={props.keyboardSpacerRef}>
                {props.children}
            </ReportKeyboardSpace>
        </ScrollView>
    );
}

ActionSheetAwareScrollView.propTypes = {
    children: PropTypes.node.isRequired,
    keyboardSpacerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object])
        .isRequired,
};

export {
    ActionSheetAwareScrollViewProvider,
    ActionSheetAwareScrollViewContext,
    withActionSheetAwareScrollViewContext,
};
