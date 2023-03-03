import PropTypes from 'prop-types';

const propTypes = {
    /** A function that is called when the day is clicked */
    onChange: PropTypes.func,

    /** A value initial of date */
    value: PropTypes.objectOf(Date),

    /** A minimum date of calendar to select */
    minDate: PropTypes.objectOf(Date),

    /** A maximum date of calendar to select */
    maxDate: PropTypes.objectOf(Date),
};

const defaultProps = {
    value: new Date(),
    minDate: null,
    maxDate: null,
    onChange: null,
};

export {propTypes, defaultProps};
