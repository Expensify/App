import PropTypes from 'prop-types';

export default PropTypes.shape({
    // Text to display
    text: PropTypes.string,

    // Alternate text to display
    alternateText: PropTypes.string,

    // Array of icon urls
    icons: PropTypes.arrayOf(PropTypes.string),

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
});
