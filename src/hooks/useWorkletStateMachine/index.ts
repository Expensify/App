import {useCallback} from 'react';
import {runOnJS, runOnUI, useSharedValue} from 'react-native-reanimated';
import Log from '@libs/Log';
import executeOnUIRuntimeSync from './executeOnUIRuntimeSync';

// When you need to debug state machine change this to true
const DEBUG_MODE = false;

type Payload = Record<string, unknown>;
type ActionWithPayload<P = Payload> = {
    type: string;
    payload?: P;
};
type StateHolder<P = Payload> = {
    state: string;
    payload: P | null;
};
type State<P> = {
    previous: StateHolder<P>;
    current: StateHolder<P>;
};

/**
 * Represents the state machine configuration as a nested record where:
 * - The first level keys are the state names.
 * - The second level keys are the action types valid for that state.
 * - The corresponding values are the next states to transition to when the action is triggered.
 */
type StateMachine = Record<string, Record<string, string>>;

// eslint-disable-next-line @typescript-eslint/unbound-method
const client = Log.client;

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
 * EMOJI_PICKER_CLOSE action. So we write the logic for handling hiding the keyboard,
 * but maintaining the offset based on the keyboard state shared value
 * 7. We close the picker and send EMOJI_PICKER_CLOSE action which transitions us back into keyboardOpen state.
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
 * @param stateMachine - a state machine object
 * @param initialState - the initial state of the state machine
 * @returns an object containing the current state, a transition function, and a reset function
 */
function useWorkletStateMachine<P>(stateMachine: StateMachine, initialState: State<P>) {
    const currentState = useSharedValue(initialState);

    const log = useCallback((message: string, params?: P | null) => {
        'worklet';

        if (!DEBUG_MODE) {
            return;
        }

        // eslint-disable-next-line @typescript-eslint/unbound-method, @typescript-eslint/restrict-template-expressions
        runOnJS(client)(`[StateMachine] ${message}. Params: ${JSON.stringify(params)}`);
    }, []);

    const transitionWorklet = useCallback(
        (action: ActionWithPayload<P>) => {
            'worklet';

            if (!action) {
                throw new Error('state machine action is required');
            }

            const state = currentState.get();

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
            } else {
                // we merge previous payload with the new payload
                nextPayload = {
                    ...state.current.payload,
                    ...action.payload,
                };
            }

            log(`Next STATE: ${nextState}`, nextPayload);

            currentState.set({
                previous: state.current,
                current: {
                    state: nextState,
                    payload: nextPayload,
                },
            });
        },
        [currentState, log, stateMachine],
    );

    const resetWorklet = useCallback(() => {
        'worklet';

        log('RESET STATE MACHINE');
        // eslint-disable-next-line react-compiler/react-compiler
        currentState.set(initialState);
    }, [currentState, initialState, log]);

    const reset = useCallback(() => {
        runOnUI(resetWorklet)();
    }, [resetWorklet]);

    const transition = useCallback(
        (action: ActionWithPayload<P>) => {
            executeOnUIRuntimeSync(transitionWorklet)(action);
        },
        [transitionWorklet],
    );

    return {
        currentState,
        transitionWorklet,
        transition,
        reset,
    };
}

export type {ActionWithPayload, State};
export default useWorkletStateMachine;
