import PropTypes from 'prop-types';

import reportActionFragmentPropTypes from './reportActionFragmentPropTypes';

export default {
    /** Name of the action e.g. ADDCOMMENT */
    actionName: PropTypes.string,

    /** Person who created the action */
    person: PropTypes.arrayOf(reportActionFragmentPropTypes),

    /** ID of the report action */
    sequenceNumber: PropTypes.number,

    /** ISO-formatted datetime */
    created: PropTypes.string,

    /** report action message */
    message: PropTypes.arrayOf(reportActionFragmentPropTypes),

    /** Original message associated with this action */
    originalMessage: PropTypes.shape({
        // The ID of the iou transaction
        IOUTransactionID: PropTypes.string,
    }),

    /** Whether we have received a response back from the server */
    isLoading: PropTypes.bool,

    /** Error message that's come back from the server. */
    error: PropTypes.string,
};
