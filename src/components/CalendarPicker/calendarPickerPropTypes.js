import PropTypes from 'prop-types';

const propTypes = {
    /** A function that is called when the date changed inside the calendar component */
    onChanged: PropTypes.func,

    /** A function called when the date is selected */
    onSelected: PropTypes.func,

    /** A value initial of date */
    value: PropTypes.objectOf(Date),

    /** A minimum date of calendar to select */
    minDate: PropTypes.objectOf(Date),

    /** A maximum date of calendar to select */
    maxDate: PropTypes.objectOf(Date),

    /** Callback function to call when year is pressed */
    onYearPressed: PropTypes.func,

    /** Default month to be set in the calendar picker */
    defaultMonth: PropTypes.string,

    /** Default year to be set in the calendar picker */
    defaultYear: PropTypes.string,

    /** Callback function to run when pressing close button */
    onClosePressed: PropTypes.func,
};

const defaultProps = {
    value: new Date(),
    minDate: null,
    maxDate: null,
    onChanged: null,
    onSelected: null,
    onYearPressed: null,
};

export {propTypes, defaultProps};
