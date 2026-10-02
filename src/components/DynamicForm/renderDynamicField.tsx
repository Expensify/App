import AmountForm from '@components/AmountForm';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import CountryPicker from '@components/CountryPicker';
import CurrencyPicker from '@components/CurrencyPicker';
import DatePicker from '@components/DatePicker';
import InputWrapper from '@components/Form/InputWrapper';
import type {InputComponentBaseProps} from '@components/Form/types';
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
import type {ThemeStyles} from '@src/styles';
import type {DynamicFormFieldType, DynamicFormNumberField, DynamicFormTextField} from '@src/types/onyx';

import type {ReactElement} from 'react';
import type {InputModeOptions} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import type {DynamicFormFieldsProps} from './components/DynamicFormFields';
import type {DynamicFormFieldOfType, DynamicFormValues} from './types';

import CurrencyInlineListAdapter from './adapters/CurrencyInlineListAdapter';
import FileUploadAdapter from './adapters/FileUploadAdapter';
import InlineSelectionListAdapter from './adapters/InlineSelectionListAdapter';
import TabsAdapter from './adapters/TabsAdapter';
import YesNoAdapter from './adapters/YesNoAdapter';
import getAddressInputKeys, {isStateAsked} from './utils/getAddressInputKeys';
import {getFieldChoices} from './utils/getFieldOptions';
import getLocalizedText, {getFieldLabel} from './utils/getLocalizedText';

type DynamicFieldContext = Pick<DynamicFormFieldsProps, 'values'> &
    Required<Pick<DynamicFormFieldsProps, 'currency'>> & {
        translate: LocalizedTranslate;
        styles: ThemeStyles;

        /** The field is the page's only question, so a choice is drawn as the page itself instead of as a row */
        isLoneField: boolean;
    };

/** Props every input gets from the renderer */
type DynamicFieldInputProps = Required<ForwardedFSClassProps> &
    Required<Pick<InputComponentBaseProps, 'inputID' | 'shouldSaveDraft'>> &
    Pick<InputComponentBaseProps, 'onValueChange'> & {
        onBlur?: () => void;
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

function renderTextInput(
    field: DynamicFormTextField | DynamicFormNumberField,
    {values, translate}: DynamicFieldContext,
    inputProps: DynamicFieldInputProps,
    inputMode: InputModeOptions | undefined,
    isMultiline = false,
): DynamicFieldInput {
    return {
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
                inputMode={inputMode}
                multiline={isMultiline}
                autoGrowHeight={isMultiline}
                {...(isMultiline ? {} : getTextInputAutocorrectProps())}
            />
        ),
    };
}

/** A lone choice field is the page itself: its options are listed inline under the question */
function renderInlineChoice(label: string, choices: Choice[], inputProps: DynamicFieldInputProps, canSelectMultiple: boolean, isSearchable: boolean): DynamicFieldInput {
    const listProps = {items: choices, isSearchable, searchInputLabel: label};
    return {
        isMenuRow: true,
        labelAbove: 'heading',
        input: canSelectMultiple ? (
            <InputWrapper
                InputComponent={InlineSelectionListAdapter}
                {...inputProps}
                {...listProps}
                valueType="stringList"
                canSelectMultiple
            />
        ) : (
            <InputWrapper
                InputComponent={InlineSelectionListAdapter}
                {...inputProps}
                {...listProps}
                valueType="string"
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

const renderMultiChoice: DynamicFieldRenderer<'multiselect' | 'countryMultiselect'> = (field, {values, translate, isLoneField}, inputProps) => {
    const label = getFieldLabel(field, translate);
    const choices = getFieldChoices(field, values, translate);
    if (isLoneField) {
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
    text: (field, context, inputProps) => renderTextInput(field, context, inputProps, field.keyboard ?? (field.rule === 'phone' ? CONST.INPUT_MODE.TEL : undefined), field.multiline),
    number: (field, context, inputProps) => renderTextInput(field, context, inputProps, CONST.INPUT_MODE.NUMERIC),
    select: (field, {values, translate, isLoneField}, inputProps) => {
        const label = getFieldLabel(field, translate);
        const choices = getFieldChoices(field, values, translate);
        const isLong = choices.length > CONST.STANDARD_LIST_ITEM_LIMIT;
        if (field.presentation === 'tabs') {
            return renderTabs(choices, inputProps);
        }
        if (isLoneField) {
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
    radio: (field, {values, translate, isLoneField}, inputProps) => {
        const choices = getFieldChoices(field, values, translate);
        if (field.presentation === 'tabs') {
            return renderTabs(choices, inputProps);
        }
        return {
            isMenuRow: true,
            labelAbove: isLoneField ? 'heading' : 'prompt',
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
    boolean: (field, {translate, isLoneField}, inputProps) => {
        if (field.presentation === 'yesNo') {
            return {
                isMenuRow: true,
                labelAbove: isLoneField ? 'heading' : 'prompt',
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
    country: (field, {values, translate, isLoneField}, inputProps) => {
        const label = getFieldLabel(field, translate);
        if (isLoneField) {
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
    currency: (field, {translate, isLoneField}, inputProps) => {
        if (isLoneField) {
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
    address: (field, {values}, {shouldSaveDraft, forwardedFSClass, onValueChange}) => {
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
                    shouldDisplayStateSelector={isStateAsked(values[addressKeys.country])}
                    forwardedFSClass={forwardedFSClass}
                    onCountryChange={(country) => {
                        if (typeof country !== 'string') {
                            return;
                        }
                        onValueChange?.(country, addressKeys.country);
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
    amount: (field, {values, translate, styles, currency}, inputProps) => {
        const chosenCurrency = field.currencyKey ? values[field.currencyKey] : undefined;
        const amountInput = (
            <InputWrapper
                InputComponent={AmountForm}
                {...inputProps}
                label={getFieldLabel(field, translate)}
                currency={typeof chosenCurrency === 'string' && chosenCurrency !== '' ? chosenCurrency : currency}
                displayAsTextInput
                isCurrencyPressable={false}
            />
        );
        if (!field.currencyKey) {
            return {isMenuRow: false, input: amountInput};
        }
        return {
            isMenuRow: false,
            input: (
                <>
                    <View style={[styles.mhn5, styles.mb2]}>
                        <InputWrapper
                            InputComponent={CurrencyPicker}
                            inputID={field.currencyKey}
                            shouldSaveDraft={inputProps.shouldSaveDraft}
                            forwardedFSClass={inputProps.forwardedFSClass}
                            defaultValue={currency}
                            label={translate('common.currency')}
                        />
                    </View>
                    {amountInput}
                </>
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
