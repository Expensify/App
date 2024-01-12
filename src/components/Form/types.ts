import type {ComponentProps, ElementType, FocusEvent, MutableRefObject, ReactNode} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import type {OnyxFormKey, OnyxValues} from '@src/ONYXKEYS';
import type {Form} from '@src/types/onyx';

type ValueType = 'string' | 'boolean' | 'date';

type ValidInput = ElementType;

type InputProps<TInput extends ValidInput> = ComponentProps<TInput> & {
    shouldSetTouchedOnBlurOnly?: boolean;
    onValueChange?: (value: unknown, key: string) => void;
    onTouched?: (event: unknown) => void;
    valueType?: ValueType;
    onBlur: (event: FocusEvent | Parameters<NonNullable<ComponentProps<TInput>['onBlur']>>[0]) => void;
};

type InputWrapperProps<TInput extends ValidInput> = InputProps<TInput> & {
    InputComponent: TInput;
    inputID: string;
    valueType?: ValueType;
};

type ExcludeDraft<T> = T extends `${string}Draft` ? never : T;
type OnyxFormKeyWithoutDraft = ExcludeDraft<OnyxFormKey>;

type OnyxFormValues<TOnyxKey extends OnyxFormKey & keyof OnyxValues = OnyxFormKey> = OnyxValues[TOnyxKey];
type OnyxFormValuesFields<TOnyxKey extends OnyxFormKey & keyof OnyxValues = OnyxFormKey> = Omit<OnyxValues[TOnyxKey], keyof Form>;

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

type RegisterInput = <TInput extends ValidInput>(inputID: string, props: InputProps<TInput>) => InputProps<TInput>;

type InputRef = BaseTextInputRef;
type InputRefs = Record<string, MutableRefObject<InputRef>>;

export type {InputWrapperProps, ValidInput, FormProps, RegisterInput, ValueType, OnyxFormValues, OnyxFormValuesFields, InputProps, InputRef, InputRefs, OnyxFormKeyWithoutDraft};
