import AddressSearch from '@components/AddressSearch';
import AmountForm from '@components/AmountForm';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import CountrySelector from '@components/CountrySelector';
import DatePicker from '@components/DatePicker';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import PushRowWithModal from '@components/PushRowWithModal';
import RadioButtons from '@components/RadioButtons';
import TextInput from '@components/TextInput';
import ValuePicker from '@components/ValuePicker';

import getTextInputAutocorrectProps from '@libs/getTextInputAutocorrectProps';

import type CONST from '@src/CONST';
import type {WiseField, WiseFieldOption, WiseFieldType} from '@src/types/onyx';

import type {ValueOf} from 'type-fest';

import type {DynamicFieldContext, DynamicFieldFactory, DynamicFieldInput, DynamicFormValues} from './types';

import addressAdapter from './adapters/addressAdapter';
import FileUploadAdapter from './adapters/FileUploadAdapter';
import MultiSelectListAdapter from './adapters/MultiSelectListAdapter';

const SELECT_MODAL_THRESHOLD = 8;
const ACCEPTED_FILE_TYPES: Array<ValueOf<typeof CONST.API_ATTACHMENT_VALIDATIONS.ALLOWED_RECEIPT_EXTENSIONS>> = ['png', 'jpg', 'pdf'];

function getFieldLabel(field: WiseField, translate: LocalizedTranslate): string {
    return field.labelKey ? translate(field.labelKey) : (field.label ?? field.key);
}

function getOptionLabel(option: WiseFieldOption, translate: LocalizedTranslate): string {
    return option.labelKey ? translate(option.labelKey) : (option.label ?? option.key);
}

function getFieldOptions(field: WiseField, values: DynamicFormValues): WiseFieldOption[] {
    if (!field.dependsOn) {
        return field.values ?? [];
    }
    const controllingValue = values[field.dependsOn.key];
    return typeof controllingValue === 'string' ? (field.dependsOn.valuesBy[controllingValue] ?? []) : [];
}

function getChoices(field: WiseField, {values, translate}: DynamicFieldContext) {
    return getFieldOptions(field, values).map((option) => ({value: option.key, label: getOptionLabel(option, translate)}));
}

const REGISTRY = {
    text: (field) => ({
        InputComponent: TextInput,
        inputProps: {maxLength: field.maxLength, placeholder: field.example, ...getTextInputAutocorrectProps()},
    }),
    select: (field, context) => {
        const choices = getChoices(field, context);
        if (choices.length > SELECT_MODAL_THRESHOLD) {
            const label = getFieldLabel(field, context.translate);
            return {
                InputComponent: PushRowWithModal,
                isMenuRow: true,
                inputProps: {
                    optionsList: Object.fromEntries(choices.map((choice) => [choice.value, choice.label])),
                    description: label,
                    modalHeaderTitle: label,
                    searchInputTitle: label,
                },
            };
        }
        return {InputComponent: ValuePicker, isMenuRow: true, inputProps: {items: choices}};
    },
    multiselect: (field, context) => ({
        InputComponent: MultiSelectListAdapter,
        isMenuRow: true,
        shouldRenderLabelAbove: true,
        inputProps: {items: getChoices(field, context), valueType: 'stringList'},
    }),
    radio: (field, context) => ({
        InputComponent: RadioButtons,
        isMenuRow: true,
        shouldRenderLabelAbove: true,
        inputProps: {items: getChoices(field, context), onSelect: () => {}},
    }),
    date: (field, {translate}) => ({
        InputComponent: DatePicker,
        inputProps: {placeholder: translate('common.dateFormat')},
    }),
    country: () => ({
        InputComponent: CountrySelector,
        isMenuRow: true,
        inputProps: {},
    }),
    address: (field) => ({
        InputComponent: AddressSearch,
        inputProps: {renamedInputKeys: addressAdapter(field.key)},
    }),
    boolean: (field, {translate}) => ({
        InputComponent: CheckboxWithLabel,
        inputProps: {valueType: 'boolean', accessibilityLabel: getFieldLabel(field, translate)},
    }),
    file: (field, {translate}) => ({
        InputComponent: FileUploadAdapter,
        shouldRenderLabelAbove: true,
        inputProps: {
            valueType: 'files',
            buttonText: translate(field.maxFiles && field.maxFiles > 1 ? 'common.chooseFiles' : 'common.chooseFile'),
            acceptedFileTypes: ACCEPTED_FILE_TYPES,
            fileLimit: field.maxFiles ?? 1,
        },
    }),
    amount: (field, {values, currency}) => ({
        InputComponent: AmountForm,
        inputProps: {
            currency: typeof values.currency === 'string' && values.currency ? values.currency : currency,
            displayAsTextInput: true,
            isCurrencyPressable: false,
        },
    }),
} satisfies Record<WiseFieldType, DynamicFieldFactory>;

function getInputComponentForField(field: WiseField, context: DynamicFieldContext): DynamicFieldInput {
    return REGISTRY[field.type](field, context);
}

export default getInputComponentForField;
export {getFieldLabel, getFieldOptions, getOptionLabel};
