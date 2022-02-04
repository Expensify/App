import PropTypes from 'prop-types';
import * as FormUtils from '../../libs/FormUtils';
import {
    propTypes as fieldPropTypes,
    defaultProps as defaultFieldPropTypes,
} from '../TextInput/baseTextInputPropTypes';

const propTypes = {
    ...fieldPropTypes,

    /**
     * The datepicker supports any value that `moment` can parse.
     * `onChange` would always be called with a Date (or null)
     */
    value: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),

    /* Restricts for selectable max date range for the picker */
    maximumDate: PropTypes.instanceOf(Date),

    /** Indicates that the input is being used with the Form component */
    isFormInput: PropTypes.bool,

    /**
      * The ID used to uniquely identify the input
      *
      * @param {Object} props - props passed to the input
      * @returns {Object} - returns an Error object if isFormInput is supplied but inputID is falsey or not a string
      */
    inputID: props => FormUtils.getInputIDPropTypes(props),

    /** Saves a draft of the input value when used in a form */
    shouldSaveDraft: PropTypes.bool,

    /** Error text to appear below input */
    errorText: PropTypes.string,

};

const defaultProps = {
    ...defaultFieldPropTypes,
    value: undefined,
    maximumDate: undefined,
    isFormInput: false,
    shouldSaveDraft: false,

};

export {propTypes, defaultProps};
