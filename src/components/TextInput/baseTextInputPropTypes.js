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
    textInputContainerStyles: PropTypes.arrayOf(PropTypes.object),

    /** Customize the main container */
    containerStyles: PropTypes.arrayOf(PropTypes.object),

    /** input style */
    inputStyle: PropTypes.arrayOf(PropTypes.object),

    /** If present, this prop forces the label to remain in a position where it will not collide with input text */
    forceActiveLabel: PropTypes.bool,

    /** Should the input auto focus? */
    autoFocus: PropTypes.bool,

    /** Disable the virtual keyboard  */
    disableKeyboard: PropTypes.bool,

    /** Autogrow input container size based on the entered text  */
    autoGrow: PropTypes.bool,

    /** Hide the focus styles on TextInput */
    hideFocusedState: PropTypes.bool,

    /** Forward the inner ref */
    innerRef: PropTypes.func,

    /** Maximum characters allowed */
    maxLength: PropTypes.number,

    /** Hint text to display below the TextInput */
    hint: PropTypes.string,

    /** Prefix character */
    prefixCharacter: PropTypes.string,

    /** Form props */

    /** Indicates that the input is being used with the Form component */
    isFormInput: PropTypes.bool,

    /**
     * The ID used to uniquely identify the input
     *
     * @param {Object} props - props passed to the input
     * @returns {Object} - returns an Error object if isFormInput is supplied but inputID is falsey or not a string
     */
    inputID: props => FormUtils.validateInputIDProps(props),

    /** Saves a draft of the input value when used in a form */
    shouldSaveDraft: PropTypes.bool,

    /** Callback to update the value on Form when input is used in the Form component. */
    onInputChange: PropTypes.func,
};

const defaultProps = {
    isFormInput: false,
    label: '',
    name: '',
    errorText: '',
    placeholder: '',
    hasError: false,
    containerStyles: [],
    textInputContainerStyles: [],
    inputStyle: [],
    autoFocus: false,

    /**
     * To be able to function as either controlled or uncontrolled component we should not
     * assign a default prop value for `value` or `defaultValue` props
     */
    value: undefined,
    defaultValue: undefined,
    forceActiveLabel: false,
    disableKeyboard: false,
    autoGrow: false,
    hideFocusedState: false,
    innerRef: () => {},
    shouldSaveDraft: false,
    maxLength: null,
    hint: '',
    prefixCharacter: '',
    onInputChange: () => {},
};

export {propTypes, defaultProps};
