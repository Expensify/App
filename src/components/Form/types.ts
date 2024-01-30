import type {ComponentProps, FocusEvent, Key, MutableRefObject, ReactNode, Ref} from 'react';
import type {GestureResponderEvent, NativeSyntheticEvent, StyleProp, TextInputFocusEventData, TextInputSubmitEditingEventData, ViewStyle} from 'react-native';
import type AddressSearch from '@components/AddressSearch';
import type AmountTextInput from '@components/AmountTextInput';
import type CheckboxWithLabel from '@components/CheckboxWithLabel';
import type Picker from '@components/Picker';
import type SingleChoiceQuestion from '@components/SingleChoiceQuestion';
import type TextInput from '@components/TextInput';
import type {OnyxFormKey, OnyxValues} from '@src/ONYXKEYS';
import type Form from '@src/types/onyx/Form';
import type {BaseForm, FormValueType} from '@src/types/onyx/Form';

/**
 * This type specifies all the inputs that can be used with `InputWrapper` component. Make sure to update it
 * when adding new inputs or removing old ones.
 *
 * TODO: Add remaining inputs here once these components are migrated to Typescript:
 * CountrySelector | StatePicker | DatePicker | EmojiPickerButtonDropdown | RoomNameInput | ValuePicker
 */
type ValidInputs = typeof TextInput | typeof AmountTextInput | typeof SingleChoiceQuestion | typeof CheckboxWithLabel | typeof Picker | typeof AddressSearch;

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
    ref?: Ref<unknown>;
    isFocused?: boolean;
    measureLayout?: (ref: unknown, callback: MeasureLayoutOnSuccessCallback) => void;
    focus?: () => void;
    multiline?: boolean;
    autoGrowHeight?: boolean;
    blurOnSubmit?: boolean;
    onSubmitEditing?: (event: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => void;
};

type InputWrapperProps<TInput extends ValidInputs> = Omit<BaseInputProps, 'ref'> &
    ComponentProps<TInput> & {
        InputComponent: TInput;
        inputID: string;

        /**
         * Should the containing form be submitted when this input is submitted itself?
         * Currently, meaningful only for text inputs.
         */
        shouldSubmitForm?: boolean;
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
    onSubmit: (values: OnyxFormValuesFields<TFormID>) => void;

    /** Should the button be enabled when offline */
    enabledWhenOffline?: boolean;

    /** Whether the form submit action is dangerous */
    isSubmitActionDangerous?: boolean;

    /** Should fix the errors alert be displayed when there is an error in the form */
    shouldHideFixErrorsAlert?: boolean;

    /** Whether ScrollWithContext should be used instead of regular ScrollView. Set to true when there's a nested Picker component in Form. */
    scrollContextEnabled?: boolean;

    /** Container styles */
    style?: StyleProp<ViewStyle>;

    /** Custom content to display in the footer after submit button */
    footerContent?: ReactNode;
};

type RegisterInput = <TInputProps extends BaseInputProps>(inputID: keyof Form, shouldSubmitForm: boolean, inputProps: TInputProps) => TInputProps;

type InputRefs = Record<string, MutableRefObject<BaseInputProps>>;

export type {InputWrapperProps, FormProps, RegisterInput, ValidInputs, BaseInputProps, ValueTypeKey, OnyxFormValues, OnyxFormValuesFields, InputRefs, OnyxFormKeyWithoutDraft};
