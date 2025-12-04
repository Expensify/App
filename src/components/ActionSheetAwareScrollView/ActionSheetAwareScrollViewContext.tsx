import noop from 'lodash/noop';
import PropTypes from 'prop-types';
import type {PropsWithChildren} from 'react';
import React, {createContext, useMemo} from 'react';
import type {SharedValue} from 'react-native-reanimated';
import type {ValueOf} from 'type-fest';
import type {ActionWithPayload, State, StateMachine} from '@hooks/useWorkletStateMachine';
import useWorkletStateMachine from '@hooks/useWorkletStateMachine';

type MeasuredElements = {
    frameY?: number;
    popoverHeight?: number;
    height?: number;
};

type Context = {
    currentActionSheetState: SharedValue<State<MeasuredElements>>;
    transitionActionSheetState: (action: ActionWithPayload) => void;
    transitionActionSheetStateWorklet: (action: ActionWithPayload) => void;
    resetStateMachine: () => void;
};

/** Holds all information that is needed to coordinate the state value for the action sheet state machine. */
const currentActionSheetStateValue = {
    previous: {
        state: 'idle',
        payload: null,
    },
    current: {
        state: 'idle',
        payload: null,
    },
};
const defaultValue: Context = {
    currentActionSheetState: {
        value: currentActionSheetStateValue,
        addListener: noop,
        removeListener: noop,
        modify: noop,
        get: () => currentActionSheetStateValue,
        set: noop,
    },
    transitionActionSheetState: noop,
    transitionActionSheetStateWorklet: noop,
    resetStateMachine: noop,
};

const ActionSheetAwareScrollViewContext = createContext<Context>(defaultValue);

const Actions = {
    OPEN_KEYBOARD: 'OPEN_KEYBOARD',
    CLOSE_KEYBOARD: 'CLOSE_KEYBOARD',
    OPEN_POPOVER: 'OPEN_POPOVER',
    CLOSE_POPOVER: 'CLOSE_POPOVER',
    TRANSITION_POPOVER: 'TRANSITION_POPOVER',
    MEASURE_POPOVER: 'MEASURE_POPOVER',
    POPOVER_ANY_ACTION: 'POPOVER_ANY_ACTION',
    HIDE_WITHOUT_ANIMATION: 'HIDE_WITHOUT_ANIMATION',
    END_TRANSITION: 'END_TRANSITION',
} as const;

const States = {
    IDLE: 'idle',
    KEYBOARD_OPEN: 'keyboardOpen',
    POPOVER_OPEN: 'popoverOpen',
    POPOVER_CLOSED: 'popoverClosed',
    TRANSITIONING_POPOVER: 'transitioningPopover',
    TRANSITIONING_POPOVER_KEYBOARD_OPEN: 'transitioningPopoverKeyboardOpen',
    TRANSITIONING_POPOVER_DONE: 'transitioningPopoverDone',
    TRANSITIONING_POPOVER_KEYBOARD_OPEN_DONE: 'transitioningPopoverKeyboardOpenDone',
    KEYBOARD_POPOVER_CLOSED: 'keyboardPopoverClosed',
    KEYBOARD_POPOVER_OPEN: 'keyboardPopoverOpen',
    KEYBOARD_CLOSING_POPOVER: 'keyboardClosingPopover',
    POPOVER_MEASURED: 'popoverMeasured',
    MODAL_WITH_KEYBOARD_OPEN_DELETED: 'modalWithKeyboardOpenDeleted',
} as const;

