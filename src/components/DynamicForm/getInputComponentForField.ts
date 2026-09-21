import AddressSearch from '@components/AddressSearch';
import AmountForm from '@components/AmountForm';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import CurrencyPicker from '@components/CurrencyPicker';
import DatePicker from '@components/DatePicker';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import PercentageForm from '@components/PercentageForm';
import PushRowWithModal from '@components/PushRowWithModal';
import RadioButtons from '@components/RadioButtons';
import TextInput from '@components/TextInput';
import ValuePicker from '@components/ValuePicker';

import getTextInputAutocorrectProps from '@libs/getTextInputAutocorrectProps';

import CONST from '@src/CONST';
import type {DynamicFormField, DynamicFormFieldType, DynamicFormKeyboard} from '@src/types/onyx';

import type {ValueOf} from 'type-fest';

import type {DynamicFieldContext, DynamicFieldFactory, DynamicFieldInput} from './types';

import addressAdapter from './adapters/addressAdapter';
import AmountWithCurrencyAdapter from './adapters/AmountWithCurrencyAdapter';
import FileUploadAdapter from './adapters/FileUploadAdapter';
import InlineSelectionListAdapter from './adapters/InlineSelectionListAdapter';
import ListFieldAdapter from './adapters/ListFieldAdapter';
import TabsAdapter from './adapters/TabsAdapter';
import YesNoAdapter from './adapters/YesNoAdapter';
import {getFieldOptions, getOptionLabel} from './getFieldOptions';
import isCountryCode from './isCountryCode';

const SELECT_MODAL_THRESHOLD = 8;
const DIGITS_ONLY_REGEX = /^\^?(?:\\d|\[0-9\])(?:\{\d+(?:,\d*)?\}|[+*])?\$?$/;
const INPUT_MODE_BY_KEYBOARD: Record<DynamicFormKeyboard, ValueOf<typeof CONST.INPUT_MODE>> = {
    email: CONST.INPUT_MODE.EMAIL,
    tel: CONST.INPUT_MODE.TEL,
    url: CONST.INPUT_MODE.URL,
    numeric: CONST.INPUT_MODE.NUMERIC,
};
const ACCEPTED_FILE_TYPES: Array<ValueOf<typeof CONST.API_ATTACHMENT_VALIDATIONS.ALLOWED_RECEIPT_EXTENSIONS>> = ['png', 'jpg', 'pdf'];

function getFieldLabel(field: DynamicFormField, translate: LocalizedTranslate): string {
    return field.labelKey ? translate(field.labelKey) : (field.label ?? field.key);
}

function getFieldDescription(field: DynamicFormField, translate: LocalizedTranslate): string | undefined {
    return field.descriptionKey ? translate(field.descriptionKey) : field.description;
}

function getInputMode(field: DynamicFormField): ValueOf<typeof CONST.INPUT_MODE> | undefined {
    if (field.keyboard) {
        return INPUT_MODE_BY_KEYBOARD[field.keyboard];
    }
    return field.regex && DIGITS_ONLY_REGEX.test(field.regex) ? CONST.INPUT_MODE.NUMERIC : undefined;
}

function getChoices(field: DynamicFormField, {values, translate}: DynamicFieldContext) {
    return getFieldOptions(field, values).map((option) => ({value: option.key, label: getOptionLabel(option, translate)}));
}

const textFactory: DynamicFieldFactory = (field, {translate, values}) => ({
    InputComponent: TextInput,
    inputProps: {
        ...(field.sensitive && values[field.key] !== undefined ? {defaultValue: values[field.key]} : {}),
        maxLength: field.maxLength,
        hint: getFieldDescription(field, translate) ?? (field.example ? translate('common.exampleValue', {example: field.example}) : undefined),
        inputMode: getInputMode(field),
        multiline: field.multiline,
        autoGrowHeight: field.multiline,
        ...(field.multiline ? {} : getTextInputAutocorrectProps()),
    },
});

