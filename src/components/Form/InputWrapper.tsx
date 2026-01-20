import type {ComponentPropsWithoutRef, ComponentType, ForwardedRef} from 'react';
import React, {useContext} from 'react';
import type {SubmitBehavior} from 'react-native';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import RoomNameInput from '@components/RoomNameInput';
import type RoomNameInputProps from '@components/RoomNameInput/types';
import TextInput from '@components/TextInput';
import type {BaseTextInputProps} from '@components/TextInput/BaseTextInput/types';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import type {ForwardedFSClassProps} from '@libs/Fullstory/types';
import FormContext from './FormContext';
import type {InputComponentBaseProps, InputComponentValueProps, ValidInputs, ValueTypeKey} from './types';

type TextInputBasedComponents = Set<ComponentType<BaseTextInputProps> | ComponentType<RoomNameInputProps>>;

const textInputBasedComponents: TextInputBasedComponents = new Set([TextInput, RoomNameInput]);

type ComputedComponentSpecificRegistrationParams = {
    shouldSubmitForm: boolean;
    shouldSetTouchedOnBlurOnly: boolean;
    submitBehavior?: SubmitBehavior;
};

function computeComponentSpecificRegistrationParams({
    InputComponent,
    shouldSubmitForm,
    multiline,
    autoGrowHeight,
    submitBehavior,
}: InputComponentBaseProps): ComputedComponentSpecificRegistrationParams {
    if (textInputBasedComponents.has(InputComponent)) {
        const isEffectivelyMultiline = !!multiline || !!autoGrowHeight;

        // If the user can use the hardware keyboard, they have access to an alternative way of inserting a new line
        // (like a Shift+Enter keyboard shortcut). For simplicity, we assume that when there's no touch screen, it's a
        // desktop setup with a keyboard.
        const canUseHardwareKeyboard = !canUseTouchScreen();

        // We want to avoid a situation when the user can't insert a new line. For single-line inputs, it's not a problem and we
        // force-enable form submission. For multi-line inputs, ensure that it was requested to enable form submission for this specific
        // input and that alternative ways exist to add a new line.
        const shouldReallySubmitForm = isEffectivelyMultiline ? !!shouldSubmitForm && canUseHardwareKeyboard : true;

        return {
            // There are inputs that don't have onBlur methods, to simulate the behavior of onBlur in e.g. checkbox, we had to
            // use different methods like onPress. This introduced a problem that inputs that have the onBlur method were
            // calling some methods too early or twice, so we had to add this check to prevent that side effect.
            // For now this side effect happened only in `TextInput` components.
            shouldSetTouchedOnBlurOnly: true,
            submitBehavior: isEffectivelyMultiline && shouldReallySubmitForm ? 'blurAndSubmit' : submitBehavior,
            shouldSubmitForm: shouldReallySubmitForm,
        };
    }

    return {
        shouldSetTouchedOnBlurOnly: false,
        // Forward the originally provided value
        submitBehavior,
        shouldSubmitForm: !!shouldSubmitForm,
    };
}

type InputWrapperProps<TInput extends ValidInputs, TValue extends ValueTypeKey = ValueTypeKey> = ComponentPropsWithoutRef<TInput> &
    InputComponentValueProps<TValue> &
    ForwardedFSClassProps & {
        InputComponent: TInput;
        inputID: string;
        isFocused?: boolean;

        /**
         * Should the containing form be submitted when this input is submitted itself?
         * Currently, meaningful only for text inputs.
         */
        shouldSubmitForm?: boolean;

        /** Reference to the outer element */
        ref?: ForwardedRef<AnimatedTextInputRef>;
    };

function InputWrapper<TInput extends ValidInputs, TValue extends ValueTypeKey>({ref, ...props}: InputWrapperProps<TInput, TValue>) {
    const {InputComponent, inputID, valueType = 'string', shouldSubmitForm: propShouldSubmitForm, ...rest} = props as InputComponentBaseProps;
    const {registerInput} = useContext(FormContext);

    const {shouldSetTouchedOnBlurOnly, submitBehavior, shouldSubmitForm} = computeComponentSpecificRegistrationParams(props as InputComponentBaseProps);
    const {key, ...registerInputProps} = registerInput(inputID, shouldSubmitForm, {ref, valueType, ...rest, shouldSetTouchedOnBlurOnly, submitBehavior});

    return (
        <InputComponent
            key={key}
            // TODO: Sometimes we return too many props with register input, so we need to consider if it's better to make the returned type more general and disregard the issue, or we would like to omit the unused props somehow.
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...registerInputProps}
        />
    );
}

export default InputWrapper;
