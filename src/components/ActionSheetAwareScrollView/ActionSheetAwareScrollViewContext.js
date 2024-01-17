import React, {createContext, useMemo} from 'react';
import PropTypes from 'prop-types';
import useWorkletStateMachine from '../../hooks/useWorkletStateMachine';

const ActionSheetAwareScrollViewContext = createContext();

const Actions = {
    OPEN_KEYBOARD: 'KEYBOARD_OPEN',
    CLOSE_KEYBOARD: 'CLOSE_KEYBOARD',
    OPEN_POPOVER: 'OPEN_POPOVER',
    CLOSE_POPOVER: 'CLOSE_POPOVER',
    MEASURE_POPOVER: 'MEASURE_POPOVER',
    POPOVER_ANY_ACTION: 'POPOVER_ANY_ACTION',
    OPEN_EMOJI_PICKER_POPOVER: 'OPEN_EMOJI_PICKER_POPOVER',
    OPEN_EMOJI_PICKER_POPOVER_STANDALONE: 'OPEN_EMOJI_PICKER_POPOVER_STANDALONE',
    CLOSE_EMOJI_PICKER_POPOVER: 'CLOSE_EMOJI_PICKER_POPOVER',
    MEASURE_EMOJI_PICKER_POPOVER: 'MEASURE_EMOJI_PICKER_POPOVER',
    HIDE_WITHOUT_ANIMATION: 'HIDE_WITHOUT_ANIMATION',
    EDIT_REPORT: 'EDIT_REPORT',
    SHOW_DELETE_CONFIRM_MODAL: 'SHOW_DELETE_CONFIRM_MODAL',
    END_TRANSITION: 'END_TRANSITION',
    OPEN_CALL_POPOVER: 'OPEN_CALL_POPOVER',
    CLOSE_CONFIRM_MODAL: 'CLOSE_CONFIRM_MODAL',
    MEASURE_CONFIRM_MODAL: 'MEASURE_CONFIRM_MODAL',
    SHOW_ATTACHMENTS_POPOVER: 'SHOW_ATTACHMENTS_POPOVER',
    CLOSE_ATTACHMENTS_POPOVER: 'CLOSE_ATTACHMENTS_POPOVER',
    SHOW_ATTACHMENTS_PICKER_POPOVER: 'SHOW_ATTACHMENTS_PICKER_POPOVER',
};

const States = {
    IDLE: 'idle',
    KEYBOARD_OPEN: 'keyboardOpen',
    POPOVER_OPEN: 'popoverOpen',
    POPOVER_CLOSED: 'popoverClosed',
    KEYBOARD_POPOVER_CLOSED: 'keyboardPopoverClosed',
    KEYBOARD_POPOVER_OPEN: 'keyboardPopoverOpen',
    KEYBOARD_CLOSED_POPOVER: 'keyboardClosingPopover', // needed?
    POPOVER_MEASURED: 'popoverMeasured',
    EMOJI_PICKER_POPOVER_OPEN: 'emojiPickerPopoverOpen',
    DELETE_MODAL_OPEN: 'deleteModalOpen',
    DELETE_MODAL_WITH_KEYBOARD_OPEN: 'deleteModalWithKeyboardOpen',
    EMOJI_PICKER_POPOVER_WITH_KEYBOARD_OPEN: 'emojiPickerPopoverWithKeyboardOpen',
    EMOJI_PICKER_WITH_KEYBOARD_OPEN: 'emojiPickerWithKeyboardOpen',
    CALL_POPOVER_WITH_KEYBOARD_OPEN: 'callPopoverWithKeyboardOpen',
    ATTACHMENTS_POPOVER_WITH_KEYBOARD_OPEN: 'attachmentsPopoverWithKeyboardOpen',
};

