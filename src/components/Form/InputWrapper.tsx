import type {ForwardedRef} from 'react';
import React, {forwardRef, useContext} from 'react';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import RoomNameInput from '@components/RoomNameInput';
import TextInput from '@components/TextInput';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import FormContext from './FormContext';
import type {InputWrapperProps, ValidInputs} from './types';

const textInputBasedComponents: ValidInputs[] = [TextInput, RoomNameInput];

function computeComponentSpecificRegistrationParams<TInput extends ValidInputs>({
    InputComponent,
    shouldSubmitForm,
    multiline,
    autoGrowHeight,
    blurOnSubmit,
}: InputWrapperProps<TInput>): {
    readonly shouldSubmitForm: boolean;
    readonly blurOnSubmit: boolean | undefined;
    readonly shouldSetTouchedOnBlurOnly: boolean;
} {
    if (textInputBasedComponents.includes(InputComponent)) {
        const isEffectivelyMultiline = Boolean(multiline) || Boolean(autoGrowHeight);

        // If the user can use the hardware keyboard, they have access to an alternative way of inserting a new line
        // (like a Shift+Enter keyboard shortcut). For simplicity, we assume that when there's no touch screen, it's a
        // desktop setup with a keyboard.
        const canUseHardwareKeyboard = !canUseTouchScreen();

        // We want to avoid a situation when the user can't insert a new line. For single-line inputs, it's not a problem and we
        // force-enable form submission. For multi-line inputs, ensure that it was requested to enable form submission for this specific
        // input and that alternative ways exist to add a new line.
        const shouldReallySubmitForm = isEffectivelyMultiline ? Boolean(shouldSubmitForm) && canUseHardwareKeyboard : true;

        return {
            // There are inputs that don't have onBlur methods, to simulate the behavior of onBlur in e.g. checkbox, we had to
            // use different methods like onPress. This introduced a problem that inputs that have the onBlur method were
            // calling some methods too early or twice, so we had to add this check to prevent that side effect.
            // For now this side effect happened only in `TextInput` components.
            shouldSetTouchedOnBlurOnly: true,
            blurOnSubmit: (isEffectivelyMultiline && shouldReallySubmitForm) || blurOnSubmit,
            shouldSubmitForm: shouldReallySubmitForm,
        };
    }

    return {
        shouldSetTouchedOnBlurOnly: false,
        // Forward the originally provided value
        blurOnSubmit,
        shouldSubmitForm: false,
    };
}

function InputWrapper<TInput extends ValidInputs>(props: InputWrapperProps<TInput>, ref: ForwardedRef<AnimatedTextInputRef>) {
    const {InputComponent, inputID, valueType = 'string', shouldSubmitForm: propShouldSubmitForm, ...rest} = props;
    const {registerInput} = useContext(FormContext);

    const {shouldSetTouchedOnBlurOnly, blurOnSubmit, shouldSubmitForm} = computeComponentSpecificRegistrationParams(props);

    // TODO: Sometimes we return too many props with register input, so we need to consider if it's better to make the returned type more general and disregard the issue, or we would like to omit the unused props somehow.
    // eslint-disable-next-line react/jsx-props-no-spreading, @typescript-eslint/no-explicit-any
    return <InputComponent {...(registerInput(inputID, shouldSubmitForm, {ref, valueType, ...rest, shouldSetTouchedOnBlurOnly, blurOnSubmit}) as any)} />;
}

InputWrapper.displayName = 'InputWrapper';

export default forwardRef(InputWrapper);
