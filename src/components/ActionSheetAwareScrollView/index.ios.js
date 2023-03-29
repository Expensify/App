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
    useAnimatedStyle, useDerivedValue, withTiming, runOnJS,
} from 'react-native-reanimated';
import {makeRemote} from 'react-native-reanimated/src/reanimated2/core';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import getComponentDisplayName from '../../libs/getComponentDisplayName';
import styles from '../../styles/styles';
import Log from '../../libs/Log';

// When you need to debug state machine change this to true
const DEBUG_MODE = false;

function log(message, params) {
    'worklet';

    if (DEBUG_MODE) {
        runOnJS(Log.info)(`[StateMachine] ${message}`, false, params);
    }
}

/**
 * A hook that creates a state machine that can be used with Reanimated Worklets.
 * You can transition state from worklet or from the JS thread.
 *
 * State machines are helpful for managing complex UI interactions. We want to transition
 * between states based on user actions. But also we want to ignore some actions
 * when we are in certain states.
 *
 * For example:
 * 1. Initial state is idle. It can react to KEYBOARD_OPEN action.
 * 2. We open emoji picker. It sends EMOJI_PICKER_OPEN action.
 * 2. There is no handling for this action in idle state so we do nothing.
 * 3. We close emoji picker and it sends EMOJI_PICKER_CLOSE action which again does nothing.
 * 4. We open keyboard. It sends KEYBOARD_OPEN action. idle can react to this action
 * by transitioning into keyboardOpen state
 * 5. Our state is keyboardOpen. It can react to KEYBOARD_CLOSE, EMOJI_PICKER_OPEN actions
 * 6. We open emoji picker again. It sends EMOJI_PICKER_OPEN action which transitions our state
 * into emojiPickerOpen state. Now we react only to EMOJI_PICKER_CLOSE action.
 * 7. Before rendering the emoji picker, the app hides the keyboard.
 * It sends KEYBOARD_CLOSE action. But we ignore it since our emojiPickerOpen state can only handle
 * EMOJI_PICKER_CLOSE action. so we write the logic for handling hiding the keyboard
 * but maintaining the offset based on the keyboard state shared value
 * 7. we close the picker and send EMOJI_PICKER_CLOSE action which transitions us back into keyboardOpen state.
 *
 * State machine object example:
 * const stateMachine = {
 *   idle: {
 *       KEYBOARD_OPEN: 'keyboardOpen',
 *   },
 *   keyboardOpen: {
 *       KEYBOARD_CLOSE: 'idle',
 *       EMOJI_PICKER_OPEN: 'emojiPickerOpen',
 *   },
 *   emojiPickerOpen: {
 *       EMOJI_PICKER_CLOSE: 'keyboardOpen',
 *   },
 * }
 *
 * Initial state example:
 * {
 *     previous: null,
 *     current: {
 *         state: 'idle',
 *         payload: null,
 *     },
 * }
 *
 * @param {Object} stateMachine - a state machine object
 * @param {Object} initialState - the initial state of the state machine
 * @returns {Object} - an object containing the current state, a transition function, and a reset function
 */
