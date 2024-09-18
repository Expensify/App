import type {ComponentType, FocusEvent, Key, MutableRefObject, ReactNode, Ref} from 'react';
import type {GestureResponderEvent, NativeSyntheticEvent, StyleProp, TextInputFocusEventData, TextInputSubmitEditingEventData, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';
import type AddPlaidBankAccount from '@components/AddPlaidBankAccount';
import type AddressSearch from '@components/AddressSearch';
import type AmountForm from '@components/AmountForm';
import type AmountPicker from '@components/AmountPicker';
import type AmountTextInput from '@components/AmountTextInput';
import type CheckboxWithLabel from '@components/CheckboxWithLabel';
import type CountryPicker from '@components/CountryPicker';
import type CountrySelector from '@components/CountrySelector';
import type CurrencySelector from '@components/CurrencySelector';
import type DatePicker from '@components/DatePicker';
import type EmojiPickerButtonDropdown from '@components/EmojiPicker/EmojiPickerButtonDropdown';
import type PercentageForm from '@components/PercentageForm';
import type Picker from '@components/Picker';
import type RadioButtons from '@components/RadioButtons';
import type RoomNameInput from '@components/RoomNameInput';
import type SingleChoiceQuestion from '@components/SingleChoiceQuestion';
import type StatePicker from '@components/StatePicker';
import type StateSelector from '@components/StateSelector';
import type TextInput from '@components/TextInput';
import type TextPicker from '@components/TextPicker';
import type ValuePicker from '@components/ValuePicker';
import type BusinessTypePicker from '@pages/ReimbursementAccount/BusinessInfo/substeps/TypeBusiness/BusinessTypePicker';
import type DimensionTypeSelector from '@pages/workspace/accounting/intacct/import/DimensionTypeSelector';
import type NetSuiteCustomFieldMappingPicker from '@pages/workspace/accounting/netsuite/import/NetSuiteImportCustomFieldNew/NetSuiteCustomFieldMappingPicker';
import type NetSuiteCustomListPicker from '@pages/workspace/accounting/netsuite/import/NetSuiteImportCustomFieldNew/NetSuiteCustomListPicker';
import type NetSuiteMenuWithTopDescriptionForm from '@pages/workspace/accounting/netsuite/import/NetSuiteImportCustomFieldNew/NetSuiteMenuWithTopDescriptionForm';
import type {Country} from '@src/CONST';
import type {OnyxFormKey, OnyxValues} from '@src/ONYXKEYS';
import type {BaseForm} from '@src/types/form/Form';

/**
 * This type specifies all the inputs that can be used with `InputWrapper` component. Make sure to update it
 * when adding new inputs or removing old ones.
 */
type ValidInputs =
    | typeof TextInput
    | typeof AmountTextInput
    | typeof SingleChoiceQuestion
    | typeof CheckboxWithLabel
    | typeof Picker
    | typeof AddressSearch
    | typeof CountrySelector
    | typeof CurrencySelector
    | typeof AmountForm
    | typeof PercentageForm
    | typeof BusinessTypePicker
    | typeof DimensionTypeSelector
    | typeof StateSelector
    | typeof RoomNameInput
    | typeof ValuePicker
    | typeof DatePicker
    | typeof RadioButtons
    | typeof AmountPicker
    | typeof TextPicker
    | typeof AddPlaidBankAccount
    | typeof EmojiPickerButtonDropdown
    | typeof NetSuiteCustomListPicker
    | typeof NetSuiteCustomFieldMappingPicker
    | typeof NetSuiteMenuWithTopDescriptionForm
    | typeof CountryPicker
    | typeof StatePicker;

type ValueTypeKey = 'string' | 'boolean' | 'date' | 'country' | 'reportFields' | 'disabledListValues';
type ValueTypeMap = {
    string: string;
    boolean: boolean;
    date: Date;
    country: Country | '';
    reportFields: string[];
    disabledListValues: boolean[];
};
type FormValue = ValueOf<ValueTypeMap>;

type InputComponentValueProps<TValue extends ValueTypeKey = ValueTypeKey> = {
    valueType?: TValue;
    value?: ValueTypeMap[TValue];
    defaultValue?: ValueTypeMap[TValue];
    onValueChange?: (value: ValueTypeMap[TValue], key: string) => void;
    shouldSaveDraft?: boolean;
    shouldUseDefaultValue?: boolean;
};

type MeasureLayoutOnSuccessCallback = (left: number, top: number, width: number, height: number) => void;
type InputComponentBaseProps<TValue extends ValueTypeKey = ValueTypeKey> = InputComponentValueProps<TValue> & {
    InputComponent: ComponentType;
    inputID: string;
    errorText?: string;
    shouldSetTouchedOnBlurOnly?: boolean;
    isFocused?: boolean;
    measureLayout?: (ref: unknown, callback: MeasureLayoutOnSuccessCallback) => void;
    focus?: () => void;
    label?: string;
    minDate?: Date;
    maxDate?: Date;
    onTouched?: (event: GestureResponderEvent) => void;
    onBlur?: (event: FocusEvent | NativeSyntheticEvent<TextInputFocusEventData>) => void;
    onPressOut?: (event: GestureResponderEvent) => void;
    onPress?: (event: GestureResponderEvent) => void;
    onInputChange?: (value: FormValue, key: string) => void;
    onSubmitEditing?: (event: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => void;
    key?: Key;
    ref?: Ref<unknown>;
    multiline?: boolean;
    autoGrowHeight?: boolean;
    blurOnSubmit?: boolean;
    shouldSubmitForm?: boolean;
};

type FormOnyxValues<TFormID extends OnyxFormKey = OnyxFormKey> = Omit<OnyxValues[TFormID], keyof BaseForm>;
type FormOnyxKeys<TFormID extends OnyxFormKey = OnyxFormKey> = keyof FormOnyxValues<TFormID>;

type FormProps<TFormID extends OnyxFormKey = OnyxFormKey> = {
    /** A unique Onyx key identifying the form */
    formID: TFormID;

    /** Text to be displayed in the submit button */
    submitButtonText: string;

    /** Submit button styles */
    submitButtonStyles?: StyleProp<ViewStyle>;

    /** Controls the submit button's visibility */
    isSubmitButtonVisible?: boolean;

    /** Callback to submit the form */
    onSubmit: (values: FormOnyxValues<TFormID>) => void;

    /** Should the button be enabled when offline */
    enabledWhenOffline?: boolean;

    /** Whether the form submit action is dangerous */
    isSubmitActionDangerous?: boolean;

    /** Should fix the errors alert be displayed when there is an error in the form */
    shouldHideFixErrorsAlert?: boolean;

    /** Whether ScrollWithContext should be used instead of regular ScrollView. Set to true when there's a nested Picker component in Form. */
    scrollContextEnabled?: boolean;

    /** Whether to use ScrollView */
    shouldUseScrollView?: boolean;

    /** Container styles */
    style?: StyleProp<ViewStyle>;

    /** Custom content to display in the footer after submit button */
    footerContent?: ReactNode;

    /** Disable press on enter for submit button */
    disablePressOnEnter?: boolean;
};

type FormRef<TFormID extends OnyxFormKey = OnyxFormKey> = {
    resetForm: (optionalValue: FormOnyxValues<TFormID>) => void;
};

type InputRefs = Record<string, MutableRefObject<InputComponentBaseProps>>;

type FormInputErrors<TFormID extends OnyxFormKey = OnyxFormKey> = Partial<Record<FormOnyxKeys<TFormID>, string | undefined>>;

export type {
    FormProps,
    ValidInputs,
    InputComponentValueProps,
    FormValue,
    ValueTypeKey,
    FormOnyxValues,
    FormOnyxKeys,
    FormInputErrors,
    InputRefs,
    InputComponentBaseProps,
    ValueTypeMap,
    FormRef,
};
