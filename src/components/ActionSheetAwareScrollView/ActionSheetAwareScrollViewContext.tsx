import type {PropsWithChildren} from 'react';
import React, {createContext, useMemo} from 'react';
import type {ValueOf} from 'type-fest';
import useWorkletStateMachine from '@hooks/useWorkletStateMachine';
import type {StateMachine} from '@hooks/useWorkletStateMachine';
import {createDummySharedValue} from '@src/utils/SharedValueUtils';
import {INITIAL_ACTION_SHEET_STATE} from './types';
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
    OPEN_KEYBOARD: 'KEYBOARD_OPEN',
    CLOSE_KEYBOARD: 'CLOSE_KEYBOARD',
    OPEN_POPOVER: 'OPEN_POPOVER',
    CLOSE_POPOVER: 'CLOSE_POPOVER',
    MEASURE_POPOVER: 'MEASURE_POPOVER',
    MEASURE_COMPOSER: 'MEASURE_COMPOSER',
    POPOVER_ANY_ACTION: 'POPOVER_ANY_ACTION',
    HIDE_WITHOUT_ANIMATION: 'HIDE_WITHOUT_ANIMATION',
    END_TRANSITION: 'END_TRANSITION',
} as const;

const States = {
    IDLE: 'idle',
    KEYBOARD_OPEN: 'keyboardOpen',
    POPOVER_OPEN: 'popoverOpen',
    POPOVER_CLOSED: 'popoverClosed',
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
        [Actions.MEASURE_COMPOSER]: States.IDLE,
    },
    [States.POPOVER_OPEN]: {
        [Actions.CLOSE_POPOVER]: States.POPOVER_CLOSED,
        [Actions.MEASURE_POPOVER]: States.POPOVER_OPEN,
        [Actions.MEASURE_COMPOSER]: States.POPOVER_OPEN,
        [Actions.POPOVER_ANY_ACTION]: States.POPOVER_CLOSED,
        [Actions.HIDE_WITHOUT_ANIMATION]: States.IDLE,
    },
    [States.POPOVER_CLOSED]: {
        [Actions.END_TRANSITION]: States.IDLE,
    },
    [States.KEYBOARD_OPEN]: {
        [Actions.OPEN_KEYBOARD]: States.KEYBOARD_OPEN,
        [Actions.OPEN_POPOVER]: States.KEYBOARD_POPOVER_OPEN,
        [Actions.CLOSE_KEYBOARD]: States.IDLE,
        [Actions.MEASURE_COMPOSER]: States.KEYBOARD_OPEN,
    },
    [States.KEYBOARD_POPOVER_OPEN]: {
        [Actions.MEASURE_POPOVER]: States.KEYBOARD_POPOVER_OPEN,
        [Actions.CLOSE_POPOVER]: States.KEYBOARD_CLOSING_POPOVER,
        [Actions.OPEN_KEYBOARD]: States.KEYBOARD_OPEN,
    },
    [States.KEYBOARD_POPOVER_CLOSED]: {
        [Actions.OPEN_KEYBOARD]: States.KEYBOARD_OPEN,
    },
    [States.KEYBOARD_CLOSING_POPOVER]: {
        [Actions.OPEN_KEYBOARD]: States.KEYBOARD_OPEN,
        [Actions.END_TRANSITION]: States.KEYBOARD_OPEN,
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
ActionSheetAwareScrollViewProvider.displayName = 'ActionSheetAwareScrollViewProvider';

export {ActionSheetAwareScrollViewContext, ActionSheetAwareScrollViewProvider, Actions, States};
