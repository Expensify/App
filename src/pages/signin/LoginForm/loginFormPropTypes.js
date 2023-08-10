import PropTypes from 'prop-types';

const propTypes = {
    /** Should we dismiss the keyboard when transitioning away from the page? */
    blurOnSubmit: PropTypes.bool,
};

const defaultProps = {
    blurOnSubmit: false,
};

export {propTypes, defaultProps};
