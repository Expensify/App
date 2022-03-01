import PropTypes from 'prop-types';
import {
    propTypes as fieldPropTypes,
    defaultProps as defaultFieldPropTypes,
} from '../TextInput/baseTextInputPropTypes';

const propTypes = {
    ...fieldPropTypes,

    /* Stores the drafted date/ default value to be set for the user. */
    defaultValue: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),

    /* Restricts for selectable max date range for the picker */
    maximumDate: PropTypes.instanceOf(Date),
};

const defaultProps = {
    ...defaultFieldPropTypes,
    maximumDate: undefined,
};

export {propTypes, defaultProps};
