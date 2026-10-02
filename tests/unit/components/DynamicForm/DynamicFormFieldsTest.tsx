import {render, screen} from '@testing-library/react-native';

import AddressSearch from '@components/AddressSearch';
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
import type {DynamicFormField, DynamicFormFieldType} from '@src/types/onyx';

import type {ComponentType} from 'react';

import React from 'react';

import allFieldTypes, {allFields} from '../../../fixtures/dynamicForm/allFieldTypes';

type CapturedInputProps = {
    InputComponent: ComponentType;
    inputID: string;
    shouldSaveDraft?: boolean;
    hint?: string;
    inputMode?: string;
    items?: Array<{value: string; label: string}>;
    optionsList?: Record<string, string>;
    renamedInputKeys?: Record<string, string>;
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

function renderFields(fields: DynamicFormField[], values: DynamicFormValues = {}) {
    mockInputWrapper.mockClear();
    render(
        <DynamicFormFields
            fields={fields}
            values={values}
        />,
    );
    return new Map(mockInputWrapper.mock.calls.map(([props]) => [props.inputID, props]));
}

const EXPECTED_INPUT_BY_TYPE: Record<DynamicFormFieldType, ComponentType | ((...args: never[]) => unknown)> = {
    text: TextInput,
    number: TextInput,
    select: ValuePicker,
    radio: RadioButtons,
    date: DatePicker,
    boolean: CheckboxWithLabel,
    country: CountryPicker,
    currency: CurrencyPicker,
    address: AddressSearch,
};

describe('DynamicFormFields', () => {
    it('renders every field type with its input', () => {
        // Given the fixture with one field per type, and a recipient type that offers account types
        // When the fields render
        const rendered = renderFields(allFields, {legalType: 'PRIVATE'});

        // Then each field is drawn by the input its type maps to
        for (const field of allFields) {
            expect(rendered.get(field.key)?.InputComponent).toBe(EXPECTED_INPUT_BY_TYPE[field.type]);
        }
    });

    it('keeps sensitive answers out of the draft', () => {
        // Given a sensitive field next to a regular one
        const ssn: DynamicFormField = {
            key: 'ssn',
            type: 'text',
            required: true,
            sensitive: true,
        };

        // When the fields render
        const rendered = renderFields([ssn, allFieldTypes.country]);

        // Then only the regular field saves its draft
        expect(rendered.get('ssn')?.shouldSaveDraft).toBe(false);
        expect(rendered.get('nationality')?.shouldSaveDraft).toBe(true);
    });

    it('offers the options picked by the answer a select depends on', () => {
        // Given a business recipient
        // When the fields render
        const rendered = renderFields([allFieldTypes.radio, allFieldTypes.select], {
            legalType: 'BUSINESS',
        });

        // Then the account type offers the business options
        expect(rendered.get('accountType')?.items).toEqual([
            {value: 'CHECKING', label: 'Checking'},
            {value: 'BUSINESS_CHECKING', label: 'Business checking'},
        ]);
    });

    it('opens a searchable list for a select with more options than fit in a picker', () => {
        // Given a select with one option more than the standard list limit
        const options = Array.from({length: CONST.STANDARD_LIST_ITEM_LIMIT + 1}, (_, index) => ({key: `option${index}`, label: `Option ${index}`}));
        const longSelect: DynamicFormField = {
            key: 'industry',
            label: 'Industry',
            type: 'select',
            required: true,
            values: options,
        };

        // When the fields render
        const rendered = renderFields([longSelect]);

        // Then it uses the push row with a searchable modal
        expect(rendered.get('industry')?.InputComponent).toBe(PushRowWithModal);
        expect(Object.keys(rendered.get('industry')?.optionsList ?? {})).toHaveLength(options.length);
    });

    it('hints a text field with its example when it has no description', () => {
        // Given the account number field, which has an example and no description
        // When the fields render
        const rendered = renderFields([allFieldTypes.text]);

        // Then the example is the hint
        expect(rendered.get('accountNumber')?.hint).toBe('dynamicForm.exampleHint:12345678');
    });

    it('stores address parts under the field key and drops the parts the form has no use for', () => {
        // Given an address field
        // When the fields render
        const rendered = renderFields([allFieldTypes.address]);

        // Then the street is the field's own value, the other parts are keyed under it, and coordinates are dropped
        expect(rendered.get('homeAddress')?.renamedInputKeys).toMatchObject({
            street: 'homeAddress',
            city: 'homeAddress.city',
            zipCode: 'homeAddress.zipCode',
            country: 'homeAddress.country',
            lat: '',
            lng: '',
        });
    });

    it('renders neither hidden fields nor fields of an unknown type', () => {
        // Given a field hidden for private recipients and a field of a type this App version does not know
        const companyName: DynamicFormField = {
            key: 'companyName',
            type: 'text',
            required: true,
            showWhen: {key: 'legalType', equals: ['BUSINESS']},
        };
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- stands in for a server type the App does not know
        const signature = {
            key: 'signature',
            type: 'signature',
            required: true,
        } as unknown as DynamicFormField;

        // When the fields render for a private recipient
        const rendered = renderFields([allFieldTypes.radio, companyName, signature], {legalType: 'PRIVATE'});

        // Then only the recipient type is drawn
        expect([...rendered.keys()]).toEqual(['legalType']);
    });

    it('shows a readonly field as its value instead of an input', () => {
        // Given a readonly country field with a prefilled answer
        const readonlyCountry: DynamicFormField = {
            ...allFieldTypes.country,
            readonly: true,
        };

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

        // Then the section title appears once
        expect(screen.getAllByText('Legal name')).toHaveLength(1);
    });
});
