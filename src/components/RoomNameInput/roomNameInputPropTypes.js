import PropTypes from 'prop-types';
import {withLocalizePropTypes} from '../withLocalize';

const propTypes = {
    /** Callback to execute when the text input is modified correctly */
    onChangeText: PropTypes.func,

    /** Room name to show in input field. This should include the '#' already prefixed to the name */
    value: PropTypes.string,

    /** Whether we should show the input as disabled */
    disabled: PropTypes.bool,

    /** Error text to show */
    errorText: PropTypes.string,

    ...withLocalizePropTypes,

    /** A ref forwarded to the TextInput */
    forwardedRef: PropTypes.func,

    /** The ID used to uniquely identify the input in a Form */
    inputID: PropTypes.string,

    /** Callback that is called when the text input is blurred */
    onBlur: PropTypes.func,

    /** AutoFocus */
    autoFocus: PropTypes.bool,
};

const defaultProps = {
    onChangeText: () => {},
    value: '',
    disabled: false,
    errorText: '',
    forwardedRef: () => {},

    inputID: undefined,
    onBlur: () => {},
    autoFocus: false,
};

export {propTypes, defaultProps};
