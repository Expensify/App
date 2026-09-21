import {render, screen} from '@testing-library/react-native';

import AddressSearch from '@components/AddressSearch';
import AmountForm from '@components/AmountForm';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import DatePicker from '@components/DatePicker';
import addressAdapter from '@components/DynamicForm/adapters/addressAdapter';
import AmountWithCurrencyAdapter from '@components/DynamicForm/adapters/AmountWithCurrencyAdapter';
import FileUploadAdapter from '@components/DynamicForm/adapters/FileUploadAdapter';
import InlineSelectionListAdapter from '@components/DynamicForm/adapters/InlineSelectionListAdapter';
import ListFieldAdapter from '@components/DynamicForm/adapters/ListFieldAdapter';
import MultiSelectPushRowAdapter from '@components/DynamicForm/adapters/MultiSelectPushRowAdapter';
import YesNoAdapter from '@components/DynamicForm/adapters/YesNoAdapter';
import DynamicFormFields from '@components/DynamicForm/DynamicFormFields';
import type {DynamicFormValues} from '@components/DynamicForm/types';
import PercentageForm from '@components/PercentageForm';
import PushRowWithModal from '@components/PushRowWithModal';
import RadioButtons from '@components/RadioButtons';
import TextInput from '@components/TextInput';
import ValuePicker from '@components/ValuePicker';

import type {DynamicFormField, DynamicFormFieldType} from '@src/types/onyx';

import type {ComponentType} from 'react';

import React from 'react';

import allFieldTypes from '../fixtures/dynamicForm/allFieldTypes';

type CapturedInputProps = {
    InputComponent: ComponentType;
    inputID: string;
    label?: string;
    items?: Array<{value: string; label: string}>;
    optionsList?: Record<string, string>;
    fileLimit?: number;
    acceptedFileTypes?: string[];
    renamedInputKeys?: Record<string, string>;
    maxLength?: number;
    hint?: string;
    inputMode?: string;
    canSelectMultiple?: boolean;
    valueType?: string;
    currency?: string;
    currencyKey?: string;
    itemFields?: DynamicFormField[];
    shouldSaveDraft?: boolean;
    multiline?: boolean;
};

const mockInputWrapper = jest.fn((props: CapturedInputProps) => props.inputID);
const mockUploadFile = jest.fn<null, [props: unknown]>(() => null);

jest.mock('@components/Form/InputWrapper', () => ({
    __esModule: true,
    default: (props: CapturedInputProps) => mockInputWrapper(props),
}));

jest.mock('@components/UploadFile', () => ({
    __esModule: true,
    default: (props: unknown) => mockUploadFile(props),
}));

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
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

const EXPECTED_COMPONENT_BY_TYPE: Record<DynamicFormFieldType, ComponentType | ((...args: never[]) => unknown)> = {
    text: TextInput,
    select: ValuePicker,
    multiselect: MultiSelectPushRowAdapter,
    radio: RadioButtons,
    date: DatePicker,
    country: PushRowWithModal,
    address: AddressSearch,
    boolean: CheckboxWithLabel,
    file: FileUploadAdapter,
    amount: AmountWithCurrencyAdapter,
    percent: PercentageForm,
    list: ListFieldAdapter,
};

