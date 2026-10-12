import AmountForm from '@components/AmountForm';
import CurrencyPicker from '@components/CurrencyPicker';
import DatePicker from '@components/DatePicker';
import type {DynamicFormValues} from '@components/DynamicForm/types';
import getLocalizedText, {getFieldLabel} from '@components/DynamicForm/utils/getLocalizedText';
import InputWrapper from '@components/Form/InputWrapper';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import PercentageForm from '@components/PercentageForm';
import TextInput from '@components/TextInput';

import getTextInputAutocorrectProps from '@libs/getTextInputAutocorrectProps';

import CONST from '@src/CONST';
import type {DynamicFormNumberField, DynamicFormTextField} from '@src/types/onyx';

import type {InputModeOptions} from 'react-native';

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

/** Fields the user types or picks a single value for */
const TEXT_RENDERERS: Pick<DynamicFieldRendererMap, 'text' | 'number' | 'date' | 'amount' | 'percent'> = {
    text: (field, context, inputProps) => renderTextInput(field, context, inputProps, getTextInputMode(field), field.multiline),
    number: (field, context, inputProps) => renderTextInput(field, context, inputProps, CONST.INPUT_MODE.NUMERIC),
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

export default TEXT_RENDERERS;
