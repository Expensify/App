import PropTypes from 'prop-types';

const messagePropType = PropTypes.shape({
    text: PropTypes.string,
    type: PropTypes.string,
    action: PropTypes.string,
});

export default PropTypes.shape({
    /** The message parts of the next step */
    message: PropTypes.arrayOf(messagePropType),

    /** The title for the next step */
    title: PropTypes.string,

    /** Whether the user should take some sort of action in order to unblock the report */
    requiresUserAction: PropTypes.bool,

    /** The type of next step */
    type: PropTypes.oneOf(['neutral', 'alert', null]),

    /** If the "Undo submit" button should be visible */
    showUndoSubmit: PropTypes.bool,

    /** Deprecated - If the next step should be displayed on mobile, related to OldApp */
    showForMobile: PropTypes.bool,

    /** If the next step should be displayed at the expense level */
    showForExpense: PropTypes.bool,

    /** An optional alternate message to display on expenses instead of what is provided in the "message" field */
    expenseMessage: PropTypes.arrayOf(messagePropType),

    /** The next person in the approval chain of the report */
    nextReceiver: PropTypes.string,

    /** An array of buttons to be displayed next to the next step */
    buttons: PropTypes.arrayOf(
        PropTypes.shape({
            text: PropTypes.string,
            tooltip: PropTypes.string,
            disabled: PropTypes.bool,
            hidden: PropTypes.bool,
            // eslint-disable-next-line react/forbid-prop-types
            data: PropTypes.array,
        }),
    ),
});
