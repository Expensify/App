import React, {forwardRef, useContext} from 'react';
import TextInput from '@components/TextInput';
import FormContext from './FormContext';
import type {InputProps, InputRef, InputWrapperProps} from './types';

function InputWrapper<TInputProps extends InputProps>({InputComponent, inputID, valueType = 'string', ...rest}: InputWrapperProps<TInputProps>, ref: InputRef) {
    const {registerInput} = useContext(FormContext);

    // There are inputs that don't have onBlur methods, to simulate the behavior of onBlur in e.g. checkbox, we had to
    // use different methods like onPress. This introduced a problem that inputs that have the onBlur method were
    // calling some methods too early or twice, so we had to add this check to prevent that side effect.
    // For now this side effect happened only in `TextInput` components.
    const shouldSetTouchedOnBlurOnly = InputComponent === TextInput;

    // eslint-disable-next-line react/jsx-props-no-spreading
    return <InputComponent {...(registerInput(inputID, {ref, shouldSetTouchedOnBlurOnly, valueType, ...rest}) as TInputProps)} />;
}

InputWrapper.displayName = 'InputWrapper';

export default forwardRef(InputWrapper);
