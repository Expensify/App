import PropTypes from 'prop-types';

const propTypes = {
    /** Picker label */
    label: PropTypes.string,

    /** Picker value */
    value: PropTypes.string,

    /** Something to show as the placeholder before something is selected */
    placeholder: PropTypes.shape({
        /** The value of the placeholder item, usually an empty string */
        value: PropTypes.string,

        /** The text to be displayed as the placeholder */
        label: PropTypes.string,
    }),

    /** Should the picker appear disabled? */
    isDisabled: PropTypes.boolean,

    /** Picker size */
    size: PropTypes.oneOf(['normal', 'small']),
};

const defaultProps = {
    label: '',
    value: '',
    placeholder: {},
    isDisabled: false,
    size: 'normal',
};

export {propTypes, defaultProps};
