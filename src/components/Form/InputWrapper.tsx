import React, {ForwardedRef, forwardRef, useContext} from 'react';
import TextInput from '@components/TextInput';
import FormContext from './FormContext';
import {InputWrapperProps} from './types';

function InputWrapper<TInput extends React.ElementType>({InputComponent, inputID, valueType = 'string', ...rest}: InputWrapperProps<TInput>, ref: ForwardedRef<HTMLInputElement>) {
    const {registerInput} = useContext(FormContext);

    // There are inputs that don't have onBlur methods, to simulate the behavior of onBlur in e.g. checkbox, we had to
    // use different methods like onPress. This introduced a problem that inputs that have the onBlur method were
    // calling some methods too early or twice, so we had to add this check to prevent that side effect.
    // For now this side effect happened only in `TextInput` components.
    const shouldSetTouchedOnBlurOnly = InputComponent === TextInput;

    // eslint-disable-next-line react/jsx-props-no-spreading
    return <InputComponent {...registerInput(inputID, {ref, shouldSetTouchedOnBlurOnly, valueType, ...rest})} />;
}

InputWrapper.displayName = 'InputWrapper';

export default forwardRef(InputWrapper);
