import PropTypes from 'prop-types';
import React, {forwardRef, useContext} from 'react';
import refPropTypes from '@components/refPropTypes';
import TextInput from '@components/TextInput';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import FormContext from './FormContext';

const propTypes = {
    InputComponent: PropTypes.oneOfType([PropTypes.func, PropTypes.elementType]).isRequired,
    inputID: PropTypes.string.isRequired,
    valueType: PropTypes.string,
    forwardedRef: refPropTypes,

    /** Whether the input allows the form to be submitted when the user presses enter.
     *  This is useful for inputs that are not multiline and don't have a submit button by default.
     *  This property is ignored on mobile devices as they don't have a shift + enter key to create a newline.
     */
    inputAllowsSubmit: PropTypes.bool,
};

const defaultProps = {
    forwardedRef: undefined,
    valueType: 'string',
    inputAllowsSubmit: false,
};

const canUseSubmitEditing = (multiline, autoGrowHeight, inputAllowsSubmit) => {
    const isMultiline = multiline || autoGrowHeight;
    if (!isMultiline) {
        return true;
    }
    return Boolean(inputAllowsSubmit) && !canUseTouchScreen();
};

function InputWrapper(props) {
    const {InputComponent, inputID, forwardedRef, inputAllowsSubmit, ...rest} = props;
    const shouldSubmitEdit = canUseSubmitEditing(rest.multiline, rest.autoGrowHeight, inputAllowsSubmit);
    const {registerInput} = useContext(FormContext);
    // There are inputs that dont have onBlur methods, to simulate the behavior of onBlur in e.g. checkbox, we had to
    // use different methods like onPress. This introduced a problem that inputs that have the onBlur method were
    // calling some methods too early or twice, so we had to add this check to prevent that side effect.
    // For now this side effect happened only in `TextInput` components.
    const shouldSetTouchedOnBlurOnly = InputComponent === TextInput;
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <InputComponent {...registerInput(inputID, shouldSubmitEdit, {ref: forwardedRef, shouldSetTouchedOnBlurOnly, ...rest})} />;
}

InputWrapper.propTypes = propTypes;
InputWrapper.defaultProps = defaultProps;
InputWrapper.displayName = 'InputWrapper';

const InputWrapperWithRef = forwardRef((props, ref) => (
    <InputWrapper
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));

InputWrapperWithRef.displayName = 'InputWrapperWithRef';

export default InputWrapperWithRef;
