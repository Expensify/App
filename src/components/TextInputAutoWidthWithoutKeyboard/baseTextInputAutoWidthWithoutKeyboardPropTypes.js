import PropTypes from 'prop-types';

const propTypes = {
    /** The value of the comment box */
    value: PropTypes.string.isRequired,

    /** A ref to forward to the text input */
    forwardedRef: PropTypes.func.isRequired,

    /** General styles to apply to the text input */
    // eslint-disable-next-line react/forbid-prop-types
    inputStyle: PropTypes.object,

    /** Styles to apply to the text input */
    // eslint-disable-next-line react/forbid-prop-types
    textStyle: PropTypes.object.isRequired,

    /** Optional placeholder to show when there is no value */
    placeholder: PropTypes.string,
};

const defaultProps = {
    inputStyle: {},
    placeholder: '',
};

export {propTypes, defaultProps};
