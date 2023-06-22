import moment from 'moment';
import PropTypes from 'prop-types';
import CONST from '../../CONST';

const propTypes = {
    /** An initial value of date string */
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),

    /** A minimum date (oldest) allowed to select */
    minDate: PropTypes.objectOf(Date),

    /** A maximum date (earliest) allowed to select */
    maxDate: PropTypes.objectOf(Date),

    /** A function called when the date is selected */
    onSelected: PropTypes.func,
};

const defaultProps = {
    value: new Date(),
    minDate: moment().year(CONST.CALENDAR_PICKER.MIN_YEAR).toDate(),
    maxDate: moment().year(CONST.CALENDAR_PICKER.MAX_YEAR).toDate(),
    onSelected: () => {},
};

export {defaultProps, propTypes};
