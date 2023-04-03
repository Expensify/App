import React, {
    createContext, useMemo,
} from 'react';
import PropTypes from 'prop-types';
import useWorkletStateMachine from '../../hooks/useWorkletStateMachine';

const ActionSheetAwareScrollViewContext = createContext();

const Actions = {
    POPOVER_OPEN: 'POPOVER_OPEN',
    ON_KEYBOARD_OPEN: 'ON_KEYBOARD_OPEN',
    MEASURE_POPOVER: 'MEASURE_POPOVER',
    OPEN_EMOJI_PICKER_POPOVER: 'OPEN_EMOJI_PICKER_POPOVER',
    POPOVER_ANY_ACTION: 'POPOVER_ANY_ACTION',
    HIDE_WITHOUT_ANIMATION: 'HIDE_WITHOUT_ANIMATION',
    EDIT_REPORT: 'EDIT_REPORT',
    SHOW_DELETE_CONFIRM_MODAL: 'SHOW_DELETE_CONFIRM_MODAL',
    CLOSE_POPOVER: 'CLOSE_POPOVER',
    MEASURE_EMOJI_PICKER_POPOVER: 'MEASURE_EMOJI_PICKER_POPOVER',
    CLOSE_EMOJI_PICKER_POPOVER: 'CLOSE_EMOJI_PICKER_POPOVER',
    END_TRANSITION: 'END_TRANSITION',
    ON_KEYBOARD_CLOSE: 'ON_KEYBOARD_CLOSE',
    OPEN_CALL_POPOVER: 'OPEN_CALL_POPOVER',
    CLOSE_CONFIRM_MODAL: 'CLOSE_CONFIRM_MODAL',
    MEASURE_CONFIRM_MODAL: 'MEASURE_CONFIRM_MODAL',
    SHOW_ATTACHMENTS_POPOVER: 'SHOW_ATTACHMENTS_POPOVER',
    CLOSE_ATTACHMENTS_POPOVER: 'CLOSE_ATTACHMENTS_POPOVER',
    SHOW_ATTACHMENTS_PICKER_POPOVER: 'SHOW_ATTACHMENTS_PICKER_POPOVER',
};

const States = {
    IDLE: 'idle',
    POPOVER_OPEN: 'popoverOpen',
    KEYBOARD_OPEN: 'keyboardOpen',
    MEASURE_POPOVER: 'measurePopover',
    EMOJI_PICKER_POPOVER_OPEN: 'emojiPickerPopoverOpen',
    POPOVER_CLOSED: 'popoverClosed',
    DELETE_MODAL: 'deleteModal',
    KEYBOARD_POPOVER_OPEN: 'keyboardPopoverOpen',
    DELETE_MODAL_WITH_KEYBOARD_OPEN: 'deleteModalWithKeyboardOpen',
    EMOJI_PICKER_POPOVER_WITH_KEYBOARD_OPEN: 'emojiPickerPopoverWithKeyboardOpen',
    EMOJI_PICKER_WITH_KEYBOARD_OPEN: 'emojiPickerWithKeyboardOpen',
    CALL_POPOVER_WITH_KEYBOARD_OPEN: 'callPopoverWithKeyboardOpen',
    CLOSING_KEYBOARD_POPOVER: 'closingKeyboardPopover',
    KEYBOARD_CLOSING_POPOVER: 'keyboardClosingPopover',
    ATTACHMENTS_POPOVER_WITH_KEYBOARD_OPEN: 'attachmentsPopoverWithKeyboardOpen',
};

