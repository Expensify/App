import PropTypes from 'prop-types';
import moment from 'moment';
import CONST from '../../CONST';

const calendarPickerPropType = {
    /** An initial value of date */
    value: PropTypes.objectOf(Date),

    /** A minimum date (oldest) allowed to select */
    minDate: PropTypes.objectOf(Date),

    /** A maximum date (earliest) allowed to select */
    maxDate: PropTypes.objectOf(Date),

    /** Default year to be set in the calendar picker. Used with navigation to set the correct year after going back to the view with calendar */
    defaultYear: PropTypes.string,

    /** A function that is called when the date changed inside the calendar component */
    onChanged: PropTypes.func,

    /** A function called when the date is selected */
    onSelected: PropTypes.func,

    /** Callback function to call when year is pressed */
    onYearPressed: PropTypes.func,

    /** Callback function to run when pressing close button. Used with navigation to set the correct year after going back to the view with calendar */
    onClosePressed: PropTypes.func,
};

const defaultCalendarPickerPropType = {
    value: new Date(),
    minDate: moment().add(CONST.DATE_BIRTH.MIN_AGE, 'M'),
    maxDate: moment().add(CONST.DATE_BIRTH.MAX_AGE, 'M'),
    defaultYear: null,
    onChanged: () => {},
    onSelected: () => {},
    onYearPressed: () => {},
    onClosePressed: () => {},
};

export {calendarPickerPropType, defaultCalendarPickerPropType};
