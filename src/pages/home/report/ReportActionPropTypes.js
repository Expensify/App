import PropTypes from 'prop-types';

import ReportActionFragmentPropTypes from './ReportActionFragmentPropTypes';

export default {
    // Name of the action e.g. ADDCOMMENT
    actionName: PropTypes.string,

    // Person who created the action
    person: PropTypes.arrayOf(ReportActionFragmentPropTypes),

    // ID of the report action
    sequenceNumber: PropTypes.number,

    // Unix timestamp
    timestamp: PropTypes.number,

    // report action message
    message: PropTypes.arrayOf(ReportActionFragmentPropTypes),
};