const STATE_MACHINE = {
    [States.IDLE]: {
        [Actions.POPOVER_OPEN]: States.POPOVER_OPEN,
        [Actions.ON_KEYBOARD_OPEN]: States.KEYBOARD_OPEN,
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
        [Actions.SHOW_DELETE_CONFIRM_MODAL]: States.DELETE_MODAL,
    },
    [States.POPOVER_CLOSED]: {
        [Actions.END_TRANSITION]: States.IDLE,
    },
    [States.EMOJI_PICKER_POPOVER_OPEN]: {
        [Actions.MEASURE_EMOJI_PICKER_POPOVER]: States.EMOJI_PICKER_POPOVER_OPEN,
        [Actions.CLOSE_EMOJI_PICKER_POPOVER]: States.POPOVER_CLOSED,
    },
    [States.DELETE_MODAL]: {
        [Actions.MEASURE_CONFIRM_MODAL]: States.DELETE_MODAL,
        [Actions.CLOSE_CONFIRM_MODAL]: States.POPOVER_CLOSED,
    },
    [States.KEYBOARD_OPEN]: {
        [Actions.ON_KEYBOARD_OPEN]: States.KEYBOARD_OPEN,
        [Actions.POPOVER_OPEN]: States.KEYBOARD_POPOVER_OPEN,
        [Actions.OPEN_EMOJI_PICKER_POPOVER]: States.KEYBOARD_POPOVER_OPEN,
        [Actions.OPEN_EMOJI_PICKER_POPOVER_STANDALONE]: States.EMOJI_PICKER_WITH_KEYBOARD_OPEN,
        [Actions.ON_KEYBOARD_CLOSE]: States.IDLE,
        [Actions.OPEN_CALL_POPOVER]: States.CALL_POPOVER_WITH_KEYBOARD_OPEN,
        [Actions.SHOW_ATTACHMENTS_POPOVER]: States.ATTACHMENTS_POPOVER_WITH_KEYBOARD_OPEN,
        [Actions.SHOW_ATTACHMENTS_PICKER_POPOVER]: States.ATTACHMENTS_POPOVER_WITH_KEYBOARD_OPEN,
    },
    [States.KEYBOARD_POPOVER_OPEN]: {
        [Actions.MEASURE_POPOVER]: States.KEYBOARD_POPOVER_OPEN,
        [Actions.CLOSE_POPOVER]: States.KEYBOARD_CLOSING_POPOVER,
        [Actions.CLOSE_EMOJI_PICKER_POPOVER]: States.KEYBOARD_CLOSING_POPOVER,
        [Actions.MEASURE_EMOJI_PICKER_POPOVER]: States.KEYBOARD_POPOVER_OPEN,
        [Actions.OPEN_EMOJI_PICKER_POPOVER]: States.EMOJI_PICKER_POPOVER_WITH_KEYBOARD_OPEN,
        [Actions.SHOW_DELETE_CONFIRM_MODAL]: States.DELETE_MODAL_WITH_KEYBOARD_OPEN,
    },
    [States.DELETE_MODAL_WITH_KEYBOARD_OPEN]: {
        [Actions.MEASURE_CONFIRM_MODAL]: States.DELETE_MODAL_WITH_KEYBOARD_OPEN,
        [Actions.CLOSE_CONFIRM_MODAL]: States.KEYBOARD_CLOSING_POPOVER,
    },
    [States.EMOJI_PICKER_POPOVER_WITH_KEYBOARD_OPEN]: {
        [Actions.MEASURE_EMOJI_PICKER_POPOVER]: States.EMOJI_PICKER_POPOVER_WITH_KEYBOARD_OPEN,
        [Actions.CLOSE_EMOJI_PICKER_POPOVER]: States.KEYBOARD_CLOSING_POPOVER,
    },
    [States.EMOJI_PICKER_WITH_KEYBOARD_OPEN]: {
        [Actions.MEASURE_EMOJI_PICKER_POPOVER]: States.EMOJI_PICKER_WITH_KEYBOARD_OPEN,
        [Actions.CLOSE_EMOJI_PICKER_POPOVER_STANDALONE]: States.CLOSING_KEYBOARD_POPOVER,
    },
    [States.CALL_POPOVER_WITH_KEYBOARD_OPEN]: {
        [Actions.MEASURE_CALL_POPOVER]: States.CALL_POPOVER_WITH_KEYBOARD_OPEN,
        [Actions.CLOSE_CALL_POPOVER]: States.CLOSING_KEYBOARD_POPOVER,
    },
    [States.ATTACHMENTS_POPOVER_WITH_KEYBOARD_OPEN]: {
        [Actions.MEASURE_POPOVER]: States.ATTACHMENTS_POPOVER_WITH_KEYBOARD_OPEN,
        [Actions.CLOSE_ATTACHMENTS_POPOVER]: States.CLOSING_KEYBOARD_POPOVER,
    },
    [States.CLOSING_KEYBOARD_POPOVER]: {
        [Actions.ON_KEYBOARD_OPEN]: States.KEYBOARD_OPEN,
    },
    [States.KEYBOARD_CLOSING_POPOVER]: {
        [Actions.ON_KEYBOARD_OPEN]: States.KEYBOARD_OPEN,
        [Actions.END_TRANSITION]: States.KEYBOARD_OPEN,
    },
};

function ActionSheetAwareScrollViewProvider(props) {
    const {
        currentState, transition, transitionWorklet, reset,
    } = useWorkletStateMachine(STATE_MACHINE, {
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

export {
    ActionSheetAwareScrollViewContext,
    ActionSheetAwareScrollViewProvider,
    Actions,
    States,
};
