import PropTypes from 'prop-types';
import * as FormUtils from '../../libs/FormUtils';

const propTypes = {
    /** Input label */
    label: PropTypes.string,

    /** Name attribute for the input */
    name: PropTypes.string,

    /** Input value */
    value: PropTypes.string,

    /** Default value - used for non controlled inputs */
    defaultValue: PropTypes.string,

    /** Input value placeholder */
    placeholder: PropTypes.string,

    /** Error text to display */
    errorText: PropTypes.string,

    /** Customize the TextInput container */
    containerStyles: PropTypes.arrayOf(PropTypes.object),

    /** input style */
    inputStyle: PropTypes.arrayOf(PropTypes.object),

    /** If present, this prop forces the label to remain in a position where it will not collide with input text */
    forceActiveLabel: PropTypes.bool,

    /** Should the input auto focus? */
    autoFocus: PropTypes.bool,

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

    /** Maximum charactor allowed */
    maxLength: PropTypes.number,

    /** Hint text to display below the TextInput */
    hint: PropTypes.string,
};

const defaultProps = {
    isFormInput: false,
    label: '',
    name: '',
    errorText: '',
    placeholder: '',
    hasError: false,
    containerStyles: [],
    inputStyle: [],
    autoFocus: false,

    /**
     * To be able to function as either controlled or uncontrolled component we should not
     * assign a default prop value for `value` or `defaultValue` props
     */
    value: undefined,
    defaultValue: undefined,
    forceActiveLabel: false,
    shouldSaveDraft: false,
    maxLength: null,
    hint: '',
};

export {propTypes, defaultProps};
