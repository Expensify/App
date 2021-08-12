import PropTypes from 'prop-types';

const propTypes = {
    children: PropTypes.node,

    /** Optional debug flag. Prints the TRT in the console when true. */
    debug: PropTypes.bool,
};

const defaultProps = {
    children: null,
    debug: false,
};

export {propTypes, defaultProps};
