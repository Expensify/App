import PropTypes from 'prop-types';

const calendarPickerPropType = {
    /** A function that is called when the date changed inside the calendar component */
    onChanged: PropTypes.func,

    /** A function called when the date is selected */
    onSelected: PropTypes.func,

    /** An initial value of date */
    value: PropTypes.objectOf(Date),

    /** A minimum date (oldest) allowed to select */
    minDate: PropTypes.objectOf(Date),

    /** A maximum date (earliest) allowed to select */
    maxDate: PropTypes.objectOf(Date),

    /** Callback function to call when year is pressed */
    onYearPressed: PropTypes.func,

    /** Default month to be set in the calendar picker */
    defaultMonth: PropTypes.string,

    /** Default year to be set in the calendar picker. Used with navigation to set the correct year after going back to the view with calendar */
    defaultYear: PropTypes.string,

    /** Callback function to run when pressing close button. Used with navigation to set the correct year after going back to the view with calendar */
    onClosePressed: PropTypes.func,
};

const defaultCalendarPickerPropType = {
    value: new Date(),
    minDate: null,
    maxDate: null,
    onChanged: null,
    onSelected: null,
    onYearPressed: null,
};

export {calendarPickerPropType, defaultCalendarPickerPropType};
