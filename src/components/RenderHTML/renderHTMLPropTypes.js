import PropTypes from 'prop-types';

const propTypes = {
    /** HTML string to render */
    html: PropTypes.string.isRequired,

    /** Optional debug flag */
    debug: PropTypes.bool,
};

const defaultProps = {
    debug: false,
};

export {propTypes, defaultProps};
