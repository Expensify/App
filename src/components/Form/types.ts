import type {FocusEvent, Key, MutableRefObject, ReactNode, Ref} from 'react';
import type {GestureResponderEvent, NativeSyntheticEvent, StyleProp, TextInputFocusEventData, ViewStyle} from 'react-native';
import type {OnyxFormKey, OnyxValues} from '@src/ONYXKEYS';
import type Form from '@src/types/onyx/Form';
import type {BaseForm, FormValueType} from '@src/types/onyx/Form';

type ValueTypeKey = 'string' | 'boolean' | 'date';

type MeasureLayoutOnSuccessCallback = (left: number, top: number, width: number, height: number) => void;

type BaseInputProps = {
    shouldSetTouchedOnBlurOnly?: boolean;
    onValueChange?: (value: unknown, key: string) => void;
    onTouched?: (event: GestureResponderEvent) => void;
    valueType?: ValueTypeKey;
    value?: FormValueType;
    defaultValue?: FormValueType;
    onBlur?: (event: FocusEvent | NativeSyntheticEvent<TextInputFocusEventData>) => void;
    onPressOut?: (event: GestureResponderEvent) => void;
    onPress?: (event: GestureResponderEvent) => void;
    shouldSaveDraft?: boolean;
    shouldUseDefaultValue?: boolean;
    key?: Key | null | undefined;
    ref?: Ref<BaseInputProps>;
    isFocused?: boolean;
    measureLayout?: (ref: unknown, callback: MeasureLayoutOnSuccessCallback) => void;
    focus?: () => void;
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

type InputRefs = Record<string, MutableRefObject<BaseInputProps>>;

export type {InputWrapperProps, FormProps, RegisterInput, BaseInputProps, ValueTypeKey, OnyxFormValues, OnyxFormValuesFields, InputRefs, OnyxFormKeyWithoutDraft};
