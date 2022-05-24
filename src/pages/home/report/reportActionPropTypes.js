import PropTypes from 'prop-types';

import reportActionFragmentPropTypes from './reportActionFragmentPropTypes';

export default {
    // Name of the action e.g. ADDCOMMENT
    actionName: PropTypes.string,

    // Person who created the action
    person: PropTypes.arrayOf(reportActionFragmentPropTypes),

    // ID of the report action
    sequenceNumber: PropTypes.number,

    // Unix timestamp
    timestamp: PropTypes.number,

    // report action message
    message: PropTypes.arrayOf(reportActionFragmentPropTypes),

    // Original message associated with this action
    originalMessage: PropTypes.shape({
        // The ID of the iou transaction
        IOUTransactionID: PropTypes.string,
    }),

    // Used to indicate the pending state.
    // Pending means the addComment request is waiting to be sent to the server.
    isPending: PropTypes.bool,

    // Error message that's come back from the server.
    error: PropTypes.string,
};
