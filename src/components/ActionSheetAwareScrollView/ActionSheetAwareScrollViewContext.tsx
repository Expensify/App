import type {PropsWithChildren} from 'react';
import React, {createContext, useMemo} from 'react';
import type {ValueOf} from 'type-fest';
import useWorkletStateMachine from '@hooks/useWorkletStateMachine';
import type {StateMachine} from '@hooks/useWorkletStateMachine';
import createDummySharedValue from '@src/utils/createDummySharedValue';
import {INITIAL_ACTION_SHEET_STATE} from './constants';
import type {ActionSheetAwareScrollViewContextValue, ActionSheetAwareScrollViewMeasurements} from './types';

const NOOP = () => {};

const initialContextValue: ActionSheetAwareScrollViewContextValue = {
    currentActionSheetState: createDummySharedValue(INITIAL_ACTION_SHEET_STATE),
    transitionActionSheetState: NOOP,
    transitionActionSheetStateWorklet: NOOP,
    resetStateMachine: NOOP,
};

const ActionSheetAwareScrollViewContext = createContext<ActionSheetAwareScrollViewContextValue>(initialContextValue);

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

function ActionSheetAwareScrollViewProvider(props: PropsWithChildren) {
    const {currentState, transition, transitionWorklet, reset} = useWorkletStateMachine<typeof STATE_MACHINE, ActionSheetAwareScrollViewMeasurements>(
        STATE_MACHINE,
        INITIAL_ACTION_SHEET_STATE,
    );

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

export {ActionSheetAwareScrollViewContext, ActionSheetAwareScrollViewProvider, Actions, States};
