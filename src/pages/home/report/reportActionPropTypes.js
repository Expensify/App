import PropTypes from 'prop-types';

import reportActionFragmentPropTypes from './reportActionFragmentPropTypes';

export default {
    /** Name of the action e.g. ADDCOMMENT */
    actionName: PropTypes.string,

    /** Person who created the action */
    person: PropTypes.arrayOf(reportActionFragmentPropTypes),

    /** ID of the report action */
    sequenceNumber: PropTypes.number,

    /** Unix timestamp */
    timestamp: PropTypes.number,

    /** report action message */
    message: PropTypes.arrayOf(reportActionFragmentPropTypes),

    /** Original message associated with this action */
    originalMessage: PropTypes.shape({
        // The ID of the iou transaction
        IOUTransactionID: PropTypes.string,
    }),

    /** If the reportAction is pending, that means we have not yet sent the Report_AddComment command to the server.
    This should most often occur when the client is offline. */
    isPending: PropTypes.bool,

    /** Error message that's come back from the server. */
    error: PropTypes.string,
};
