import PropTypes from 'prop-types';
import participantPropTypes from './participantPropTypes';

export default PropTypes.shape({
    // Text to display
    text: PropTypes.string,

    // Alternate text to display
    alternateText: PropTypes.string,

    // Array of URLs or icons
    icons: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.func])),

    // Login (only present when there is a single participant)
    login: PropTypes.string,

    // reportID (only present when there is a matching report)
    reportID: PropTypes.number,

    // Whether the report has read or not
    isUnread: PropTypes.bool,

    // Whether the report has a draft comment or not
    hasDraftComment: PropTypes.bool,

    // Key used internally by React
    keyForList: PropTypes.string,

    // Search text we use to filter options
    searchText: PropTypes.string,

    // Whether the report is pinned or not
    isPinned: PropTypes.bool,

    // Whether the report corresponds to a chat room
    isChatRoom: PropTypes.bool,

    // List of participants of the report
    participantsList: PropTypes.arrayOf(participantPropTypes),

    // Descriptive text to be displayed besides selection element
    descriptiveText: PropTypes.string,

    // The type of option we have e.g. user or report
    type: PropTypes.string,

    // Text to show for tooltip
    tooltipText: PropTypes.string,
});