const multiselectFactory: DynamicFieldFactory = (field, context) => {
    const choices = getChoices(field, context);
    if (context.isAloneOnPage) {
        return {InputComponent: InlineSelectionListAdapter, isMenuRow: true, inputProps: {items: choices, canSelectMultiple: true, valueType: 'stringList'}};
    }
    const label = getFieldLabel(field, context.translate);
    return {
        InputComponent: PushRowWithModal,
        isMenuRow: true,
        inputProps: {
            canSelectMultiple: true,
            optionsList: Object.fromEntries(choices.map((choice) => [choice.value, choice.label])),
            description: label,
            modalHeaderTitle: label,
            searchInputTitle: label,
            valueType: 'stringList',
        },
    };
};

const REGISTRY = {
    text: textFactory,
    number: (field, context) => textFactory({...field, keyboard: 'numeric'}, context),
    select: (field, context) => {
        const choices = getChoices(field, context);
        if (field.presentation === 'tabs') {
            return {InputComponent: TabsAdapter, inputProps: {items: choices}};
        }
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
    multiselect: multiselectFactory,
    countryMultiselect: multiselectFactory,
    radio: (field, context) => {
        if (field.presentation === 'tabs') {
            return {InputComponent: TabsAdapter, inputProps: {items: getChoices(field, context)}};
        }
        return {
            InputComponent: RadioButtons,
            isMenuRow: true,
            shouldRenderLabelAbove: !context.isAloneOnPage,
            isLabelAboveQuestion: true,
            inputProps: {items: getChoices(field, context), onSelect: () => {}},
        };
    },
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
    currency: (field, {translate}) => ({
        InputComponent: CurrencyPicker,
        isMenuRow: true,
        inputProps: {label: getFieldLabel(field, translate)},
    }),
    address: (field) => ({
        InputComponent: AddressSearch,
        inputProps: {renamedInputKeys: addressAdapter(field.key)},
    }),
    boolean: (field, {translate, isAloneOnPage}) => {
        if (isAloneOnPage) {
            return {InputComponent: YesNoAdapter, isMenuRow: true, inputProps: {}};
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
    amount: (field, {values, currency}) => {
        const chosenCurrency = field.currencyKey ? values[field.currencyKey] : undefined;
        const resolvedCurrency = (typeof chosenCurrency === 'string' && chosenCurrency !== '' ? chosenCurrency : undefined) ?? currency ?? CONST.CURRENCY.USD;
        if (field.currencyKey) {
            return {
                InputComponent: AmountWithCurrencyAdapter,
                inputProps: {currency: resolvedCurrency, currencyKey: field.currencyKey},
            };
        }
        return {
            InputComponent: AmountForm,
            inputProps: {currency: resolvedCurrency, displayAsTextInput: true, isCurrencyPressable: false},
        };
    },
    percent: () => ({
        InputComponent: PercentageForm,
        inputProps: {},
    }),
    list: (field, {isAloneOnPage, renderFields, translate, openListItemEditor}) => ({
        InputComponent: ListFieldAdapter,
        isMenuRow: true,
        shouldRenderLabelAbove: !isAloneOnPage,
        inputProps: {
            itemFields: field.itemFields ?? [],
            maxItems: field.maxItems,
            itemLabel: field.itemLabelKey ? translate(field.itemLabelKey) : field.itemLabel,
            addItemDescription: field.addItemDescriptionKey ? translate(field.addItemDescriptionKey) : field.addItemDescription,
            renderFields,
            onOpenEditor: openListItemEditor ? (itemID?: string) => openListItemEditor(field.key, itemID) : undefined,
            valueType: 'listItems',
        },
    }),
} satisfies Record<DynamicFormFieldType, DynamicFieldFactory>;

function getInputComponentForField(field: DynamicFormField, context: DynamicFieldContext): DynamicFieldInput {
    return REGISTRY[field.type](field, context);
}

export default getInputComponentForField;
export {getFieldDescription, getFieldLabel};
