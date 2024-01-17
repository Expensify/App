import type {ComponentProps, FocusEvent, ForwardedRef, FunctionComponent, Key, MutableRefObject, ReactNode, Ref, RefAttributes} from 'react';
import {ComponentType} from 'react';
import type {NativeSyntheticEvent, StyleProp, TextInputFocusEventData, ViewStyle} from 'react-native';
import type {OnyxFormKey, OnyxValues} from '@src/ONYXKEYS';
import type Form from '@src/types/onyx/Form';
import type {BaseForm, FormValueType} from '@src/types/onyx/Form';

type ValueTypeKey = 'string' | 'boolean' | 'date';

type BaseInputProps = {
    shouldSetTouchedOnBlurOnly?: boolean;
    onValueChange?: (value: unknown, key: string) => void;
    onTouched?: (event: unknown) => void;
    valueType?: ValueTypeKey;
    value?: FormValueType;
    defaultValue?: FormValueType;
    onBlur?: (event: FocusEvent | NativeSyntheticEvent<TextInputFocusEventData>) => void;
    onPressOut?: (event: unknown) => void;
    onPress?: (event: unknown) => void;
    shouldSaveDraft?: boolean;
    shouldUseDefaultValue?: boolean;
    key?: Key | null | undefined;
    ref?: Ref<FunctionComponent<BaseInputProps>>;
    isFocused?: boolean;
};

type InputWrapperProps<TInput, TInputProps extends BaseInputProps> = TInputProps & {
    InputComponent: TInput;
    inputID: string;
};

type ExcludeDraft<T> = T extends `${string}Draft` ? never : T;
type OnyxFormKeyWithoutDraft = ExcludeDraft<OnyxFormKey>;

type OnyxFormValues<TOnyxKey extends OnyxFormKey & keyof OnyxValues = OnyxFormKey> = OnyxValues[TOnyxKey];
type OnyxFormValuesFields<TOnyxKey extends OnyxFormKey & keyof OnyxValues = OnyxFormKey> = Omit<OnyxFormValues<TOnyxKey>, keyof BaseForm>;

type FormProps<TFormID extends OnyxFormKey = OnyxFormKey> = {
    /** A unique Onyx key identifying the form */
    formID: TFormID;

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

type RegisterInput = <TInputProps extends BaseInputProps>(inputID: keyof Form, inputProps: TInputProps) => TInputProps;

type InputRef = FunctionComponent<BaseInputProps>;
type InputRefs = Record<string, MutableRefObject<InputRef>>;

export type {InputWrapperProps, FormProps, RegisterInput, BaseInputProps, ValueTypeKey, OnyxFormValues, OnyxFormValuesFields, InputRef, InputRefs, OnyxFormKeyWithoutDraft};
