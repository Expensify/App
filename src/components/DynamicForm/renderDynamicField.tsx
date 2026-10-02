import AmountForm from '@components/AmountForm';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import CountryPicker from '@components/CountryPicker';
import CurrencyPicker from '@components/CurrencyPicker';
import DatePicker from '@components/DatePicker';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormValue} from '@components/Form/types';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import PercentageForm from '@components/PercentageForm';
import PushRowWithModal from '@components/PushRowWithModal';
import type {Choice} from '@components/RadioButtons';
import RadioButtons from '@components/RadioButtons';
import TextInput from '@components/TextInput';
import ValuePicker from '@components/ValuePicker';

import type {ForwardedFSClassProps} from '@libs/Fullstory/types';
import getTextInputAutocorrectProps from '@libs/getTextInputAutocorrectProps';

import AddressFormFields from '@pages/ReimbursementAccount/AddressFormFields';

import CONST from '@src/CONST';
import type {DynamicFormFieldType} from '@src/types/onyx';
import type {DynamicFormNumberField, DynamicFormTextField} from '@src/types/onyx/DynamicFormField';

import type {ReactElement} from 'react';

import React from 'react';

import type {DynamicFormFieldOfType, DynamicFormValues} from './types';

import AmountWithCurrencyAdapter from './adapters/AmountWithCurrencyAdapter';
import CurrencyInlineListAdapter from './adapters/CurrencyInlineListAdapter';
import FileUploadAdapter from './adapters/FileUploadAdapter';
import InlineSelectionListAdapter from './adapters/InlineSelectionListAdapter';
import TabsAdapter from './adapters/TabsAdapter';
import YesNoAdapter from './adapters/YesNoAdapter';
import getAddressInputKeys from './utils/getAddressInputKeys';
import {getFieldChoices} from './utils/getFieldOptions';
import getLocalizedText, {getFieldLabel} from './utils/getLocalizedText';

type DynamicFieldContext = {
    values: DynamicFormValues;
    translate: LocalizedTranslate;

    /** Currency of amount fields that let the user pick none */
    currency: string;

    /** The field is the page's only question, so a choice is drawn as the page itself instead of as a row */
    isAloneOnPage: boolean;

    /** Called when an answer changes the schema, with the draft key that changed */
    onRefreshRequirements?: (inputID: string, value: FormValue) => void;
};

/** Props every input gets from the renderer */
type DynamicFieldInputProps = Required<ForwardedFSClassProps> & {
    inputID: string;
    shouldSaveDraft: boolean;
    onValueChange?: (value: FormValue, key: string) => void;
};

type DynamicFieldInput = {
    input: ReactElement;

    /** Spans the page edge to edge like a menu row, instead of sitting inside the page padding */
    isMenuRow: boolean;

    /** The input has no label of its own, so the renderer draws the field label above it, as a question prompt or as a bold heading */
    labelAbove?: 'prompt' | 'heading';

    /** The input shows the field description itself, so the renderer does not draw it */
    showsDescription?: boolean;
};

type DynamicFieldRenderer<TType extends DynamicFormFieldType> = (field: DynamicFormFieldOfType<TType>, context: DynamicFieldContext, inputProps: DynamicFieldInputProps) => DynamicFieldInput;

function getChoiceOptionsList(choices: Choice[]): Record<string, string> {
    return Object.fromEntries(choices.map((choice) => [choice.value, choice.label]));
}

function getTextHint(field: DynamicFormTextField | DynamicFormNumberField, translate: LocalizedTranslate): string | undefined {
    const description = getLocalizedText(translate, field.descriptionKey, field.description);
    if (description || !field.example) {
        return description;
    }
    return translate('dynamicForm.exampleHint', {example: field.example});
}

/** Sensitive answers are not drafted, so a page the user comes back to is refilled from the answers kept in memory */
function getSensitiveDefaultValue(field: DynamicFormTextField | DynamicFormNumberField, values: DynamicFormValues): string | undefined {
    const value = values[field.key];
    return field.sensitive && typeof value === 'string' ? value : undefined;
}

/** A lone choice field is the page itself: its options are listed inline under the question */
function renderInlineChoice(label: string, choices: Choice[], inputProps: DynamicFieldInputProps, canSelectMultiple: boolean, isSearchable: boolean): DynamicFieldInput {
    return {
        isMenuRow: true,
        labelAbove: 'heading',
        input: (
            <InputWrapper
                InputComponent={InlineSelectionListAdapter}
                {...inputProps}
                valueType={canSelectMultiple ? 'stringList' : 'string'}
                items={choices}
                canSelectMultiple={canSelectMultiple}
                isSearchable={isSearchable}
                searchInputLabel={label}
            />
        ),
    };
}

