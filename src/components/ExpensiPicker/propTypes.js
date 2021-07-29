import PropTypes from 'prop-types';

const propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,

    /** Something to show as the placeholder before something is selected */
    placeholder: PropTypes.shape({
        /** The value of the placeholder item, usually an empty string */
        value: PropTypes.string,

        /** The text to be displayed as the placeholder */
        label: PropTypes.string,
    }),

    /** Picker disabled style */
    useDisabledStyles: PropTypes.boolean,

    /** Picker size */
    size: PropTypes.oneOf(['normal', 'small']),
};

export default propTypes;
