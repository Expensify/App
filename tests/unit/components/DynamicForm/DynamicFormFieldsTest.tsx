import {render, screen} from '@testing-library/react-native';

import CheckboxWithLabel from '@components/CheckboxWithLabel';
import CountryPicker from '@components/CountryPicker';
import CurrencyPicker from '@components/CurrencyPicker';
import DatePicker from '@components/DatePicker';
import DynamicFormFields from '@components/DynamicForm/components/DynamicFormFields';
import type {DynamicFormValues} from '@components/DynamicForm/types';
import PushRowWithModal from '@components/PushRowWithModal';
import RadioButtons from '@components/RadioButtons';
import TextInput from '@components/TextInput';
import ValuePicker from '@components/ValuePicker';

import CONST from '@src/CONST';
import type {DynamicFormField, DynamicFormFieldType, DynamicFormSchemaField} from '@src/types/onyx';

import type {ComponentType} from 'react';

import React from 'react';

type CapturedInputProps = {
    InputComponent: ComponentType;
    inputID: string;
    shouldSaveDraft?: boolean;
    hint?: string;
    inputMode?: string;
    items?: Array<{value: string; label: string}>;
    optionsList?: Record<string, string>;
    renamedInputKeys?: Record<string, string>;
    canSelectMultiple?: boolean;
    valueType?: string;
    fileLimit?: number;
    currency?: string;
    defaultValue?: string;
    onValueChange?: (value: string, key: string) => void;
    onBlur?: () => void;
};

const mockInputWrapper = jest.fn((props: CapturedInputProps) => props.inputID);

jest.mock('@components/Form/InputWrapper', () => ({
    __esModule: true,
    default: (props: CapturedInputProps) => mockInputWrapper(props),
}));

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string, parameters?: {example?: string}) => (parameters?.example ? `${key}:${parameters.example}` : key),
    })),
);

jest.mock('@hooks/useThemeStyles', () => jest.fn(() => new Proxy({}, {get: () => ({})})));

type RenderFieldsOptions = {
    currency?: string;
    onRefreshRequirements?: (inputID: string, value: unknown) => void;
};

function renderFields(fields: DynamicFormSchemaField[], values: DynamicFormValues = {}, {currency, onRefreshRequirements}: RenderFieldsOptions = {}) {
    mockInputWrapper.mockClear();
    render(
        <DynamicFormFields
            fields={fields}
            values={values}
            currency={currency}
            onRefreshRequirements={onRefreshRequirements}
        />,
    );
    return new Map(mockInputWrapper.mock.calls.map(([props]) => [props.inputID, props]));
}

/** A second question on the page, so the field under test is drawn as a row rather than as the whole page */
const otherQuestion: DynamicFormField = {key: 'otherQuestion', type: 'text', required: false};

const EXPECTED_INPUT_BY_TYPE: Record<DynamicFormFieldType, ComponentType<never>> = {
    text: TextInput,
    number: TextInput,
    select: ValuePicker,
    radio: RadioButtons,
    date: DatePicker,
    boolean: CheckboxWithLabel,
    country: CountryPicker,
    currency: CurrencyPicker,
};

const FIELD_TYPES = Object.keys(EXPECTED_INPUT_BY_TYPE).filter((type): type is DynamicFormFieldType => Object.hasOwn(EXPECTED_INPUT_BY_TYPE, type));

