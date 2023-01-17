import PropTypes from 'prop-types';
import CONST from '../CONST';
import participantPropTypes from './participantPropTypes';

export default PropTypes.shape({
    // Text to display
    text: PropTypes.string,

    /** Display the text of the option in bold font style */
    boldStyle: PropTypes.bool,

    // Alternate text to display
    alternateText: PropTypes.string,

    // Array of URLs or icons
    icons: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.func])),

    // Login (only present when there is a single participant)
    login: PropTypes.string,

    // reportID (only present when there is a matching report)
    reportID: PropTypes.string,

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

    // Whether the option has an outstanding IOU
    hasOutstandingIOU: PropTypes.bool,

    // Custom icon to render on the right side of the option
    customIcon: PropTypes.shape({
        // The icon source
        src: PropTypes.func,

        // The color of the icon
        color: PropTypes.string,
    }),

    // List of participants of the report
    participantsList: PropTypes.arrayOf(participantPropTypes),

    // Descriptive text to be displayed besides selection element
    descriptiveText: PropTypes.string,

    // The type of option we have e.g. user or report
    type: PropTypes.string,

    // Text to show for tooltip
    tooltipText: PropTypes.string,

    /** If we need to show a brick road indicator or not */
    brickRoadIndicator: PropTypes.oneOf([CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR, '']),
});
