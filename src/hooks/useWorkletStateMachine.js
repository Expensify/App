import {useCallback} from 'react';
import {
    runOnJS, runOnUI, useSharedValue, useWorkletCallback,
} from 'react-native-reanimated';
import Log from '../libs/Log';

// When you need to debug state machine change this to true
const DEBUG_MODE = false;

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
function useWorkletStateMachine(stateMachine, initialState) {
    const currentState = useSharedValue(initialState);

    const log = useWorkletCallback((message, params) => {
        if (!DEBUG_MODE) {
            return;
        }

        runOnJS(Log.info)(`[StateMachine] ${message}`, false, params);
    }, []);

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

        let nextPayload;

        if (typeof action.payload === 'undefined') {
            // we save previous payload
            nextPayload = state.current.payload;
        } else if (nextState === state.current.state) {
            // we merge previous payload with the new payload
            nextPayload = {
                ...state.current.payload,
                ...action.payload,
            };
        } else {
            nextPayload = action.payload;
        }

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

export default useWorkletStateMachine;
