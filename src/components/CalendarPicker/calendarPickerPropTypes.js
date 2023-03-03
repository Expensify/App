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

    /** Callback function to call when month is pressed */
    onMonthPressed: PropTypes.func.isRequired,

    /** Callback function to call when year is pressed */
    onYearPressed: PropTypes.func.isRequired,

    /** Default month to be set in the calendar picker */
    defaultMonth: PropTypes.string,

    /** Default year to be set in the calendar picker */
    defaultYear: PropTypes.string,
};

const defaultProps = {
    value: new Date(),
    minDate: null,
    maxDate: null,
    onChange: null,
    onMonthPressed: null,
    onYearPressed: null,
};

export {propTypes, defaultProps};
