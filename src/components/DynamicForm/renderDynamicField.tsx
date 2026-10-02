import AddressSearch from '@components/AddressSearch';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import CountryPicker from '@components/CountryPicker';
import CurrencyPicker from '@components/CurrencyPicker';
import DatePicker from '@components/DatePicker';
import InputWrapper from '@components/Form/InputWrapper';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import PushRowWithModal from '@components/PushRowWithModal';
import RadioButtons from '@components/RadioButtons';
import TextInput from '@components/TextInput';
import ValuePicker from '@components/ValuePicker';

import type {ForwardedFSClassProps} from '@libs/Fullstory/types';
import getTextInputAutocorrectProps from '@libs/getTextInputAutocorrectProps';

import CONST from '@src/CONST';
import type {DynamicFormFieldType} from '@src/types/onyx';
import type {DynamicFormNumberField, DynamicFormTextField} from '@src/types/onyx/DynamicFormField';

import type {ReactElement} from 'react';

import React from 'react';

import type {DynamicFormFieldOfType, DynamicFormValues} from './types';

import getAddressInputKeys from './utils/getAddressInputKeys';
import {getFieldChoices} from './utils/getFieldOptions';
import getLocalizedText, {getFieldLabel} from './utils/getLocalizedText';

type DynamicFieldContext = {
    values: DynamicFormValues;
    translate: LocalizedTranslate;
};

/** Props every input gets from the renderer */
type DynamicFieldInputProps = Required<ForwardedFSClassProps> & {
    inputID: string;
    shouldSaveDraft: boolean;
};

type DynamicFieldLayout = {
    /** Spans the page edge to edge like a menu row, instead of sitting inside the page padding */
    isMenuRow: boolean;

    /** The input has no label of its own, so the renderer draws the field label above it */
    shouldRenderLabelAbove?: boolean;

    /** The input shows the field description itself, so the renderer does not draw it */
    showsDescription?: boolean;
};

type DynamicFieldRenderer<TType extends DynamicFormFieldType> = DynamicFieldLayout & {
    render: (field: DynamicFormFieldOfType<TType>, context: DynamicFieldContext, inputProps: DynamicFieldInputProps) => ReactElement;
};

function getTextHint(field: DynamicFormTextField | DynamicFormNumberField, translate: LocalizedTranslate): string | undefined {
    const description = getLocalizedText(translate, field.descriptionKey, field.description);
    if (description || !field.example) {
        return description;
    }
    return translate('dynamicForm.exampleHint', {example: field.example});
}

const RENDERERS: {
    [TType in DynamicFormFieldType]: DynamicFieldRenderer<TType>;
} = {
    text: {
        isMenuRow: false,
        showsDescription: true,
        render: (field, {translate}, inputProps) => (
            <InputWrapper
                InputComponent={TextInput}
                {...inputProps}
                label={getFieldLabel(field, translate)}
                hint={getTextHint(field, translate)}
                maxLength={field.maxLength}
                inputMode={field.keyboard}
                multiline={field.multiline}
                autoGrowHeight={field.multiline}
                {...(field.multiline ? {} : getTextInputAutocorrectProps())}
            />
        ),
    },
    number: {
        isMenuRow: false,
        showsDescription: true,
        render: (field, {translate}, inputProps) => (
            <InputWrapper
                InputComponent={TextInput}
                {...inputProps}
                label={getFieldLabel(field, translate)}
                hint={getTextHint(field, translate)}
                maxLength={field.maxLength}
                inputMode={CONST.INPUT_MODE.NUMERIC}
                {...getTextInputAutocorrectProps()}
            />
        ),
    },
    select: {
        isMenuRow: true,
        render: (field, {values, translate}, inputProps) => {
            const label = getFieldLabel(field, translate);
            const choices = getFieldChoices(field, values, translate);
            if (choices.length > CONST.STANDARD_LIST_ITEM_LIMIT) {
                return (
                    <InputWrapper
                        InputComponent={PushRowWithModal}
                        {...inputProps}
                        optionsList={Object.fromEntries(choices.map((choice) => [choice.value, choice.label]))}
                        description={label}
                        modalHeaderTitle={label}
                        searchInputTitle={label}
                    />
                );
            }
            return (
                <InputWrapper
                    InputComponent={ValuePicker}
                    {...inputProps}
                    label={label}
                    items={choices}
                />
            );
        },
    },
    radio: {
        isMenuRow: true,
        shouldRenderLabelAbove: true,
        render: (field, {values, translate}, inputProps) => (
            <InputWrapper
                InputComponent={RadioButtons}
                {...inputProps}
                items={getFieldChoices(field, values, translate)}
            />
        ),
    },
    date: {
        isMenuRow: false,
        render: (field, {translate}, inputProps) => (
            <InputWrapper
                InputComponent={DatePicker}
                {...inputProps}
                label={getFieldLabel(field, translate)}
                placeholder={translate('common.dateFormat')}
            />
        ),
    },
    boolean: {
        isMenuRow: false,
        render: (field, {translate}, inputProps) => (
            <InputWrapper
                InputComponent={CheckboxWithLabel}
                {...inputProps}
                valueType="boolean"
                label={getFieldLabel(field, translate)}
                accessibilityLabel={getFieldLabel(field, translate)}
            />
        ),
    },
    country: {
        isMenuRow: true,
        render: (field, {translate}, inputProps) => (
            <InputWrapper
                InputComponent={CountryPicker}
                {...inputProps}
                label={getFieldLabel(field, translate)}
            />
        ),
    },
    currency: {
        isMenuRow: true,
        render: (field, {translate}, inputProps) => (
            <InputWrapper
                InputComponent={CurrencyPicker}
                {...inputProps}
                label={getFieldLabel(field, translate)}
            />
        ),
    },
    address: {
        isMenuRow: false,
        render: (field, {translate}, inputProps) => (
            <InputWrapper
                InputComponent={AddressSearch}
                {...inputProps}
                label={getFieldLabel(field, translate)}
                renamedInputKeys={getAddressInputKeys(field.key)}
            />
        ),
    },
};

/** The input for one field, and how the renderer lays it out */
function renderDynamicField<TType extends DynamicFormFieldType>(
    field: DynamicFormFieldOfType<TType>,
    context: DynamicFieldContext,
    inputProps: DynamicFieldInputProps,
): DynamicFieldLayout & {input: ReactElement} {
    const {render, ...layout}: DynamicFieldRenderer<TType> = RENDERERS[field.type];
    return {...layout, input: render(field, context, inputProps)};
}

export default renderDynamicField;
