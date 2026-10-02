import {render, screen} from '@testing-library/react-native';

import AddressSearch from '@components/AddressSearch';
import AmountForm from '@components/AmountForm';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import CountryPicker from '@components/CountryPicker';
import CurrencyPicker from '@components/CurrencyPicker';
import DatePicker from '@components/DatePicker';
import AmountWithCurrencyAdapter from '@components/DynamicForm/adapters/AmountWithCurrencyAdapter';
import CurrencyInlineListAdapter from '@components/DynamicForm/adapters/CurrencyInlineListAdapter';
import FileUploadAdapter from '@components/DynamicForm/adapters/FileUploadAdapter';
import InlineSelectionListAdapter from '@components/DynamicForm/adapters/InlineSelectionListAdapter';
import TabsAdapter from '@components/DynamicForm/adapters/TabsAdapter';
import YesNoAdapter from '@components/DynamicForm/adapters/YesNoAdapter';
import DynamicFormFields from '@components/DynamicForm/components/DynamicFormFields';
import type {DynamicFormValues} from '@components/DynamicForm/types';
import getAddressInputKeys from '@components/DynamicForm/utils/getAddressInputKeys';
import PercentageForm from '@components/PercentageForm';
import PushRowWithModal from '@components/PushRowWithModal';
import RadioButtons from '@components/RadioButtons';
import TextInput from '@components/TextInput';
import ValuePicker from '@components/ValuePicker';

import CONST from '@src/CONST';
import type {DynamicFormField, DynamicFormFieldType} from '@src/types/onyx';

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
    currencyKey?: string;
    onValueChange?: (value: string, key: string) => void;
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

function renderFields(fields: DynamicFormField[], values: DynamicFormValues = {}, currency?: string, onRefreshRequirements?: (inputID: string, value: unknown) => void) {
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
    multiselect: PushRowWithModal,
    countryMultiselect: PushRowWithModal,
    file: FileUploadAdapter,
    amount: AmountForm,
    percent: PercentageForm,
};

