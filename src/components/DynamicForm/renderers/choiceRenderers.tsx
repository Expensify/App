import CheckboxWithLabel from '@components/CheckboxWithLabel';
import CountryPicker from '@components/CountryPicker';
import CurrencyPicker from '@components/CurrencyPicker';
import {getFieldChoices} from '@components/DynamicForm/utils/getFieldOptions';
import {getFieldLabel} from '@components/DynamicForm/utils/getLocalizedText';
import InputWrapper from '@components/Form/InputWrapper';
import PushRowWithModal from '@components/PushRowWithModal';
import type {Choice} from '@components/RadioButtons';
import RadioButtons from '@components/RadioButtons';
import ValuePicker from '@components/ValuePicker';

import React from 'react';

import type {DynamicFieldRendererMap} from './types';

/** Above this many options a choice opens a searchable list instead of showing every option at once */
const LONG_CHOICE_LIST_THRESHOLD = 8;

function getChoiceOptionsList(choices: Choice[]): Record<string, string> {
    return Object.fromEntries(choices.map((choice) => [choice.value, choice.label]));
}

/** Fields answered by picking from options */
const CHOICE_RENDERERS: Pick<DynamicFieldRendererMap, 'select' | 'radio' | 'country' | 'currency' | 'boolean'> = {
    select: (field, {values, translate}, inputProps) => {
        const label = getFieldLabel(field, translate);
        const choices = getFieldChoices(field, values, translate);
        const isLong = choices.length > LONG_CHOICE_LIST_THRESHOLD;
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
        return {
            isMenuRow: true,
            labelAbove: isLoneField ? undefined : 'prompt',
            input: (
                <InputWrapper
                    InputComponent={RadioButtons}
                    {...inputProps}
                    items={choices}
                />
            ),
        };
    },
    country: (field, {translate}, inputProps) => {
        const label = getFieldLabel(field, translate);
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
    currency: (field, {translate}, inputProps) => {
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
    boolean: (field, {translate}, inputProps) => {
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
};

export default CHOICE_RENDERERS;
