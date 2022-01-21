import PropTypes from 'prop-types';

const propTypes = {
    /** Name attribute for the input */
    name: PropTypes.string,

    /** A ref to forward to the text input */
    forwardedRef: PropTypes.func,
};

const defaultProps = {
    name: '',
    forwardedRef: () => {},
};

export default {
    propTypes,
    defaultProps,
};
