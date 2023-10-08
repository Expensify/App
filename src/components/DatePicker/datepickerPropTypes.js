import PropTypes from 'prop-types';
import {propTypes as fieldPropTypes, defaultProps as defaultFieldPropTypes} from '../TextInput/baseTextInputPropTypes';
import CONST from '../../CONST';

const propTypes = {
    ...fieldPropTypes,

    /**
     * The datepicker supports any value that `new Date()` can parse.
     * `onInputChange` would always be called with a Date (or null)
     */
    value: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),

    /**
     * The datepicker supports any defaultValue that `new Date()` can parse.
     * `onInputChange` would always be called with a Date (or null)
     */
    defaultValue: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),

    /** The earliest date allowed to select */
    minDate: PropTypes.instanceOf(Date),

    /** The latest date allowed to select */
    maxDate: PropTypes.instanceOf(Date),
};

const defaultProps = {
    ...defaultFieldPropTypes,
    value: undefined,
    minDate: new Date(CONST.DATE.MIN_DATE),
    maxDate: new Date(CONST.DATE.MAX_DATE),
};

export {propTypes, defaultProps};
