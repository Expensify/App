import PropTypes from 'prop-types';
import {
    propTypes as fieldPropTypes,
    defaultProps as defaultFieldPropTypes,
} from '../ExpensiTextInput/baseExpensiTextInputPropTypes';


const propTypes = {
    ...fieldPropTypes,

    /** The datepicker supports any value that `moment` can parse.
     * `onChange` would always be called with a Date (or null) */
    value: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
};

const defaultProps = {
    ...defaultFieldPropTypes,
    value: undefined,
};

export {propTypes, defaultProps};