describe('DynamicFormFields', () => {
    it('renders every field type with its registered component', () => {
        const rendered = renderFields(allFieldTypes, {legalType: 'BUSINESS'});

        const fieldTypes = new Set(allFieldTypes.map((field) => field.type));
        expect(fieldTypes.size).toBe(12);
        expect(fieldTypes.size).toBe(Object.keys(EXPECTED_COMPONENT_BY_TYPE).length);
        for (const field of allFieldTypes) {
            expect(rendered.get(field.key)?.InputComponent).toBe(EXPECTED_COMPONENT_BY_TYPE[field.type]);
        }
    });

    it('hides a field whose showWhen is not satisfied and shows it when it is', () => {
        expect(renderFields(allFieldTypes, {legalType: 'PRIVATE'}).has('businessRegistrationDocument')).toBe(false);
        expect(renderFields(allFieldTypes, {}).has('businessRegistrationDocument')).toBe(false);
        expect(renderFields(allFieldTypes, {legalType: 'BUSINESS'}).has('businessRegistrationDocument')).toBe(true);
    });

    it('filters select options by dependsOn', () => {
        const forPrivate = renderFields(allFieldTypes, {legalType: 'PRIVATE'}).get('accountType');
        const forBusiness = renderFields(allFieldTypes, {legalType: 'BUSINESS'}).get('accountType');
        const unanswered = renderFields(allFieldTypes, {}).get('accountType');

        expect(forPrivate?.items?.map((item) => item.value)).toEqual(['CHECKING', 'SAVINGS']);
        expect(forBusiness?.items?.map((item) => item.value)).toEqual(['CHECKING', 'SAVINGS', 'BUSINESS_CHECKING']);
        expect(unanswered?.items).toEqual([]);
    });

    it('uses PushRowWithModal for a select with more than eight values', () => {
        const values = Array.from({length: 9}, (_, index) => ({key: `OPTION_${index}`, label: `Option ${index}`}));
        const field: DynamicFormField = {key: 'industry', label: 'Industry', group: 'Business', type: 'select', required: true, values, refreshOnChange: false};
        const sibling: DynamicFormField = {key: 'description', label: 'Description', group: 'Business', type: 'text', required: true, refreshOnChange: false};

        const rendered = renderFields([field, sibling]).get('industry');

        expect(rendered?.InputComponent).toBe(PushRowWithModal);
        expect(Object.keys(rendered?.optionsList ?? {})).toHaveLength(9);
    });

    it('offers every country in a searchable push row', () => {
        const country = renderFields(allFieldTypes).get('country');

        expect(country?.InputComponent).toBe(PushRowWithModal);
        expect(country?.optionsList?.GB).toBe('allCountries.GB');
        expect(Object.keys(country?.optionsList ?? {}).length).toBeGreaterThan(200);
    });

    it('passes maxFiles and accepted types to UploadFile', () => {
        const fileField = renderFields(allFieldTypes, {legalType: 'BUSINESS'}).get('businessRegistrationDocument');

        expect(fileField?.fileLimit).toBe(2);
        expect(fileField?.acceptedFileTypes).toEqual(['png', 'jpg', 'pdf']);

        mockUploadFile.mockClear();
        render(
            <FileUploadAdapter
                buttonText="common.chooseFiles"
                acceptedFileTypes={['png', 'jpg', 'pdf']}
                fileLimit={2}
                value={[]}
            />,
        );
        expect(mockUploadFile).toHaveBeenCalledWith(expect.objectContaining({fileLimit: 2, acceptedFileTypes: ['png', 'jpg', 'pdf'], uploadedFiles: []}));
    });

    it('uses translate(labelKey) when present and falls back to label', () => {
        const rendered = renderFields(allFieldTypes, {legalType: 'BUSINESS'});

        expect(rendered.get('dateOfBirth')?.label).toBe('common.dob');
        expect(rendered.get('legalType')?.label).toBe('Recipient type');
        expect(rendered.get('legalType')?.items?.map((item) => item.label)).toEqual(['Person', 'Business']);
    });

    it('draws the label above radio, file and list inputs and leaves text labels to the input', () => {
        renderFields(allFieldTypes, {legalType: 'BUSINESS'});

        expect(screen.getByText('Recipient type')).toBeOnTheScreen();
        expect(screen.getByText('Business registration document')).toBeOnTheScreen();
        expect(screen.getByText('Legal entity shareholders')).toBeOnTheScreen();
        expect(screen.queryByText('Account number')).not.toBeOnTheScreen();
    });

    it('passes text constraints, the example as a hint and a numeric keyboard for digit-only fields', () => {
        const accountNumber = renderFields(allFieldTypes).get('accountNumber');

        expect(accountNumber?.maxLength).toBe(8);
        expect(accountNumber?.hint).toBe('common.exampleValue');
        expect(accountNumber?.inputMode).toBe('numeric');
    });

    it('presents a lone select, multiselect or boolean as the page instead of a row', () => {
        const useCases = allFieldTypes.find((field) => field.key === 'useCases');
        const accountType = allFieldTypes.find((field) => field.key === 'accountType');
        const isSourceOfFund = allFieldTypes.find((field) => field.key === 'isSourceOfFund');
        if (!useCases || !accountType || !isSourceOfFund) {
            throw new Error('fixture changed');
        }

        const loneMultiselect = renderFields([useCases]).get('useCases');
        expect(loneMultiselect?.InputComponent).toBe(InlineSelectionListAdapter);
        expect(loneMultiselect?.canSelectMultiple).toBe(true);

        const loneSelect = renderFields([accountType], {legalType: 'PRIVATE'}).get('accountType');
        expect(loneSelect?.InputComponent).toBe(InlineSelectionListAdapter);
        expect(loneSelect?.items?.map((item) => item.value)).toEqual(['CHECKING', 'SAVINGS']);

        const loneBoolean = renderFields([isSourceOfFund]).get('isSourceOfFund');
        expect(loneBoolean?.InputComponent).toBe(YesNoAdapter);
        expect(loneBoolean?.valueType).toBeUndefined();
        expect(renderFields(allFieldTypes, {legalType: 'BUSINESS'}).get('isSourceOfFund')?.InputComponent).toBe(CheckboxWithLabel);
    });

    it('pins the amount currency without a currencyKey and lets the user choose it with one', () => {
        const pinned = renderFields([{key: 'volume', label: 'Volume', group: 'A', type: 'amount', required: true, refreshOnChange: false}]).get('volume');
        expect(pinned?.InputComponent).toBe(AmountForm);
        expect(pinned?.currency).toBe('USD');

        const chosen = renderFields(allFieldTypes, {legalType: 'BUSINESS', annualVolumeCurrency: 'GBP'}).get('annualVolume');
        expect(chosen?.InputComponent).toBe(AmountWithCurrencyAdapter);
        expect(chosen?.currency).toBe('GBP');
        expect(chosen?.currencyKey).toBe('annualVolumeCurrency');
    });

    it('summarizes each list item from its formatted answers', () => {
        const list = allFieldTypes.find((field) => field.key === 'legalEntityShareholders');
        if (!list) {
            throw new Error('fixture changed');
        }
        render(
            <ListFieldAdapter
                itemFields={list.itemFields ?? []}
                value={[{id: '1', name: 'Alice Nguyen', country: 'GB', ownershipPercentage: '25'}]}
                renderFields={() => null}
            />,
        );

        expect(screen.getByText('Alice Nguyen')).toBeOnTheScreen();
        expect(screen.getByText('allCountries.GB, 25%')).toBeOnTheScreen();
    });

    it('does not draft a list whose items hold a sensitive answer', () => {
        const owners: DynamicFormField = {
            key: 'owners',
            label: 'Owners',
            group: 'Ownership',
            type: 'list',
            required: false,
            refreshOnChange: false,
            itemFields: [
                {key: 'name', label: 'Name', group: 'Owner', type: 'text', required: true, refreshOnChange: false},
                {key: 'ssn', label: 'SSN', group: 'Owner', type: 'text', required: true, sensitive: true, refreshOnChange: false},
            ],
        };

        expect(renderFields([owners]).get('owners')?.shouldSaveDraft).toBe(false);
        expect(renderFields(allFieldTypes, {legalType: 'BUSINESS'}).get('legalEntityShareholders')?.shouldSaveDraft).toBe(true);
    });

    it('passes the item schema to the list adapter', () => {
        const list = renderFields(allFieldTypes, {legalType: 'BUSINESS'}).get('legalEntityShareholders');

        expect(list?.InputComponent).toBe(ListFieldAdapter);
        expect(list?.itemFields?.map((field) => field.key)).toEqual(['name', 'country', 'ownershipPercentage']);
    });

    it('renders a readonly field as a plain row, skips drafts for sensitive fields and grows multiline text', () => {
        const fields: DynamicFormField[] = [
            {key: 'legalName', label: 'Legal business name', group: 'Business', type: 'text', required: true, readonly: true, refreshOnChange: false},
            {key: 'ssn', label: 'SSN', group: 'Business', type: 'text', required: true, sensitive: true, refreshOnChange: false},
            {key: 'about', label: 'About', group: 'Business', type: 'text', required: true, multiline: true, maxLength: 500, refreshOnChange: false},
        ];
        const rendered = renderFields(fields, {legalName: 'Acme Inc'});

        expect(rendered.has('legalName')).toBe(false);
        expect(screen.getByText('Acme Inc')).toBeOnTheScreen();
        expect(rendered.get('ssn')?.shouldSaveDraft).toBe(false);
        expect(rendered.get('about')?.multiline).toBe(true);
    });

    it('addressAdapter maps address.* keys to AddressSearch renamedInputKeys', () => {
        expect(addressAdapter('representative.address')).toEqual({
            street: 'representative.address',
            street2: 'representative.address.street2',
            city: 'representative.address.city',
            state: 'representative.address.state',
            zipCode: 'representative.address.zipCode',
            country: 'representative.address.country',
            lat: '',
            lng: '',
            name: '',
            address: '',
        });
        expect(renderFields(allFieldTypes).get('address')?.renamedInputKeys).toEqual(addressAdapter('address'));
    });
});