const STATE_MACHINE: StateMachine<ValueOf<typeof States>, ValueOf<typeof Actions>> = {
    [States.IDLE]: {
        [Actions.OPEN_POPOVER]: States.POPOVER_OPEN,
        [Actions.OPEN_KEYBOARD]: States.KEYBOARD_OPEN,
        [Actions.MEASURE_POPOVER]: States.IDLE,
    },
    [States.POPOVER_OPEN]: {
        [Actions.CLOSE_POPOVER]: States.POPOVER_CLOSED,
        [Actions.MEASURE_POPOVER]: States.POPOVER_OPEN,
        [Actions.POPOVER_ANY_ACTION]: States.POPOVER_CLOSED,
        [Actions.HIDE_WITHOUT_ANIMATION]: States.IDLE,
        [Actions.TRANSITION_POPOVER]: States.TRANSITIONING_POPOVER,
    },
    [States.POPOVER_CLOSED]: {
        [Actions.END_TRANSITION]: States.IDLE,
    },
    [States.KEYBOARD_OPEN]: {
        [Actions.OPEN_KEYBOARD]: States.KEYBOARD_OPEN,
        [Actions.OPEN_POPOVER]: States.KEYBOARD_POPOVER_OPEN,
        [Actions.CLOSE_KEYBOARD]: States.IDLE,
    },
    [States.KEYBOARD_POPOVER_OPEN]: {
        [Actions.MEASURE_POPOVER]: States.KEYBOARD_POPOVER_OPEN,
        [Actions.CLOSE_POPOVER]: States.KEYBOARD_CLOSING_POPOVER,
        [Actions.OPEN_KEYBOARD]: States.KEYBOARD_OPEN,
        [Actions.TRANSITION_POPOVER]: States.TRANSITIONING_POPOVER_KEYBOARD_OPEN,
    },
    [States.KEYBOARD_POPOVER_CLOSED]: {
        [Actions.OPEN_KEYBOARD]: States.KEYBOARD_OPEN,
    },
    [States.KEYBOARD_CLOSING_POPOVER]: {
        [Actions.OPEN_KEYBOARD]: States.KEYBOARD_OPEN,
        [Actions.END_TRANSITION]: States.KEYBOARD_OPEN,
    },
    [States.TRANSITIONING_POPOVER]: {
        [Actions.CLOSE_POPOVER]: States.TRANSITIONING_POPOVER_DONE,
    },
    [States.TRANSITIONING_POPOVER_KEYBOARD_OPEN]: {
        [Actions.CLOSE_POPOVER]: States.TRANSITIONING_POPOVER_KEYBOARD_OPEN_DONE,
    },
    [States.TRANSITIONING_POPOVER_DONE]: {
        [Actions.CLOSE_POPOVER]: States.POPOVER_CLOSED,
        [Actions.MEASURE_POPOVER]: States.POPOVER_OPEN,
        [Actions.POPOVER_ANY_ACTION]: States.POPOVER_CLOSED,
        [Actions.HIDE_WITHOUT_ANIMATION]: States.IDLE,
    },
    [States.TRANSITIONING_POPOVER_KEYBOARD_OPEN_DONE]: {
        [Actions.MEASURE_POPOVER]: States.KEYBOARD_POPOVER_OPEN,
        [Actions.CLOSE_POPOVER]: States.KEYBOARD_CLOSING_POPOVER,
    },
};

function ActionSheetAwareScrollViewProvider(props: PropsWithChildren<unknown>) {
    const {currentState, transition, transitionWorklet, reset} = useWorkletStateMachine<typeof STATE_MACHINE, MeasuredElements>(STATE_MACHINE, {
        previous: {
            state: 'idle',
            payload: null,
        },
        current: {
            state: 'idle',
            payload: null,
        },
    });

    const value = useMemo(
        () => ({
            currentActionSheetState: currentState,
            transitionActionSheetState: transition,
            transitionActionSheetStateWorklet: transitionWorklet,
            resetStateMachine: reset,
        }),
        [currentState, reset, transition, transitionWorklet],
    );

    return <ActionSheetAwareScrollViewContext.Provider value={value}>{props.children}</ActionSheetAwareScrollViewContext.Provider>;
}

ActionSheetAwareScrollViewProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export {ActionSheetAwareScrollViewContext, ActionSheetAwareScrollViewProvider, Actions, States};