describe('DynamicFormFields', () => {
    it.each(FIELD_TYPES)('renders a %s field with its input', (type) => {
        // Given a field of one type with nothing but the required properties, next to another question so it is drawn as a row
        const field: DynamicFormField = {key: 'answer', type, required: false};

        // When it renders
        const rendered = renderFields([field, otherQuestion]);

        // Then it is drawn by the input its type maps to, which is what a schema without layout hints gets
        expect(rendered.get('answer')?.InputComponent).toBe(EXPECTED_INPUT_BY_TYPE[type]);
    });

    it('keeps sensitive answers out of the draft', () => {
        // Given a sensitive field next to a regular one
        const nationality: DynamicFormField = {key: 'nationality', type: 'country', required: true};
        const ssn: DynamicFormField = {
            key: 'ssn',
            type: 'text',
            required: true,
            sensitive: true,
        };

        // When the fields render
        const rendered = renderFields([ssn, nationality]);

        // Then only the regular field saves its draft
        expect(rendered.get('ssn')?.shouldSaveDraft).toBe(false);
        expect(rendered.get('nationality')?.shouldSaveDraft).toBe(true);
    });

    it('offers the options picked by the answer a select depends on', () => {
        // Given an account type whose options depend on the recipient type
        const accountType: DynamicFormField = {
            key: 'accountType',
            type: 'select',
            required: true,
            dependsOn: {key: 'legalType', valuesBy: {PRIVATE: [{key: 'SAVINGS', label: 'Savings'}], BUSINESS: [{key: 'CHECKING', label: 'Checking'}]}},
        };

        // When the fields render for a business recipient
        const rendered = renderFields([accountType], {legalType: 'BUSINESS'});

        // Then the account type offers the business options
        expect(rendered.get('accountType')?.items).toEqual([{value: 'CHECKING', label: 'Checking'}]);
    });

    it('opens a searchable list for a select with more options than fit in a picker', () => {
        // Given a select with one option more than the standard list limit, next to another question
        const options = Array.from({length: CONST.STANDARD_LIST_ITEM_LIMIT + 1}, (_, index) => ({key: `option${index}`, label: `Option ${index}`}));
        const longSelect: DynamicFormField = {
            key: 'industry',
            label: 'Industry',
            type: 'select',
            required: true,
            values: options,
        };

        // When the fields render
        const rendered = renderFields([longSelect, otherQuestion]);

        // Then it uses the push row with a searchable modal
        expect(rendered.get('industry')?.InputComponent).toBe(PushRowWithModal);
        expect(Object.keys(rendered.get('industry')?.optionsList ?? {})).toHaveLength(options.length);
    });

    it('hints a text field with its example when it has no description', () => {
        // Given a text field with an example and no description
        const accountNumber: DynamicFormField = {key: 'accountNumber', type: 'text', required: true, example: '12345678'};

        // When the fields render
        const rendered = renderFields([accountNumber]);

        // Then the example is the hint, so the user sees the expected format before typing
        expect(rendered.get('accountNumber')?.hint).toBe('dynamicForm.exampleHint:12345678');
    });

    it('renders neither hidden fields nor fields of an unknown type', () => {
        // Given a regular field, a field hidden for private recipients and a field of a type this App version does not know
        const email: DynamicFormField = {key: 'email', type: 'text', required: true};
        const companyName: DynamicFormField = {
            key: 'companyName',
            type: 'text',
            required: true,
            showWhen: {key: 'legalType', equals: ['BUSINESS']},
        };
        const signature: DynamicFormSchemaField = {key: 'signature', type: 'signature', required: true};

        // When the fields render for a private recipient
        const rendered = renderFields([email, companyName, signature], {legalType: 'PRIVATE'});

        // Then only the regular field is drawn
        expect([...rendered.keys()]).toEqual(['email']);
    });

    it('shows a readonly field as its value instead of an input', () => {
        // Given a readonly country field with a prefilled answer
        const readonlyCountry: DynamicFormField = {key: 'nationality', type: 'country', required: true, readonly: true};

        // When the fields render
        const rendered = renderFields([readonlyCountry], {nationality: 'GB'});

        // Then no input is drawn, and the row shows the translated country
        expect(rendered.size).toBe(0);
        expect(screen.getByText('allCountries.GB')).toBeOnTheScreen();
    });

    it('titles a run of fields sharing a section once', () => {
        // Given two consecutive fields in the same section
        const firstName: DynamicFormField = {
            key: 'firstName',
            type: 'text',
            required: true,
            section: 'Legal name',
        };
        const lastName: DynamicFormField = {
            key: 'lastName',
            type: 'text',
            required: true,
            section: 'Legal name',
        };

        // When the fields render
        renderFields([firstName, lastName]);

        // Then the section title appears once, heading the run rather than each field
        expect(screen.getAllByText('Legal name')).toHaveLength(1);
    });

    it('opens the numeric keyboard for a text field whose regex takes digits only', () => {
        // Given a sort code that must be six digits, and a reference that takes letters too
        const sortCode: DynamicFormField = {key: 'sortCode', type: 'text', required: true, regex: '^\\d{6}$'};
        const reference: DynamicFormField = {key: 'reference', type: 'text', required: true, regex: '^[A-Z0-9]+$'};

        // When they render
        const rendered = renderFields([sortCode, reference]);

        // Then only the sort code opens the numeric keyboard, since its regex accepts nothing else
        expect(rendered.get('sortCode')?.inputMode).toBe(CONST.INPUT_MODE.NUMERIC);
        expect(rendered.get('reference')?.inputMode).toBeUndefined();
    });

    it('opens the phone keyboard for a phone field', () => {
        // Given a phone field without its own keyboard
        const phone: DynamicFormField = {key: 'phone', type: 'text', required: true, rule: 'phone'};

        // When it renders
        const rendered = renderFields([phone]);

        // Then the phone keyboard opens, since the schema names the rule rather than the keyboard
        expect(rendered.get('phone')?.inputMode).toBe(CONST.INPUT_MODE.TEL);
    });

    it('asks the screen to refetch the schema only when a refreshing field changes', () => {
        // Given a currency field that changes the requirements, next to one that does not
        const onRefreshRequirements = jest.fn();
        const payoutCurrency: DynamicFormField = {key: 'payoutCurrency', type: 'currency', required: true, refreshOnChange: true};
        const nickname: DynamicFormField = {key: 'nickname', type: 'text', required: false};
        const rendered = renderFields([payoutCurrency, nickname], {}, {onRefreshRequirements});

        // When the user changes the currency
        rendered.get('payoutCurrency')?.onValueChange?.('EUR', 'payoutCurrency');

        // Then the screen is told which answer changed, and the other field has no such hook
        expect(onRefreshRequirements).toHaveBeenCalledWith('payoutCurrency', 'EUR');
        expect(rendered.get('nickname')?.onValueChange).toBeUndefined();
    });

    it('asks a typed field that changes the requirements to refetch them when the user leaves it, not on every keystroke', () => {
        // Given a text field that changes the requirements
        const onRefreshRequirements = jest.fn();
        const bankCode: DynamicFormField = {key: 'bankCode', type: 'text', required: true, refreshOnChange: true};
        const rendered = renderFields([bankCode], {bankCode: '0261'}, {onRefreshRequirements});

        // When the user leaves the input
        rendered.get('bankCode')?.onBlur?.();

        // Then the screen fetches the requirements once with the typed answer, and typing alone fetches nothing
        expect(onRefreshRequirements).toHaveBeenCalledWith('bankCode', '0261');
        expect(rendered.get('bankCode')?.onValueChange).toBeUndefined();
    });
});
