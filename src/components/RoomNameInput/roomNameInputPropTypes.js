import PropTypes from 'prop-types';
import refPropTypes from '@components/refPropTypes';
import {translatableTextPropTypes} from '@libs/Localize';

const propTypes = {
    /** Callback to execute when the text input is modified correctly */
    onChangeText: PropTypes.func,

    /** Room name to show in input field. This should include the '#' already prefixed to the name */
    value: PropTypes.string,

    /** Whether we should show the input as disabled */
    disabled: PropTypes.bool,

    /** Error text to show */
    errorText: translatableTextPropTypes,

    /** A ref forwarded to the TextInput */
    forwardedRef: refPropTypes,

    /** On submit editing handler provided by the FormProvider */
    onSubmitEditing: PropTypes.func,

    /** Return key type provided to the TextInput  */
    returnKeyType: PropTypes.string,

    /** The ID used to uniquely identify the input in a Form */
    inputID: PropTypes.string,

    /** Callback that is called when the text input is blurred */
    onBlur: PropTypes.func,

    /** AutoFocus */
    autoFocus: PropTypes.bool,

    /** Whether we should wait before focusing the TextInput, useful when using transitions on Android */
    shouldDelayFocus: PropTypes.bool,

    /** Whether navigation is focused */
    isFocused: PropTypes.bool.isRequired,
};

const defaultProps = {
    onChangeText: () => {},
    value: '',
    disabled: false,
    errorText: '',
    forwardedRef: () => {},
    onSubmitEditing: () => {},
    returnKeyType: undefined,

    inputID: undefined,
    onBlur: () => {},
    autoFocus: false,
    shouldDelayFocus: false,
};

export {propTypes, defaultProps};
