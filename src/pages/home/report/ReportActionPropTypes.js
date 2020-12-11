import PropTypes from 'prop-types';

import ReportActionFragmentPropTypes from './ReportActionFragmentPropTypes';

export default {
    // Name of the action e.g. ADDCOMMENT
    actionName: PropTypes.string.isRequired,

    // Person who created the action
    person: PropTypes.arrayOf(ReportActionFragmentPropTypes).isRequired,

    // ID of the report action. Can be either a number or a string since
    // temporary report action IDs are unique strings generated in the client.
    sequenceNumber: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
    ]).isRequired,

    // Unix timestamp
    timestamp: PropTypes.number.isRequired,

    // report action message
    message: PropTypes.arrayOf(ReportActionFragmentPropTypes).isRequired,
};
