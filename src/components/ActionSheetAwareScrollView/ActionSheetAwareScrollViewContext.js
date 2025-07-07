"use strict";
var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", { value: true });
exports.States = exports.Actions = exports.ActionSheetAwareScrollViewContext = void 0;
exports.ActionSheetAwareScrollViewProvider = ActionSheetAwareScrollViewProvider;
var noop_1 = require("lodash/noop");
var prop_types_1 = require("prop-types");
var react_1 = require("react");
var useWorkletStateMachine_1 = require("@hooks/useWorkletStateMachine");
/** Holds all information that is needed to coordinate the state value for the action sheet state machine. */
var currentActionSheetStateValue = {
    previous: {
        state: 'idle',
        payload: null,
    },
    current: {
        state: 'idle',
        payload: null,
    },
};
var defaultValue = {
    currentActionSheetState: {
        value: currentActionSheetStateValue,
        addListener: noop_1.default,
        removeListener: noop_1.default,
        modify: noop_1.default,
        get: function () { return currentActionSheetStateValue; },
        set: noop_1.default,
    },
    transitionActionSheetState: noop_1.default,
    transitionActionSheetStateWorklet: noop_1.default,
    resetStateMachine: noop_1.default,
};
var ActionSheetAwareScrollViewContext = (0, react_1.createContext)(defaultValue);
exports.ActionSheetAwareScrollViewContext = ActionSheetAwareScrollViewContext;
var Actions = {
    OPEN_KEYBOARD: 'KEYBOARD_OPEN',
    CLOSE_KEYBOARD: 'CLOSE_KEYBOARD',
    OPEN_POPOVER: 'OPEN_POPOVER',
    CLOSE_POPOVER: 'CLOSE_POPOVER',
    MEASURE_POPOVER: 'MEASURE_POPOVER',
    MEASURE_COMPOSER: 'MEASURE_COMPOSER',
    POPOVER_ANY_ACTION: 'POPOVER_ANY_ACTION',
    HIDE_WITHOUT_ANIMATION: 'HIDE_WITHOUT_ANIMATION',
    END_TRANSITION: 'END_TRANSITION',
};
exports.Actions = Actions;
var States = {
    IDLE: 'idle',
    KEYBOARD_OPEN: 'keyboardOpen',
    POPOVER_OPEN: 'popoverOpen',
    POPOVER_CLOSED: 'popoverClosed',
    KEYBOARD_POPOVER_CLOSED: 'keyboardPopoverClosed',
    KEYBOARD_POPOVER_OPEN: 'keyboardPopoverOpen',
    KEYBOARD_CLOSED_POPOVER: 'keyboardClosingPopover',
    POPOVER_MEASURED: 'popoverMeasured',
    MODAL_WITH_KEYBOARD_OPEN_DELETED: 'modalWithKeyboardOpenDeleted',
};
exports.States = States;
var STATE_MACHINE = (_a = {},
    _a[States.IDLE] = (_b = {},
        _b[Actions.OPEN_POPOVER] = States.POPOVER_OPEN,
        _b[Actions.OPEN_KEYBOARD] = States.KEYBOARD_OPEN,
        _b[Actions.MEASURE_POPOVER] = States.IDLE,
        _b[Actions.MEASURE_COMPOSER] = States.IDLE,
        _b),
    _a[States.POPOVER_OPEN] = (_c = {},
        _c[Actions.CLOSE_POPOVER] = States.POPOVER_CLOSED,
        _c[Actions.MEASURE_POPOVER] = States.POPOVER_OPEN,
        _c[Actions.MEASURE_COMPOSER] = States.POPOVER_OPEN,
        _c[Actions.POPOVER_ANY_ACTION] = States.POPOVER_CLOSED,
        _c[Actions.HIDE_WITHOUT_ANIMATION] = States.IDLE,
        _c),
    _a[States.POPOVER_CLOSED] = (_d = {},
        _d[Actions.END_TRANSITION] = States.IDLE,
        _d),
    _a[States.KEYBOARD_OPEN] = (_e = {},
        _e[Actions.OPEN_KEYBOARD] = States.KEYBOARD_OPEN,
        _e[Actions.OPEN_POPOVER] = States.KEYBOARD_POPOVER_OPEN,
        _e[Actions.CLOSE_KEYBOARD] = States.IDLE,
        _e[Actions.MEASURE_COMPOSER] = States.KEYBOARD_OPEN,
        _e),
    _a[States.KEYBOARD_POPOVER_OPEN] = (_f = {},
        _f[Actions.MEASURE_POPOVER] = States.KEYBOARD_POPOVER_OPEN,
        _f[Actions.CLOSE_POPOVER] = States.KEYBOARD_CLOSED_POPOVER,
        _f[Actions.OPEN_KEYBOARD] = States.KEYBOARD_OPEN,
        _f),
    _a[States.KEYBOARD_POPOVER_CLOSED] = (_g = {},
        _g[Actions.OPEN_KEYBOARD] = States.KEYBOARD_OPEN,
        _g),
    _a[States.KEYBOARD_CLOSED_POPOVER] = (_h = {},
        _h[Actions.OPEN_KEYBOARD] = States.KEYBOARD_OPEN,
        _h[Actions.END_TRANSITION] = States.KEYBOARD_OPEN,
        _h),
    _a);
function ActionSheetAwareScrollViewProvider(props) {
    var _a = (0, useWorkletStateMachine_1.default)(STATE_MACHINE, {
        previous: {
            state: 'idle',
            payload: null,
        },
        current: {
            state: 'idle',
            payload: null,
        },
    }), currentState = _a.currentState, transition = _a.transition, transitionWorklet = _a.transitionWorklet, reset = _a.reset;
    var value = (0, react_1.useMemo)(function () { return ({
        currentActionSheetState: currentState,
        transitionActionSheetState: transition,
        transitionActionSheetStateWorklet: transitionWorklet,
        resetStateMachine: reset,
    }); }, [currentState, reset, transition, transitionWorklet]);
    return <ActionSheetAwareScrollViewContext.Provider value={value}>{props.children}</ActionSheetAwareScrollViewContext.Provider>;
}
ActionSheetAwareScrollViewProvider.propTypes = {
    children: prop_types_1.default.node.isRequired,
};
