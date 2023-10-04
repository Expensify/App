import PropTypes from 'prop-types';
import reportActionFragmentPropTypes from './reportActionFragmentPropTypes';

export default {
    /** The ID of the reportAction. It is the string representation of the a 64-bit integer. */
    reportActionID: PropTypes.string,

    /** Name of the action e.g. ADDCOMMENT */
    actionName: PropTypes.string,

    /** Person who created the action */
    person: PropTypes.arrayOf(reportActionFragmentPropTypes),

    /** ISO-formatted datetime */
    created: PropTypes.string,

    /** report action message */
    message: PropTypes.arrayOf(reportActionFragmentPropTypes),

    /** Original message associated with this action */
    originalMessage: PropTypes.shape({
        // The ID of the iou transaction
        IOUTransactionID: PropTypes.string,
    }),

    /** Error message that's come back from the server. */
    error: PropTypes.string,

    /** accountIDs of the people to which the whisper was sent to (if any). Returns empty array if it is not a whisper */
    whisperedToAccountIDs: PropTypes.arrayOf(PropTypes.number),
};
