import PropTypes from 'prop-types';
import moment from 'moment';
import CONST from '../../CONST';

const propTypes = {
    /** An initial value of date string */
    value: PropTypes.string,

    /** A minimum date (oldest) allowed to select */
    minDate: PropTypes.objectOf(Date),

    /** A maximum date (earliest) allowed to select */
    maxDate: PropTypes.objectOf(Date),

    /** Default year to be set in the calendar picker. Used with navigation to set the correct year after going back to the view with calendar */
    selectedYear: PropTypes.string,

    /** Default month to be set in the calendar picker. Used to keep last selected month after going back to the view with calendar */
    selectedMonth: PropTypes.number,

    /** A function that is called when the date changed inside the calendar component */
    onChanged: PropTypes.func,

    /** A function called when the date is selected */
    onSelected: PropTypes.func,

    /** A function called when the year picker is opened */
    onYearPickerOpen: PropTypes.func,
};

const defaultProps = {
    value: new Date(),
    minDate: moment().year(CONST.CALENDAR_PICKER.MIN_YEAR).toDate(),
    maxDate: moment().year(CONST.CALENDAR_PICKER.MAX_YEAR).toDate(),
    selectedYear: null,
    selectedMonth: null,
    onChanged: () => {},
    onSelected: () => {},
    onYearPickerOpen: () => {},
};

export {propTypes, defaultProps};
