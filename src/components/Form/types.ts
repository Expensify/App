import {ComponentType, ForwardedRef, ForwardRefExoticComponent, ReactNode, SyntheticEvent} from 'react';
import {GestureResponderEvent, StyleProp, TextInput, ViewStyle} from 'react-native';
import {OnyxFormKey} from '@src/ONYXKEYS';
import {Form} from '@src/types/onyx';

type ValueType = 'string' | 'boolean' | 'date';

type InputWrapperProps<TInputProps> = {
    // TODO: refactor it as soon as TextInput will be written in typescript
    InputComponent: ComponentType<TInputProps> | ForwardRefExoticComponent<unknown>;
    inputID: string;
    valueType?: ValueType;
};

type ExcludeDraft<T> = T extends `${string}Draft` ? never : T;
type OnyxFormKeyWithoutDraft = ExcludeDraft<OnyxFormKey>;

type FormProps = {
    /** A unique Onyx key identifying the form */
    formID: OnyxFormKey;

    /** Text to be displayed in the submit button */
    submitButtonText: string;

    /** Controls the submit button's visibility */
    isSubmitButtonVisible?: boolean;

    /** Callback to submit the form */
    onSubmit: (values?: Record<string, unknown>) => void;

    /** Should the button be enabled when offline */
    enabledWhenOffline?: boolean;

    /** Whether the form submit action is dangerous */
    isSubmitActionDangerous?: boolean;

    /** Whether ScrollWithContext should be used instead of regular ScrollView. Set to true when there's a nested Picker component in Form. */
    scrollContextEnabled?: boolean;

    /** Container styles */
    style?: StyleProp<ViewStyle>;

    /** Custom content to display in the footer after submit button */
    footerContent?: ReactNode;
};

type FormValuesFields<TForm extends Form> = Omit<TForm, keyof Form>;

type InputRef = ForwardedRef<TextInput>;
type InputRefs = Record<string, InputRef>;

type InputPropsToPass = {
    ref?: InputRef;
    key?: string;
    value?: unknown;
    defaultValue?: unknown;
    shouldSaveDraft?: boolean;
    shouldUseDefaultValue?: boolean;
    valueType?: ValueType;
    shouldSetTouchedOnBlurOnly?: boolean;

    onValueChange?: (value: unknown, key?: string) => void;
    onTouched?: (event: GestureResponderEvent | KeyboardEvent) => void;
    onPress?: (event: GestureResponderEvent | KeyboardEvent) => void;
    onPressOut?: (event: GestureResponderEvent | KeyboardEvent) => void;
    onBlur?: (event: SyntheticEvent<TextInput, FocusEvent> | FocusEvent) => void;
    onInputChange?: (value: unknown, key?: string) => void;
};

type InputProps = InputPropsToPass & {
    inputID: string;
    errorText: string;
};

type RegisterInput = (inputID: string, props: InputPropsToPass) => InputProps;

export type {InputWrapperProps, FormProps, InputRef, InputRefs, RegisterInput, ValueType, FormValuesFields, InputProps, OnyxFormKeyWithoutDraft};