describe('DynamicFormFields', () => {
    it.each(Object.entries(EXPECTED_INPUT_BY_TYPE))('renders a %s field with its input', (type, ExpectedInput) => {
        // Given a field of one type with nothing but the required properties, next to another question
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the keys of EXPECTED_INPUT_BY_TYPE are field types, Object.entries types them as strings
        const field = {key: 'answer', type, required: false} as DynamicFormField;

        // When it renders
        const rendered = renderFields([field, otherQuestion]);

        // Then it is drawn by the input its type maps to
        expect(rendered.get('answer')?.InputComponent).toBe(ExpectedInput);
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

        // Then the example is the hint
        expect(rendered.get('accountNumber')?.hint).toBe('dynamicForm.exampleHint:12345678');
    });

    it('stores address parts under the field key and drops the parts the form has no use for', () => {
        // Given an address field
        const homeAddress: DynamicFormField = {key: 'homeAddress', type: 'address', required: true};

        // When the fields render
        const rendered = renderFields([homeAddress]);

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
        // Given a regular field, a field hidden for private recipients and a field of a type this App version does not know
        const email: DynamicFormField = {key: 'email', type: 'text', required: true};
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

        // Then the section title appears once
        expect(screen.getAllByText('Legal name')).toHaveLength(1);
    });

    it('lets the user tick several options of a multiselect and starts it as an empty list', () => {
        // Given a multiselect field next to another question
        const industries: DynamicFormField = {key: 'industries', label: 'Industries', type: 'multiselect', required: true, values: [{key: 'RETAIL', label: 'Retail'}]};

        // When it renders
        const rendered = renderFields([industries, otherQuestion]);

        // Then the push row allows several choices, and FormProvider starts the answer as a list
        expect(rendered.get('industries')).toMatchObject({canSelectMultiple: true, valueType: 'stringList', optionsList: {RETAIL: 'Retail'}});
    });

    it('allows several files by default and names the field above the upload button', () => {
        // Given a file field with no file limit, alone in the list like the source of funds page
        const proofOfFunds: DynamicFormField = {key: 'proofOfFunds', label: 'Source of funds document', type: 'file', required: true};

        // When it renders
        const rendered = renderFields([proofOfFunds]);

        // Then the upload takes up to the App's attachment limit, and the label stays visible as a heading
        expect(rendered.get('proofOfFunds')).toMatchObject({valueType: 'files', fileLimit: CONST.API_ATTACHMENT_VALIDATIONS.MAX_FILE_LIMIT});
        expect(screen.getByText('Source of funds document')).toBeOnTheScreen();
    });

    it('prices an amount in the currency the user picked, falling back to the screen currency', () => {
        // Given an amount whose currency the user picks under another key
        const expectedVolume: DynamicFormField = {key: 'expectedVolume', type: 'amount', required: true, currencyKey: 'expectedVolumeCurrency'};

        // When it renders before and after a currency is picked
        const beforePick = renderFields([expectedVolume], {}, CONST.CURRENCY.GBP);
        const afterPick = renderFields([expectedVolume], {expectedVolumeCurrency: CONST.CURRENCY.EUR}, CONST.CURRENCY.GBP);

        // Then it shows the currency picker, priced in the screen currency until the user picks one
        expect(beforePick.get('expectedVolume')).toMatchObject({InputComponent: AmountWithCurrencyAdapter, currency: CONST.CURRENCY.GBP, currencyKey: 'expectedVolumeCurrency'});
        expect(afterPick.get('expectedVolume')?.currency).toBe(CONST.CURRENCY.EUR);
    });

    it('draws the full address form with a country picker', () => {
        // Given an address field
        const homeAddress: DynamicFormField = {key: 'homeAddress', label: 'Home address', type: 'address', required: true};

        // When it renders
        const rendered = renderFields([homeAddress]);

        // Then the user sees and can correct every part, each stored under the field key
        expect([...rendered.keys()]).toEqual(['homeAddress', 'homeAddress.city', 'homeAddress.state', 'homeAddress.zipCode', 'homeAddress.country']);
        expect(screen.getByText('Home address')).toBeOnTheScreen();
    });

    it('opens the phone keyboard for a phone field', () => {
        // Given a phone field without its own keyboard
        const phone: DynamicFormField = {key: 'phone', type: 'text', required: true, rule: 'phone'};

        // When it renders
        const rendered = renderFields([phone]);

        // Then the phone keyboard opens
        expect(rendered.get('phone')?.inputMode).toBe(CONST.INPUT_MODE.TEL);
    });

    it('asks the screen to refetch the schema only when a refreshing field changes', () => {
        // Given a currency field that changes the requirements, next to one that does not
        const onRefreshRequirements = jest.fn();
        const payoutCurrency: DynamicFormField = {key: 'payoutCurrency', type: 'currency', required: true, refreshRequirementsOnChange: true};
        const nickname: DynamicFormField = {key: 'nickname', type: 'text', required: false};
        const rendered = renderFields([payoutCurrency, nickname], {}, undefined, onRefreshRequirements);

        // When the user changes the currency
        rendered.get('payoutCurrency')?.onValueChange?.('EUR', 'payoutCurrency');

        // Then the screen is told which answer changed, and the other field has no such hook
        expect(onRefreshRequirements).toHaveBeenCalledWith('payoutCurrency', 'EUR');
        expect(rendered.get('nickname')?.onValueChange).toBeUndefined();
    });

    it('shows a readonly address as one line', () => {
        // Given a readonly, prefilled address
        const officeAddress: DynamicFormField = {key: 'office', type: 'address', required: true, readonly: true};
        const addressKeys = getAddressInputKeys(officeAddress.key);
        const values = {office: '224 Main Street', [addressKeys.city]: 'San Francisco', [addressKeys.state]: 'CA', [addressKeys.zipCode]: '94123'};

        // When it renders
        renderFields([officeAddress], values);

        // Then the row reads like a postal address
        expect(screen.getByText('224 Main Street, San Francisco, CA 94123')).toBeOnTheScreen();
    });

    it.each([
        ['select', InlineSelectionListAdapter],
        ['multiselect', InlineSelectionListAdapter],
        ['country', InlineSelectionListAdapter],
        ['countryMultiselect', InlineSelectionListAdapter],
        ['currency', CurrencyInlineListAdapter],
        ['boolean', YesNoAdapter],
    ] as const)('draws a %s field alone on its page as the page itself', (type, ExpectedInput) => {
        // Given the only question on the page
        const field: DynamicFormField = {key: 'answer', label: 'The question', type, required: true};

        // When it renders
        const rendered = renderFields([field]);

        // Then the choice is drawn as the page itself, under the question
        expect(rendered.get('answer')?.InputComponent).toBe(ExpectedInput);
        expect(screen.getByText('The question')).toBeOnTheScreen();
    });

    it('keeps a lone list as the page when it reveals a follow-up field', () => {
        // Given a source of wealth list whose "Other" answer reveals a description field
        const sourceOfWealth: DynamicFormField = {key: 'sourceOfWealth', type: 'select', required: true, values: [{key: 'SAVINGS'}, {key: 'OTHER'}]};
        const otherDescription: DynamicFormField = {key: 'otherDescription', type: 'text', required: true, showWhen: {key: 'sourceOfWealth', equals: ['OTHER']}};

        // When the user picks Other, so both fields are visible
        const rendered = renderFields([sourceOfWealth, otherDescription], {sourceOfWealth: 'OTHER'});

        // Then the list stays the page, with the description below it, instead of turning into a picker row
        expect(rendered.get('sourceOfWealth')?.InputComponent).toBe(InlineSelectionListAdapter);
        expect(rendered.get('otherDescription')?.InputComponent).toBe(TextInput);
    });

    it('draws a choice with the tabs presentation as a tab row', () => {
        // Given a recipient type select presented as tabs, next to another question
        const legalType: DynamicFormField = {key: 'legalType', type: 'select', required: true, presentation: 'tabs', values: [{key: 'PRIVATE'}, {key: 'BUSINESS'}]};

        // When it renders
        const rendered = renderFields([legalType, otherQuestion]);

        // Then it is a tab row
        expect(rendered.get('legalType')?.InputComponent).toBe(TabsAdapter);
    });
});
