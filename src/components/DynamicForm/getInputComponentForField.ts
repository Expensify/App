import AddressSearch from '@components/AddressSearch';
import AmountForm from '@components/AmountForm';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import DatePicker from '@components/DatePicker';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import PushRowWithModal from '@components/PushRowWithModal';
import RadioButtons from '@components/RadioButtons';
import TextInput from '@components/TextInput';
import ValuePicker from '@components/ValuePicker';

import getTextInputAutocorrectProps from '@libs/getTextInputAutocorrectProps';

import CONST from '@src/CONST';
import type {Country} from '@src/CONST';
import type {DynamicFormField, DynamicFormFieldOption, DynamicFormFieldType} from '@src/types/onyx';

import type {ValueOf} from 'type-fest';

import type {DynamicFieldContext, DynamicFieldFactory, DynamicFieldInput, DynamicFormValues} from './types';

import addressAdapter from './adapters/addressAdapter';
import FileUploadAdapter from './adapters/FileUploadAdapter';
import InlineSelectionListAdapter from './adapters/InlineSelectionListAdapter';
import MultiSelectPushRowAdapter from './adapters/MultiSelectPushRowAdapter';
import YesNoAdapter from './adapters/YesNoAdapter';

const SELECT_MODAL_THRESHOLD = 8;
const DIGITS_ONLY_REGEX = /^\^?(?:\\d|\[0-9\])(?:\{\d+(?:,\d*)?\}|[+*])?\$?$/;
const ACCEPTED_FILE_TYPES: Array<ValueOf<typeof CONST.API_ATTACHMENT_VALIDATIONS.ALLOWED_RECEIPT_EXTENSIONS>> = ['png', 'jpg', 'pdf'];

function isCountryCode(code: string): code is Country {
    return code in CONST.ALL_COUNTRIES;
}

function getFieldLabel(field: DynamicFormField, translate: LocalizedTranslate): string {
    return field.labelKey ? translate(field.labelKey) : (field.label ?? field.key);
}

function getOptionLabel(option: DynamicFormFieldOption, translate: LocalizedTranslate): string {
    return option.labelKey ? translate(option.labelKey) : (option.label ?? option.key);
}

function getFieldOptions(field: DynamicFormField, values: DynamicFormValues): DynamicFormFieldOption[] {
    if (!field.dependsOn) {
        return field.values ?? [];
    }
    const controllingValue = values[field.dependsOn.key];
    return typeof controllingValue === 'string' ? (field.dependsOn.valuesBy[controllingValue] ?? []) : [];
}

function getChoices(field: DynamicFormField, {values, translate}: DynamicFieldContext) {
    return getFieldOptions(field, values).map((option) => ({value: option.key, label: getOptionLabel(option, translate)}));
}

const REGISTRY = {
    text: (field, {translate}) => ({
        InputComponent: TextInput,
        inputProps: {
            maxLength: field.maxLength,
            hint: field.example ? translate('common.exampleValue', {example: field.example}) : undefined,
            inputMode: field.regex && DIGITS_ONLY_REGEX.test(field.regex) ? CONST.INPUT_MODE.NUMERIC : undefined,
            ...getTextInputAutocorrectProps(),
        },
    }),
    select: (field, context) => {
        const choices = getChoices(field, context);
        if (context.isAloneOnPage) {
            return {InputComponent: InlineSelectionListAdapter, isMenuRow: true, inputProps: {items: choices}};
        }
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
    multiselect: (field, context) => {
        const choices = getChoices(field, context);
        if (context.isAloneOnPage) {
            return {InputComponent: InlineSelectionListAdapter, isMenuRow: true, inputProps: {items: choices, canSelectMultiple: true, valueType: 'stringList'}};
        }
        const label = getFieldLabel(field, context.translate);
        return {
            InputComponent: MultiSelectPushRowAdapter,
            isMenuRow: true,
            inputProps: {items: choices, description: label, modalHeaderTitle: label, valueType: 'stringList'},
        };
    },
    radio: (field, context) => ({
        InputComponent: RadioButtons,
        isMenuRow: true,
        shouldRenderLabelAbove: !context.isAloneOnPage,
        inputProps: {items: getChoices(field, context), onSelect: () => {}},
    }),
    date: (field, {translate}) => ({
        InputComponent: DatePicker,
        inputProps: {placeholder: translate('common.dateFormat')},
    }),
    country: (field, {translate}) => ({
        InputComponent: PushRowWithModal,
        isMenuRow: true,
        inputProps: {
            optionsList: Object.fromEntries(
                Object.keys(CONST.ALL_COUNTRIES)
                    .filter(isCountryCode)
                    .map((code) => [code, translate(`allCountries.${code}`)]),
            ),
            description: getFieldLabel(field, translate),
            modalHeaderTitle: translate('countryStep.selectCountry'),
            searchInputTitle: translate('common.country'),
        },
    }),
    address: (field) => ({
        InputComponent: AddressSearch,
        inputProps: {renamedInputKeys: addressAdapter(field.key)},
    }),
    boolean: (field, {translate, isAloneOnPage}) => {
        if (isAloneOnPage) {
            return {InputComponent: YesNoAdapter, isMenuRow: true, inputProps: {valueType: 'boolean'}};
        }
        return {
            InputComponent: CheckboxWithLabel,
            inputProps: {valueType: 'boolean', accessibilityLabel: getFieldLabel(field, translate)},
        };
    },
    file: (field, {translate, isAloneOnPage}) => ({
        InputComponent: FileUploadAdapter,
        shouldRenderLabelAbove: !isAloneOnPage,
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
} satisfies Record<DynamicFormFieldType, DynamicFieldFactory>;

function getInputComponentForField(field: DynamicFormField, context: DynamicFieldContext): DynamicFieldInput {
    return REGISTRY[field.type](field, context);
}

export default getInputComponentForField;
export {getFieldLabel, getFieldOptions, getOptionLabel};