function useStateMachine(stateMachine, initialState) {
    const currentState = useSharedValue(initialState);

    const transitionWorklet = useWorkletCallback((action) => {
        if (!action) {
            throw new Error('state machine action is required');
        }

        const state = currentState.value;

        log(`Current STATE: ${state.current.state}`);
        log(`Next ACTION: ${action.type}`, action.payload);

        const nextMachine = stateMachine[state.current.state];

        if (!nextMachine) {
            log(`No next machine found for state: ${state.current.state}`);
            return;
        }

        const nextState = nextMachine[action.type];

        if (!nextState) {
            log(`No next state found for action: ${action.type}`);
            return;
        }

        // eslint-disable-next-line no-nested-ternary
        const nextPayload = typeof action.payload === 'undefined' ? state.current.payload : nextState === state.current.state ? {
            ...state.current.payload,
            ...action.payload,
        } : action.payload;

        log(`Next STATE: ${nextState}`, nextPayload);

        currentState.value = {
            previous: state.current,
            current: {
                state: nextState,
                payload: nextPayload,
            },
        };
    });

    const resetWorklet = useWorkletCallback(() => {
        log('RESET STATE MACHINE');
        currentState.value = initialState;
    }, []);

    const reset = useCallback(() => {
        runOnUI(resetWorklet)();
    }, []);

    const transition = useCallback((action) => {
        runOnUI(transitionWorklet)(action);
    }, []);

    return {
        currentState,
        transitionWorklet,
        transition,
        reset,
        resetWorklet,
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
        EDIT_REPORT: 'idle',
        SHOW_DELETE_CONFIRM_MODAL: 'deleteModal',
    },
    popoverClosed: {
        END_TRANSITION: 'idle',
    },
    emojiPickerPopoverOpen: {
        MEASURE_EMOJI_PICKER_POPOVER: 'emojiPickerPopoverOpen',
        CLOSE_EMOJI_PICKER_POPOVER: 'popoverClosed',
    },
    deleteModal: {
        MEASURE_CONFIRM_MODAL: 'deleteModal',
        CLOSE_CONFIRM_MODAL: 'popoverClosed',
    },
    keyboardOpen: {
        ON_KEYBOARD_OPEN: 'keyboardOpen',
        POPOVER_OPEN: 'keyboardPopoverOpen',
        OPEN_EMOJI_PICKER_POPOVER: 'keyboardPopoverOpen',
        OPEN_EMOJI_PICKER_POPOVER_STANDALONE: 'emojiPickerWithKeyboardOpen',
        ON_KEYBOARD_CLOSE: 'idle',
    },
    keyboardPopoverOpen: {
        MEASURE_POPOVER: 'keyboardPopoverOpen',
        CLOSE_POPOVER: 'keyboardClosingPopover',
        CLOSE_EMOJI_PICKER_POPOVER: 'keyboardClosingPopover',
        MEASURE_EMOJI_PICKER_POPOVER: 'keyboardPopoverOpen',
        OPEN_EMOJI_PICKER_POPOVER: 'emojiPickerPopoverWithKeyboardOpen',
        SHOW_DELETE_CONFIRM_MODAL: 'deleteModalWithKeyboardOpen',
    },
    deleteModalWithKeyboardOpen: {
        MEASURE_CONFIRM_MODAL: 'deleteModalWithKeyboardOpen',
        CLOSE_CONFIRM_MODAL: 'keyboardClosingPopover',
    },
    emojiPickerPopoverWithKeyboardOpen: {
        MEASURE_EMOJI_PICKER_POPOVER: 'emojiPickerPopoverWithKeyboardOpen',
        CLOSE_EMOJI_PICKER_POPOVER: 'keyboardClosingPopover',
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

const config = {
    duration: 350,
    easing: Easing.bezier(0.33, 0.01, 0, 1),
};

function ReportKeyboardSpace(props) {
    const safeArea = useSafeAreaInsets();
    const keyboard = useAnimatedKeyboard();

    // makeRemote makes an object that can be used on the UI thread
    // similar to using `global` in worklet but it's just a local object
    const ctx = useMemo(() => makeRemote({}), []);
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
                type: 'ON_KEYBOARD_OPEN',
            });
        };
        const removeDidShow = Keyboard.addListener('keyboardDidShow', onDidShow);

        const onDidHide = () => {
            if (lastAction === 'keyboardDidHide') {
                return;
            }

            lastAction = 'keyboardDidHide';

            transitionActionSheetState({
                type: 'ON_KEYBOARD_CLOSE',
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
        if (current.state === 'idle') {
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

            case 'deleteModal':
            case 'emojiPickerPopoverOpen':
            case 'popoverOpen': {
                if (popoverHeight) {
                    if (Number.isNaN(previousElementOffset) || elementOffset > previousElementOffset) {
                        return withTiming(elementOffset < 0 ? 0 : elementOffset, config);
                    }

                    return previousElementOffset;
                }

                return 0;
            }

            case 'deleteModalWithKeyboardOpen':
            case 'emojiPickerPopoverWithKeyboardOpen': {
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

            case 'emojiPickerWithKeyboardOpen': {
                if (keyboard.state.value === KeyboardState.CLOSED) {
                    return lastKeyboardValue;
                }

                return 0;
            }

            case 'closingStandaloneEmojiPicker': {
                return keyboardHeight;
            }

            case 'keyboardClosingPopover': {
                if (elementOffset < 0) {
                    return invertedKeyboardHeight;
                }

                if (keyboard.state.value === KeyboardState.CLOSED) {
                    return elementOffset + keyboardHeight;
                }

                return elementOffset;
            }

            case 'keyboardPopoverOpen': {
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

ReportKeyboardSpace.displayName = 'ReportKeyboardSpace';

function ActionSheetAwareScrollViewProvider(props) {
    const {
        currentState, transition, transitionWorklet, reset,
    } = useStateMachine(stateMachine, {
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
        resetStateMachine: reset,
    }), []);

    return (
        <ActionSheetAwareScrollViewContext.Provider
            value={value}
        >
            {props.children}
        </ActionSheetAwareScrollViewContext.Provider>
    );
}

ActionSheetAwareScrollViewProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

/**
 * A HOC that provides the ActionSheetAwareScrollViewContext to the wrapped component.
 * Context will include:
 * - currentActionSheetState - the current state of the state machine
 * - transitionActionSheetState - a function to transition the state machine
 * - transitionActionSheetStateWorklet - a worklet function to transition the state machine
 * - resetStateMachine - a function to reset the state machine to the initial state
 *
 * @param {React.Component} WrappedComponent
 * @returns {React.Component} A wrapped component that has the ActionSheetAwareScrollViewContext
 */
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

const ActionSheetAwareScrollView = forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <ScrollView ref={ref} {...props}>
        <ReportKeyboardSpace>
            {props.children}
        </ReportKeyboardSpace>
    </ScrollView>
));

ActionSheetAwareScrollView.defaultProps = {
    children: null,
};

ActionSheetAwareScrollView.propTypes = {
    children: PropTypes.node,
};

export default ActionSheetAwareScrollView;

/**
 * This function should be used as renderScrollComponent prop for FlatList
 * @param {Object} props - props that will be passed to the ScrollView from FlatList
 * @returns {React.ReactElement} - ActionSheetAwareScrollView
 */
function renderScrollComponent(props) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <ActionSheetAwareScrollView {...props} />;
}

export {
    renderScrollComponent,
    ActionSheetAwareScrollViewProvider,
    ActionSheetAwareScrollViewContext,
    withActionSheetAwareScrollViewContext,
};