const STATE_MACHINE = {
    [States.IDLE]: {
        [Actions.OPEN_POPOVER]: States.POPOVER_OPEN,
        [Actions.OPEN_KEYBOARD]: States.KEYBOARD_OPEN,
        [Actions.MEASURE_POPOVER]: States.IDLE,
        [Actions.OPEN_EMOJI_PICKER_POPOVER]: States.EMOJI_PICKER_POPOVER_OPEN,
        [Actions.SHOW_ATTACHMENTS_PICKER_POPOVER]: States.ATTACHMENTS_POPOVER_WITH_KEYBOARD_OPEN,
    },
    [States.POPOVER_OPEN]: {
        [Actions.CLOSE_POPOVER]: States.POPOVER_CLOSED,
        [Actions.MEASURE_POPOVER]: States.POPOVER_OPEN,
        [Actions.OPEN_EMOJI_PICKER_POPOVER]: States.EMOJI_PICKER_POPOVER_OPEN,
        [Actions.POPOVER_ANY_ACTION]: States.POPOVER_CLOSED,
        [Actions.HIDE_WITHOUT_ANIMATION]: States.IDLE,
        [Actions.EDIT_REPORT]: States.IDLE,
        [Actions.SHOW_DELETE_CONFIRM_MODAL]: States.MODAL_DELETED,
    },
    [States.POPOVER_CLOSED]: {
        [Actions.END_TRANSITION]: States.IDLE,
    },
    [States.EMOJI_PICKER_POPOVER_OPEN]: {
        [Actions.MEASURE_EMOJI_PICKER_POPOVER]: States.EMOJI_PICKER_POPOVER_OPEN,
        [Actions.CLOSE_EMOJI_PICKER_POPOVER]: States.POPOVER_CLOSED,
    },
    [States.MODAL_DELETED]: {
        [Actions.MEASURE_CONFIRM_MODAL]: States.MODAL_DELETED,
        [Actions.CLOSE_CONFIRM_MODAL]: States.POPOVER_CLOSED,
    },
    [States.KEYBOARD_OPEN]: {
        [Actions.OPEN_KEYBOARD]: States.KEYBOARD_OPEN,
        [Actions.OPEN_POPOVER]: States.KEYBOARD_POPOVER_OPEN,
        [Actions.OPEN_EMOJI_PICKER_POPOVER]: States.KEYBOARD_POPOVER_OPEN,
        [Actions.OPEN_EMOJI_PICKER_POPOVER_STANDALONE]: States.EMOJI_PICKER_WITH_KEYBOARD_OPEN,
        [Actions.CLOSE_KEYBOARD]: States.IDLE,
        [Actions.OPEN_CALL_POPOVER]: States.CALL_POPOVER_WITH_KEYBOARD_OPEN,
        [Actions.SHOW_ATTACHMENTS_POPOVER]: States.ATTACHMENTS_POPOVER_WITH_KEYBOARD_OPEN,
        [Actions.SHOW_ATTACHMENTS_PICKER_POPOVER]: States.ATTACHMENTS_POPOVER_WITH_KEYBOARD_OPEN,
    },
    [States.KEYBOARD_POPOVER_OPEN]: {
        [Actions.MEASURE_POPOVER]: States.KEYBOARD_POPOVER_OPEN,
        [Actions.CLOSE_POPOVER]: States.KEYBOARD_CLOSED_POPOVER,
        [Actions.CLOSE_EMOJI_PICKER_POPOVER]: States.KEYBOARD_CLOSED_POPOVER,
        [Actions.MEASURE_EMOJI_PICKER_POPOVER]: States.KEYBOARD_POPOVER_OPEN,
        [Actions.OPEN_EMOJI_PICKER_POPOVER]: States.EMOJI_PICKER_POPOVER_WITH_KEYBOARD_OPEN,
        [Actions.SHOW_DELETE_CONFIRM_MODAL]: States.MODAL_WITH_KEYBOARD_OPEN_DELETED,
    },
    [States.MODAL_WITH_KEYBOARD_OPEN_DELETED]: {
        [Actions.MEASURE_CONFIRM_MODAL]: States.MODAL_WITH_KEYBOARD_OPEN_DELETED,
        [Actions.CLOSE_CONFIRM_MODAL]: States.KEYBOARD_CLOSED_POPOVER,
    },
    [States.EMOJI_PICKER_POPOVER_WITH_KEYBOARD_OPEN]: {
        [Actions.MEASURE_EMOJI_PICKER_POPOVER]: States.EMOJI_PICKER_POPOVER_WITH_KEYBOARD_OPEN,
        [Actions.CLOSE_EMOJI_PICKER_POPOVER]: States.KEYBOARD_CLOSED_POPOVER,
    },
    [States.EMOJI_PICKER_WITH_KEYBOARD_OPEN]: {
        [Actions.MEASURE_EMOJI_PICKER_POPOVER]: States.EMOJI_PICKER_WITH_KEYBOARD_OPEN,
        [Actions.CLOSE_EMOJI_PICKER_POPOVER_STANDALONE]: States.KEYBOARD_POPOVER_CLOSED,
    },
    [States.CALL_POPOVER_WITH_KEYBOARD_OPEN]: {
        [Actions.MEASURE_CALL_POPOVER]: States.CALL_POPOVER_WITH_KEYBOARD_OPEN,
        [Actions.CLOSE_CALL_POPOVER]: States.KEYBOARD_POPOVER_CLOSED,
    },
    [States.ATTACHMENTS_POPOVER_WITH_KEYBOARD_OPEN]: {
        [Actions.MEASURE_POPOVER]: States.ATTACHMENTS_POPOVER_WITH_KEYBOARD_OPEN,
        [Actions.CLOSE_ATTACHMENTS_POPOVER]: States.KEYBOARD_POPOVER_CLOSED,
    },
    [States.KEYBOARD_POPOVER_CLOSED]: {
        [Actions.OPEN_KEYBOARD]: States.KEYBOARD_OPEN,
    },
    [States.KEYBOARD_CLOSED_POPOVER]: {
        [Actions.OPEN_KEYBOARD]: States.KEYBOARD_OPEN,
        [Actions.END_TRANSITION]: States.KEYBOARD_OPEN,
    },
};

function ActionSheetAwareScrollViewProvider(props) {
    const {currentState, transition, transitionWorklet, reset} = useWorkletStateMachine(STATE_MACHINE, {
        previous: null,
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
