import CheckboxWithLabel from '@components/CheckboxWithLabel';
import CountryPicker from '@components/CountryPicker';
import CurrencyPicker from '@components/CurrencyPicker';
import CurrencyInlineListAdapter from '@components/DynamicForm/adapters/CurrencyInlineListAdapter';
import InlineSelectionListAdapter from '@components/DynamicForm/adapters/InlineSelectionListAdapter';
import TabsAdapter from '@components/DynamicForm/adapters/TabsAdapter';
import YesNoAdapter from '@components/DynamicForm/adapters/YesNoAdapter';
import {getFieldChoices} from '@components/DynamicForm/utils/getFieldOptions';
import {getFieldLabel} from '@components/DynamicForm/utils/getLocalizedText';
import InputWrapper from '@components/Form/InputWrapper';
import PushRowWithModal from '@components/PushRowWithModal';
import type {Choice} from '@components/RadioButtons';
import RadioButtons from '@components/RadioButtons';
import ValuePicker from '@components/ValuePicker';

import CONST from '@src/CONST';

import React from 'react';

import type {DynamicFieldInput, DynamicFieldInputProps, DynamicFieldRenderer, DynamicFieldRendererMap} from './types';

function getChoiceOptionsList(choices: Choice[]): Record<string, string> {
    return Object.fromEntries(choices.map((choice) => [choice.value, choice.label]));
}

/** A lone choice field is the page itself: its options are listed inline, and the page title asks the question */
function renderInlineChoice(label: string, choices: Choice[], inputProps: DynamicFieldInputProps, canSelectMultiple: boolean, isSearchable: boolean): DynamicFieldInput {
    const listProps = {items: choices, isSearchable, searchInputLabel: label};
    return {
        isMenuRow: true,
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

/** Fields answered by picking from options */
const CHOICE_RENDERERS: Pick<DynamicFieldRendererMap, 'select' | 'radio' | 'multiselect' | 'country' | 'countryMultiselect' | 'currency' | 'boolean'> = {
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
    multiselect: renderMultiChoice,
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
    countryMultiselect: renderMultiChoice,
    currency: (field, {translate, isLoneField}, inputProps) => {
        if (isLoneField) {
            return {
                isMenuRow: true,
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
    boolean: (field, {translate, isLoneField}, inputProps) => {
        if (field.presentation === 'yesNo') {
            return {
                isMenuRow: true,
                labelAbove: isLoneField ? undefined : 'prompt',
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
};

export default CHOICE_RENDERERS;
