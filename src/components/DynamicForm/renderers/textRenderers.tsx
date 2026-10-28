import AmountForm from '@components/AmountForm';
import CurrencyPicker from '@components/CurrencyPicker';
import DatePicker from '@components/DatePicker';
import type {DynamicFormValues} from '@components/DynamicForm/types';
import getLocalizedText, {getFieldLabel, getInputLabel} from '@components/DynamicForm/utils/getLocalizedText';
import hasProvidedAnswer from '@components/DynamicForm/utils/hasProvidedAnswer';
import InputWrapper from '@components/Form/InputWrapper';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import PercentageForm from '@components/PercentageForm';
import TextInput from '@components/TextInput';

import getTextInputAutocorrectProps from '@libs/getTextInputAutocorrectProps';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {DynamicFormNumberField, DynamicFormTextField} from '@src/types/onyx';

import type {InputModeOptions} from 'react-native';

import {subYears} from 'date-fns';
import React from 'react';
import {View} from 'react-native';

import type {DynamicFieldContext, DynamicFieldInput, DynamicFieldInputProps, DynamicFieldRendererMap} from './types';

/** A regex of digits only, such as `^\d{6}$`, asks for a number, so it gets the numeric keyboard */
const DIGITS_ONLY_REGEX = /^\^?(?:\\d|\[0-9\])(?:\{\d+(?:,\d*)?\}|[+*])?\$?$/;

function getTextInputMode(field: DynamicFormTextField): InputModeOptions | undefined {
    if (field.keyboard) {
        return field.keyboard;
    }
    if (field.rule === 'phone') {
        return CONST.INPUT_MODE.TEL;
    }
    return field.regex && DIGITS_ONLY_REGEX.test(field.regex) ? CONST.INPUT_MODE.NUMERIC : undefined;
}

function getTextHint(field: DynamicFormTextField | DynamicFormNumberField, translate: LocalizedTranslate, values: DynamicFormValues | undefined): string | undefined {
    // The server holds the answer, so the hint says leaving the field blank keeps it
    if (values && hasProvidedAnswer(field, values)) {
        return translate('dynamicForm.onFileHint');
    }
    const description = getLocalizedText(translate, field.descriptionKey, field.description);
    if (description || !field.example) {
        return description;
    }
    return translate('dynamicForm.exampleHint', {example: field.example});
}

function renderTextInput(
    field: DynamicFormTextField | DynamicFormNumberField,
    {translate, values}: DynamicFieldContext,
    inputProps: DynamicFieldInputProps<string>,
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
                label={getInputLabel(field, translate)}
                hint={getTextHint(field, translate, values)}
                maxLength={field.maxLength}
                inputMode={inputMode}
                multiline={isMultiline}
                autoGrowHeight={isMultiline}
                maxAutoGrowHeight={isMultiline ? variables.textInputAutoGrowMaxHeight : undefined}
                {...(isMultiline ? {} : getTextInputAutocorrectProps())}
            />
        ),
    };
}

/** Fields the user types or picks a single value for */
const TEXT_RENDERERS: Pick<DynamicFieldRendererMap, 'text' | 'number' | 'date' | 'amount' | 'percent'> = {
    text: (field, context, inputProps) => renderTextInput(field, context, inputProps, getTextInputMode(field), field.multiline),
    number: (field, context, inputProps) => renderTextInput(field, context, inputProps, CONST.INPUT_MODE.NUMERIC),
    date: (field, {translate}, inputProps) => {
        const isDateOfBirth = field.rule === 'dateOfBirth';
        return {
            isMenuRow: false,
            showsDescription: true,
            input: (
                <InputWrapper
                    InputComponent={DatePicker}
                    {...inputProps}
                    label={getInputLabel(field, translate)}
                    hint={getLocalizedText(translate, field.descriptionKey, field.description)}
                    placeholder={translate('common.dateFormat')}
                    // A date of birth can only be picked within the ages getDynamicFieldErrors accepts
                    minDate={isDateOfBirth ? subYears(new Date(), CONST.DATE_BIRTH.MAX_AGE) : undefined}
                    maxDate={isDateOfBirth ? subYears(new Date(), CONST.DATE_BIRTH.MIN_AGE_FOR_PAYMENT) : undefined}
                />
            ),
        };
    },
    amount: (field, {values, translate, styles, currency}, inputProps) => {
        const chosenCurrency = field.currencyKey ? values[field.currencyKey] : undefined;
        const amountCurrency = typeof chosenCurrency === 'string' && chosenCurrency !== '' ? chosenCurrency : currency;
        // AmountForm takes no FullStory class, so the mask goes on a View around it
        const amountInput = (
            <View fsClass={inputProps.forwardedFSClass}>
                <InputWrapper
                    InputComponent={AmountForm}
                    {...inputProps}
                    label={getInputLabel(field, translate)}
                    currency={amountCurrency}
                    displayAsTextInput
                    isCurrencyPressable={false}
                />
            </View>
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
                            // A sensitive currency is not drafted, so the picker starts from the one kept in memory
                            defaultValue={amountCurrency}
                            label={translate('common.currency')}
                            accessibilityLabel={`${translate('common.currency')}, ${getFieldLabel(field, translate)}`}
                            shouldReadErrorWithLabel
                        />
                    </View>
                    {amountInput}
                </>
            ),
        };
    },
    percent: (field, {translate}, inputProps) => ({
        isMenuRow: false,
        showsDescription: true,
        input: (
            <InputWrapper
                InputComponent={PercentageForm}
                {...inputProps}
                label={getInputLabel(field, translate)}
                hint={getLocalizedText(translate, field.descriptionKey, field.description)}
            />
        ),
    }),
};

export default TEXT_RENDERERS;
