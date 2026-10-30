import CheckboxWithLabel from '@components/CheckboxWithLabel';
import CountryPicker from '@components/CountryPicker';
import CurrencyPicker from '@components/CurrencyPicker';
import CurrencyInlineListAdapter from '@components/DynamicForm/adapters/CurrencyInlineListAdapter';
import InlineSelectionListAdapter from '@components/DynamicForm/adapters/InlineSelectionListAdapter';
import TabsAdapter from '@components/DynamicForm/adapters/TabsAdapter';
import ToggleLinkAdapter from '@components/DynamicForm/adapters/ToggleLinkAdapter';
import YesNoAdapter from '@components/DynamicForm/adapters/YesNoAdapter';
import {getFieldChoices} from '@components/DynamicForm/utils/getFieldOptions';
import getLocalizedText, {getFieldLabel, getInputLabel} from '@components/DynamicForm/utils/getLocalizedText';
import InputWrapper from '@components/Form/InputWrapper';
import PushRowWithModal from '@components/PushRowWithModal';
import type {Choice} from '@components/RadioButtons';
import RadioButtons from '@components/RadioButtons';
import ValuePicker from '@components/ValuePicker';

import CONST from '@src/CONST';

import React from 'react';

import type {DynamicFieldInput, DynamicFieldInputProps, DynamicFieldRenderer, DynamicFieldRendererMap} from './types';

type InlineChoiceOptions = {
    canSelectMultiple: boolean;
    isSearchable: boolean;
};

function getChoiceOptionsList(choices: Choice[]): Record<string, string> {
    return Object.fromEntries(choices.map((choice) => [choice.value, choice.label]));
}

/** A lone choice field is the page itself: its options are listed inline under its question, which a page without its own title shows as its title instead */
function renderInlineChoice(
    label: string,
    choices: Choice[],
    inputProps: DynamicFieldInputProps<string | string[]>,
    {canSelectMultiple, isSearchable}: InlineChoiceOptions,
): DynamicFieldInput {
    const listProps = {items: choices, isSearchable, searchInputLabel: label};
    return {
        isMenuRow: true,
        labelAbove: 'heading',
        input: (
            <InputWrapper
                InputComponent={InlineSelectionListAdapter}
                {...inputProps}
                {...listProps}
                valueType={canSelectMultiple ? 'stringList' : 'string'}
                canSelectMultiple={canSelectMultiple}
            />
        ),
    };
}

function renderTabs(label: string, choices: Choice[], inputProps: DynamicFieldInputProps<string>, isLoneField: boolean): DynamicFieldInput {
    return {
        isMenuRow: false,
        labelAbove: isLoneField ? 'heading' : 'prompt',
        input: (
            <InputWrapper
                InputComponent={TabsAdapter}
                {...inputProps}
                items={choices}
                accessibilityLabel={label}
            />
        ),
    };
}

const renderMultiChoice: DynamicFieldRenderer<'multiselect' | 'countryMultiselect'> = (field, {values, translate, isLoneField}, inputProps) => {
    const title = getFieldLabel(field, translate);
    const choices = getFieldChoices(field, values, translate);
    if (isLoneField) {
        return renderInlineChoice(title, choices, inputProps, {canSelectMultiple: true, isSearchable: choices.length > CONST.DYNAMIC_FORM.LARGE_SELECT_MIN_OPTIONS});
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
                description={getInputLabel(field, translate)}
                modalHeaderTitle={title}
                searchInputTitle={title}
            />
        ),
    };
};

/** Fields answered by picking from options */
const CHOICE_RENDERERS: Pick<DynamicFieldRendererMap, 'select' | 'radio' | 'multiselect' | 'country' | 'countryMultiselect' | 'currency' | 'boolean'> = {
    select: (field, {values, translate, isLoneField}, inputProps) => {
        const title = getFieldLabel(field, translate);
        const label = getInputLabel(field, translate);
        const choices = getFieldChoices(field, values, translate);
        const isLong = choices.length > CONST.DYNAMIC_FORM.LARGE_SELECT_MIN_OPTIONS;
        if (field.presentation === 'tabs') {
            return renderTabs(label, choices, inputProps, isLoneField);
        }
        if (isLoneField) {
            return renderInlineChoice(title, choices, inputProps, {canSelectMultiple: false, isSearchable: isLong});
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
                        modalHeaderTitle={title}
                        searchInputTitle={title}
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
                    modalHeaderTitle={title}
                    items={choices}
                    shouldReadErrorWithLabel
                />
            ),
        };
    },
    radio: (field, {values, translate, styles, isLoneField}, inputProps) => {
        const label = getInputLabel(field, translate);
        const choices = getFieldChoices(field, values, translate);
        if (field.presentation === 'tabs') {
            return renderTabs(label, choices, inputProps, isLoneField);
        }
        return {
            isMenuRow: true,
            labelAbove: isLoneField ? 'heading' : 'prompt',
            input: (
                <InputWrapper
                    InputComponent={RadioButtons}
                    {...inputProps}
                    items={choices}
                    accessibilityLabel={label}
                    containerStyle={styles.mt0}
                />
            ),
        };
    },
    multiselect: renderMultiChoice,
    country: (field, {values, translate, isLoneField}, inputProps) => {
        const label = getInputLabel(field, translate);
        if (isLoneField) {
            return renderInlineChoice(translate('common.country'), getFieldChoices(field, values, translate), inputProps, {canSelectMultiple: false, isSearchable: true});
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
                    label={getInputLabel(field, translate)}
                    modalHeaderTitle={getFieldLabel(field, translate)}
                    shouldReadErrorWithLabel
                />
            ),
        };
    },
    boolean: (field, {translate, isLoneField}, inputProps) => {
        if (field.presentation === 'link') {
            return {
                isMenuRow: false,
                input: (
                    <InputWrapper
                        InputComponent={ToggleLinkAdapter}
                        {...inputProps}
                        valueType="boolean"
                        label={getFieldLabel(field, translate)}
                        toggledLabel={getLocalizedText(translate, field.toggledLabelKey, field.toggledLabel)}
                    />
                ),
            };
        }
        if (field.presentation !== 'checkbox') {
            return {
                isMenuRow: true,
                labelAbove: isLoneField ? 'heading' : 'prompt',
                input: (
                    <InputWrapper
                        InputComponent={YesNoAdapter}
                        {...inputProps}
                        accessibilityLabel={getInputLabel(field, translate)}
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
