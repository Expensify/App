import type {ForwardedRef} from 'react';
import React, {forwardRef, useContext} from 'react';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import TextInput from '@components/TextInput';
import FormContext from './FormContext';
import type {InputWrapperProps, ValidInputs} from './types';

function InputWrapper<TInput extends ValidInputs>({InputComponent, inputID, valueType = 'string', ...rest}: InputWrapperProps<TInput>, ref: ForwardedRef<AnimatedTextInputRef>) {
    const {registerInput} = useContext(FormContext);
    // There are inputs that don't have onBlur methods, to simulate the behavior of onBlur in e.g. checkbox, we had to
    // use different methods like onPress. This introduced a problem that inputs that have the onBlur method were
    // calling some methods too early or twice, so we had to add this check to prevent that side effect.
    // For now this side effect happened only in `TextInput` components.
    const shouldSetTouchedOnBlurOnly = InputComponent === TextInput;

    // TODO: Sometimes we return too many props with register input, so we need to consider if it's better to make the returned type more general and disregard the issue, or we would like to omit the unused props somehow.
    // eslint-disable-next-line react/jsx-props-no-spreading, @typescript-eslint/no-explicit-any
    return <InputComponent {...(registerInput(inputID, {ref, valueType, ...rest, shouldSetTouchedOnBlurOnly}) as any)} />;
}

InputWrapper.displayName = 'InputWrapper';

export default forwardRef(InputWrapper);
