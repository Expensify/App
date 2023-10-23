import PropTypes from 'prop-types';

const propTypes = {
    /** A callback that runs when close icon is pressed */
    onClose: PropTypes.func.isRequired,

    /**
     * The location error code from onyx
     * - code -1 = location not supported (web only)
     * - code 1 = location permission is not enabled
     * - code 2 = location is unavailable or there is some connection issue
     * - code 3 = location fetch timeout
     */
    locationErrorCode: PropTypes.oneOf([-1, 1, 2, 3]),
};

const defaultProps = {
    locationErrorCode: null,
};

export {propTypes, defaultProps};
