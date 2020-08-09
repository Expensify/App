import PropTypes from 'prop-types';

import HistoryFragmentPropTypes from './ReportHistoryFragmentPropTypes';

export default {
    // Name of the action e.g. ADDCOMMENT
    actionName: PropTypes.string.isRequired,

    // Person who created the action
    person: PropTypes.arrayOf(HistoryFragmentPropTypes).isRequired,

    // ID of the report action
    sequenceNumber: PropTypes.number.isRequired,

    // Unix timestamp
    timestamp: PropTypes.number.isRequired,

    // Report history message
    message: PropTypes.arrayOf(HistoryFragmentPropTypes).isRequired,
};
