import PropTypes from 'prop-types';

const sidebarPropTypes = {

    /** reportID in the current navigation state */
    reportIDFromRoute: PropTypes.string,

    /** Callback when onLayout of sidebar is called */
    onLayout: PropTypes.func,
};
export default sidebarPropTypes;