function renderTabs(choices: Choice[], inputProps: DynamicFieldInputProps): DynamicFieldInput {
    return {
        isMenuRow: false,
        labelAbove: 'prompt',
        input: (
            <InputWrapper
                InputComponent={TabsAdapter}
                {...inputProps}
                items={choices}
            />
        ),
    };
}

const renderMultiChoice: DynamicFieldRenderer<'multiselect' | 'countryMultiselect'> = (field, {values, translate, isAloneOnPage}, inputProps) => {
    const label = getFieldLabel(field, translate);
    const choices = getFieldChoices(field, values, translate);
    if (isAloneOnPage) {
        return renderInlineChoice(label, choices, inputProps, true, choices.length > CONST.STANDARD_LIST_ITEM_LIMIT);
    }
    return {
        isMenuRow: true,
        input: (
            <InputWrapper
                InputComponent={PushRowWithModal}
                {...inputProps}
                valueType="stringList"
                canSelectMultiple
                optionsList={getChoiceOptionsList(choices)}
                description={label}
                modalHeaderTitle={label}
                searchInputTitle={label}
            />
        ),
    };
};

const RENDERERS: {[TType in DynamicFormFieldType]: DynamicFieldRenderer<TType>} = {
    text: (field, {values, translate}, inputProps) => ({
        isMenuRow: false,
        showsDescription: true,
        input: (
            <InputWrapper
                InputComponent={TextInput}
                {...inputProps}
                defaultValue={getSensitiveDefaultValue(field, values)}
                label={getFieldLabel(field, translate)}
                hint={getTextHint(field, translate)}
                maxLength={field.maxLength}
                inputMode={field.keyboard ?? (field.rule === 'phone' ? CONST.INPUT_MODE.TEL : undefined)}
                multiline={field.multiline}
                autoGrowHeight={field.multiline}
                {...(field.multiline ? {} : getTextInputAutocorrectProps())}
            />
        ),
    }),
    number: (field, {values, translate}, inputProps) => ({
        isMenuRow: false,
        showsDescription: true,
        input: (
            <InputWrapper
                InputComponent={TextInput}
                {...inputProps}
                defaultValue={getSensitiveDefaultValue(field, values)}
                label={getFieldLabel(field, translate)}
                hint={getTextHint(field, translate)}
                maxLength={field.maxLength}
                inputMode={CONST.INPUT_MODE.NUMERIC}
                {...getTextInputAutocorrectProps()}
            />
        ),
    }),
    select: (field, {values, translate, isAloneOnPage}, inputProps) => {
        const label = getFieldLabel(field, translate);
        const choices = getFieldChoices(field, values, translate);
        const isLong = choices.length > CONST.STANDARD_LIST_ITEM_LIMIT;
        if (field.presentation === 'tabs') {
            return renderTabs(choices, inputProps);
        }
        if (isAloneOnPage) {
            return renderInlineChoice(label, choices, inputProps, false, isLong);
        }
        if (isLong) {
            return {
                isMenuRow: true,
                input: (
                    <InputWrapper
                        InputComponent={PushRowWithModal}
                        {...inputProps}
                        optionsList={getChoiceOptionsList(choices)}
                        description={label}
                        modalHeaderTitle={label}
                        searchInputTitle={label}
                    />
                ),
            };
        }
        return {
            isMenuRow: true,
            input: (
                <InputWrapper
                    InputComponent={ValuePicker}
                    {...inputProps}
                    label={label}
                    items={choices}
                />
            ),
        };
    },
    radio: (field, {values, translate, isAloneOnPage}, inputProps) => {
        const choices = getFieldChoices(field, values, translate);
        if (field.presentation === 'tabs') {
            return renderTabs(choices, inputProps);
        }
        return {
            isMenuRow: true,
            labelAbove: isAloneOnPage ? 'heading' : 'prompt',
            input: (
                <InputWrapper
                    InputComponent={RadioButtons}
                    {...inputProps}
                    items={choices}
                />
            ),
        };
    },
    date: (field, {translate}, inputProps) => ({
        isMenuRow: false,
        input: (
            <InputWrapper
                InputComponent={DatePicker}
                {...inputProps}
                label={getFieldLabel(field, translate)}
                placeholder={translate('common.dateFormat')}
            />
        ),
    }),
    boolean: (field, {translate, isAloneOnPage}, inputProps) => {
        if (isAloneOnPage) {
            return {
                isMenuRow: true,
                labelAbove: 'heading',
                input: (
                    <InputWrapper
                        InputComponent={YesNoAdapter}
                        {...inputProps}
                    />
                ),
            };
        }
        return {
            isMenuRow: false,
            input: (
                <InputWrapper
                    InputComponent={CheckboxWithLabel}
                    {...inputProps}
                    valueType="boolean"
                    label={getFieldLabel(field, translate)}
                    accessibilityLabel={getFieldLabel(field, translate)}
                />
            ),
        };
    },
    country: (field, {values, translate, isAloneOnPage}, inputProps) => {
        const label = getFieldLabel(field, translate);
        if (isAloneOnPage) {
            return renderInlineChoice(label, getFieldChoices(field, values, translate), inputProps, false, true);
        }
        return {
            isMenuRow: true,
            input: (
                <InputWrapper
                    InputComponent={CountryPicker}
                    {...inputProps}
                    label={label}
                />
            ),
        };
    },
    currency: (field, {translate, isAloneOnPage}, inputProps) => {
        if (isAloneOnPage) {
            return {
                isMenuRow: true,
                labelAbove: 'heading',
                input: (
                    <InputWrapper
                        InputComponent={CurrencyInlineListAdapter}
                        {...inputProps}
                    />
                ),
            };
        }
        return {
            isMenuRow: true,
            input: (
                <InputWrapper
                    InputComponent={CurrencyPicker}
                    {...inputProps}
                    label={getFieldLabel(field, translate)}
                />
            ),
        };
    },
    address: (field, {onRefreshRequirements}, {shouldSaveDraft, forwardedFSClass}) => {
        const addressKeys = getAddressInputKeys(field.key);
        return {
            isMenuRow: false,
            labelAbove: 'heading',
            input: (
                <AddressFormFields
                    inputKeys={addressKeys}
                    streetTranslationKey="common.streetAddress"
                    shouldSaveDraft={shouldSaveDraft}
                    shouldDisplayCountrySelector
                    forwardedFSClass={forwardedFSClass}
                    onCountryChange={(country) => {
                        if (!field.refreshRequirementsOnChange || typeof country !== 'string') {
                            return;
                        }
                        onRefreshRequirements?.(addressKeys.country, country);
                    }}
                />
            ),
        };
    },
    multiselect: renderMultiChoice,
    countryMultiselect: renderMultiChoice,
    file: (field, {translate}, inputProps) => {
        const fileLimit = field.maxFiles ?? CONST.API_ATTACHMENT_VALIDATIONS.MAX_FILE_LIMIT;
        return {
            isMenuRow: false,
            labelAbove: 'heading',
            input: (
                <InputWrapper
                    InputComponent={FileUploadAdapter}
                    {...inputProps}
                    valueType="files"
                    buttonText={translate(fileLimit > 1 ? 'common.chooseFiles' : 'common.chooseFile')}
                    fileLimit={fileLimit}
                    // Wise publishes no document limits, so these are the bank document limits the App already applies
                    acceptedFileTypes={[...CONST.CORPAY_DOCUMENT.ALLOWED_FILE_TYPES]}
                    maxFileSize={CONST.CORPAY_DOCUMENT.MAX_FILE_SIZE}
                />
            ),
        };
    },
    amount: (field, {values, translate, currency}, inputProps) => {
        const label = getFieldLabel(field, translate);
        if (!field.currencyKey) {
            return {
                isMenuRow: false,
                input: (
                    <InputWrapper
                        InputComponent={AmountForm}
                        {...inputProps}
                        label={label}
                        currency={currency}
                        displayAsTextInput
                        isCurrencyPressable={false}
                    />
                ),
            };
        }
        const chosenCurrency = values[field.currencyKey];
        return {
            isMenuRow: false,
            input: (
                <InputWrapper
                    InputComponent={AmountWithCurrencyAdapter}
                    {...inputProps}
                    label={label}
                    currency={typeof chosenCurrency === 'string' && chosenCurrency !== '' ? chosenCurrency : currency}
                    currencyKey={field.currencyKey}
                />
            ),
        };
    },
    percent: (field, {translate}, inputProps) => ({
        isMenuRow: false,
        input: (
            <InputWrapper
                InputComponent={PercentageForm}
                {...inputProps}
                label={getFieldLabel(field, translate)}
            />
        ),
    }),
};

/** The input for one field, and how the renderer lays it out */
function renderDynamicField<TType extends DynamicFormFieldType>(field: DynamicFormFieldOfType<TType>, context: DynamicFieldContext, inputProps: DynamicFieldInputProps): DynamicFieldInput {
    const render: DynamicFieldRenderer<TType> = RENDERERS[field.type];
    return render(field, context, inputProps);
}

export default renderDynamicField;
