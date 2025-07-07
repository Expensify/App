"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fastMerge_1 = require("expensify-common/dist/fastMerge");
var react_1 = require("react");
var react_native_reanimated_1 = require("react-native-reanimated");
var Log_1 = require("@libs/Log");
var executeOnUIRuntimeSync_1 = require("./executeOnUIRuntimeSync");
// When you need to debug state machine change this to true
var DEBUG_MODE = false;
// eslint-disable-next-line @typescript-eslint/unbound-method
var client = (0, react_native_reanimated_1.runOnJS)(Log_1.default.client);
/**
 * A hook that creates a state machine that can be used with Reanimated Worklets, useful for when you need to keep the native thread and JS tightly in-sync.
 * You can transition state from worklets running on the UI thread, or from the JS thread.
 *
 * State machines are helpful for managing complex UI interactions. We want to transition
 * between states based on user actions. But also we want to ignore some actions
 * when we are in certain states.
 *
 * For example:
 * 1. Initial state is idle. It can react to KEYBOARD_OPEN action.
 * 2. We open emoji picker. It sends EMOJI_PICKER_OPEN action.
 * 3. There is no handling for this action in idle state so we do nothing.
 * 4. We close emoji picker and it sends EMOJI_PICKER_CLOSE action which again does nothing.
 * 5. We open keyboard. It sends KEYBOARD_OPEN action. idle can react to this action
 *    by transitioning into keyboardOpen state
 * 6. Our state is keyboardOpen. It can react to KEYBOARD_CLOSE, EMOJI_PICKER_OPEN actions
 * 7. We open emoji picker again. It sends EMOJI_PICKER_OPEN action which transitions our state
 *    into emojiPickerOpen state. Now we react only to EMOJI_PICKER_CLOSE action.
 * 8. Before rendering the emoji picker, the app hides the keyboard.
 *    It sends KEYBOARD_CLOSE action. But we ignore it since our emojiPickerOpen state can only handle
 *    EMOJI_PICKER_CLOSE action. So we write the logic for handling hiding the keyboard,
 *    but maintaining the offset based on the keyboard state shared value
 * 9. We close the picker and send EMOJI_PICKER_CLOSE action which transitions us back into keyboardOpen state.
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
function useWorkletStateMachine(stateMachine, initialState) {
    var currentState = (0, react_native_reanimated_1.useSharedValue)(initialState);
    var log = (0, react_1.useCallback)(function (message, params) {
        'worklet';
        if (!DEBUG_MODE) {
            return;
        }
        // eslint-disable-next-line @typescript-eslint/unbound-method, @typescript-eslint/restrict-template-expressions
        client("[StateMachine] ".concat(message, ". Params: ").concat(JSON.stringify(params)));
    }, []);
    var transitionWorklet = (0, react_1.useCallback)(function (action) {
        'worklet';
        if (!action) {
            throw new Error('state machine action is required');
        }
        var state = currentState.get();
        log("Current STATE: ".concat(state.current.state));
        log("Next ACTION: ".concat(action.type), action.payload);
        var nextMachine = stateMachine[state.current.state];
        if (!nextMachine) {
            log("No next machine found for state: ".concat(state.current.state));
            return;
        }
        var nextState = nextMachine[action.type];
        if (!nextState) {
            log("No next state found for action: ".concat(action.type));
            return;
        }
        // save previous payload or merge the new payload with the previous payload
        var nextPayload = typeof action.payload === 'undefined' ? state.current.payload : (0, fastMerge_1.default)(state.current.payload, action.payload);
        log("Next STATE: ".concat(nextState), nextPayload);
        currentState.set({
            previous: state.current,
            current: {
                state: nextState,
                payload: nextPayload,
            },
        });
    }, [currentState, log, stateMachine]);
    var resetWorklet = (0, react_1.useCallback)(function () {
        'worklet';
        log('RESET STATE MACHINE');
        currentState.set(initialState);
    }, [currentState, initialState, log]);
    var reset = (0, react_1.useCallback)(function () {
        (0, react_native_reanimated_1.runOnUI)(resetWorklet)();
    }, [resetWorklet]);
    var transition = (0, react_1.useCallback)(function (action) {
        (0, executeOnUIRuntimeSync_1.default)(transitionWorklet)(action);
    }, [transitionWorklet]);
    return {
        currentState: currentState,
        transitionWorklet: transitionWorklet,
        transition: transition,
        reset: reset,
    };
}
exports.default = useWorkletStateMachine;
