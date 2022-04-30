import PropTypes from 'prop-types';
import {
    propTypes as fieldPropTypes,
    defaultProps as defaultFieldPropTypes,
} from '../TextInput/baseTextInputPropTypes';

const propTypes = {
    ...fieldPropTypes,

    /**
     * The datepicker supports any value that `moment` can parse.
     * `onInputChange` would always be called with a Date (or null)
     */
    value: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),

    /**
     * The datepicker supports any defaultValue that `moment` can parse.
     * `onInputChange` would always be called with a Date (or null)
     */
    defaultValue: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),

    /* Restricts for selectable max date range for the picker */
    maximumDate: PropTypes.instanceOf(Date),
};

const defaultProps = {
    ...defaultFieldPropTypes,
    value: undefined,
    maximumDate: undefined,
};

export {propTypes, defaultProps};
