import {act, render, screen} from '@testing-library/react-native';

import AddressSearch from '@components/AddressSearch';
import AmountForm from '@components/AmountForm';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import DatePicker from '@components/DatePicker';
import CurrencyInlineListAdapter from '@components/DynamicForm/adapters/CurrencyInlineListAdapter';
import FileUploadAdapter from '@components/DynamicForm/adapters/FileUploadAdapter';
import InlineSelectionListAdapter from '@components/DynamicForm/adapters/InlineSelectionListAdapter';
import ListFieldAdapter from '@components/DynamicForm/adapters/ListFieldAdapter';
import TabsAdapter from '@components/DynamicForm/adapters/TabsAdapter';
import ToggleLinkAdapter from '@components/DynamicForm/adapters/ToggleLinkAdapter';
import YesNoAdapter from '@components/DynamicForm/adapters/YesNoAdapter';
import DynamicFormFields from '@components/DynamicForm/components/DynamicFormFields';
import type {DynamicFormValues} from '@components/DynamicForm/types';
import getAddressInputKeys from '@components/DynamicForm/utils/getAddressInputKeys';
import type {FormValue} from '@components/Form/types';
import CurrencyDropdownAdapter from '@components/FormDropdownField/CurrencyDropdownAdapter';
import DropdownChoiceAdapter from '@components/FormDropdownField/DropdownChoiceAdapter';
import MultiChoiceDropdownAdapter from '@components/FormDropdownField/MultiChoiceDropdownAdapter';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import PercentageForm from '@components/PercentageForm';
import RadioButtons from '@components/RadioButtons';
import TextInput from '@components/TextInput';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {DynamicFormContentItem, DynamicFormField, DynamicFormFieldType, DynamicFormHeading, DynamicFormSchemaField} from '@src/types/onyx';

import type {ComponentType} from 'react';

import React from 'react';

type CapturedInputProps = {
    InputComponent: ComponentType;
    inputID: string;
    shouldSaveDraft?: boolean;
    forwardedFSClass?: string;
    hint?: string;
    inputMode?: string;
    maxAutoGrowHeight?: number;
    items?: Array<{value: string; label: string; searchValue?: string}>;
    optionsList?: Record<string, string>;
    renamedInputKeys?: Record<string, string>;
    canSelectMultiple?: boolean;
    isSearchable?: boolean;
    valueType?: string;
    fileLimit?: number;
    maxFileSize?: number;
    accessibilityLabel?: string;
    currency?: string;
    defaultValue?: unknown;
    onValueChange?: (value: string, key: string) => void;
    onBlur?: () => void;
    disabled?: boolean;
    shouldAllowChange?: boolean;
    stateInputIDToReset?: string;
    sentryLabel?: string;
    backButtonSentryLabel?: string;
    applyButtonSentryLabel?: string;
};

const mockNetwork = {isOffline: false};

jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: mockNetwork.isOffline})));

const mockInputWrapper = jest.fn((props: CapturedInputProps) => props.inputID);

jest.mock('@components/Form/InputWrapper', () => ({
    __esModule: true,
    default: (props: CapturedInputProps) => mockInputWrapper(props),
}));

const mockOnFileTextInput = jest.fn((props: {inputID: string; label?: string; shouldSaveDraft?: boolean}) => props.inputID);

jest.mock('@components/DynamicForm/components/DynamicFormOnFileTextInput', () => ({
    __esModule: true,
    default: (props: {inputID: string}) => mockOnFileTextInput(props),
}));

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string, parameters?: {example?: string; count?: number}) => {
            if (parameters?.example) {
                return `${key}:${parameters.example}`;
            }
            return parameters?.count === undefined ? key : `${key}:${parameters.count}`;
        },
    })),
);

jest.mock('@hooks/useThemeStyles', () => jest.fn(() => new Proxy({}, {get: () => ({})})));

const mockAnnouncement = jest.fn<void, [unknown, boolean, unknown]>();
jest.mock('@hooks/useAccessibilityAnnouncement', () => ({
    __esModule: true,
    default: (message: unknown, shouldAnnounce: boolean, options: unknown) => mockAnnouncement(message, shouldAnnounce, options),
}));

type TestInstance = ReturnType<typeof screen.UNSAFE_getByProps>;

/** Whether a view around the element masks it in session recordings */
function isMasked(element: TestInstance): boolean {
    let ancestor: TestInstance | null = element;
    while (ancestor) {
        if (ancestor.props.fsClass === CONST.FULLSTORY.CLASS.MASK) {
            return true;
        }
        ancestor = ancestor.parent;
    }
    return false;
}

type RenderFieldsOptions = {
    currency?: string;
    maxFileSize?: number;
    onRefreshRequirements?: (inputID: string, value: unknown) => void;
    isLoneFieldInHeadline?: boolean;
};

function renderFields(content: DynamicFormContentItem[], values: DynamicFormValues = {}, {currency, maxFileSize, onRefreshRequirements, isLoneFieldInHeadline}: RenderFieldsOptions = {}) {
    mockInputWrapper.mockClear();
    mockOnFileTextInput.mockClear();
    render(
        <DynamicFormFields
            content={content}
            values={values}
            currency={currency}
            maxFileSize={maxFileSize}
            onRefreshRequirements={onRefreshRequirements}
            isLoneFieldInHeadline={isLoneFieldInHeadline}
        />,
    );
    return new Map(mockInputWrapper.mock.calls.map(([props]) => [props.inputID, props]));
}

/** A second question on the page, so the field under test is drawn as a row rather than as the whole page */
const otherQuestion: DynamicFormField = {key: 'otherQuestion', type: 'text', required: false};

const EXPECTED_INPUT_BY_TYPE: Record<DynamicFormFieldType, ComponentType<never>> = {
    text: TextInput,
    number: TextInput,
    select: DropdownChoiceAdapter,
    radio: RadioButtons,
    date: DatePicker,
    boolean: YesNoAdapter,
    country: DropdownChoiceAdapter,
    currency: CurrencyDropdownAdapter,
    address: AddressSearch,
    multiselect: MultiChoiceDropdownAdapter,
    countryMultiselect: MultiChoiceDropdownAdapter,
    file: FileUploadAdapter,
    amount: AmountForm,
    percent: PercentageForm,
    list: ListFieldAdapter,
};

const FIELD_TYPES = Object.keys(EXPECTED_INPUT_BY_TYPE).filter((type): type is DynamicFormFieldType => Object.hasOwn(EXPECTED_INPUT_BY_TYPE, type));

const SENSITIVE_ANSWER_BY_TYPE: Record<DynamicFormFieldType, FormValue> = {
    text: 'Jane',
    number: '123456789',
    select: 'SAVINGS',
    radio: 'SAVINGS',
    multiselect: ['RETAIL'],
    date: '1990-05-01',
    address: '1 Main St',
    file: [{name: 'passport.pdf', uri: 'file://passport.pdf'}],
    amount: '1000',
    country: 'PL',
    countryMultiselect: ['PL', 'DE'],
    boolean: true,
    currency: 'EUR',
    percent: '25',
    list: [{id: 'a'}],
};

describe('DynamicFormFields', () => {
    it.each(FIELD_TYPES)('renders a %s field with its input', (type) => {
        // Given a field of one type with nothing but the required properties, next to another question so it is drawn as a row
        const field: DynamicFormField = type === 'list' ? {key: 'answer', type, required: false, itemFields: []} : {key: 'answer', type, required: false};

        // When it renders
        const rendered = renderFields([field, otherQuestion]);

        // Then it is drawn by the input its type maps to, which is what a schema without layout hints gets, and its answer is masked in session recordings, including by inputs that do not pass the FullStory class on
        expect(rendered.get('answer')?.InputComponent).toBe(EXPECTED_INPUT_BY_TYPE[type]);
        expect(rendered.get('answer')?.forwardedFSClass).toBe(CONST.FULLSTORY.CLASS.MASK);
        expect(isMasked(screen.UNSAFE_getByProps({inputID: 'answer'}))).toBe(true);
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

    it('draws a sensitive answer the server holds with the on-file input', () => {
        // Given a resumed SSN the server holds, which it never sends back
        const ssn: DynamicFormField = {key: 'ssn', type: 'text', required: true, sensitive: true};

        // When its page renders
        renderFields([ssn, otherQuestion], {ssnProvided: true});

        // Then the on-file input draws it, which shows the mask until the user clears it, with the label and the draft rule the field would get anyway
        expect(mockOnFileTextInput).toHaveBeenCalledWith(expect.objectContaining({inputID: 'ssn', label: 'ssn', shouldSaveDraft: false}));
    });

    it('shows no mask on a sensitive field the server does not hold', () => {
        // Given an SSN the user has not given yet
        const ssn: DynamicFormField = {key: 'ssn', type: 'text', required: true, sensitive: true};

        // When the field renders
        const rendered = renderFields([ssn, otherQuestion]);

        // Then the input is a plain one, with nothing suggesting an answer is on file
        expect(mockOnFileTextInput).not.toHaveBeenCalled();
        expect(rendered.get('ssn')?.InputComponent).toBe(TextInput);
    });

    it.each(FIELD_TYPES)('refills a sensitive %s field from the answer kept in memory', (type) => {
        // Given a sensitive field of one type, whose answer is kept in memory instead of in the draft
        const field: DynamicFormField = type === 'list' ? {key: 'answer', type, required: true, sensitive: true, itemFields: []} : {key: 'answer', type, required: true, sensitive: true};
        const answer = SENSITIVE_ANSWER_BY_TYPE[type];

        // When the user comes back to its page
        const rendered = renderFields([field, otherQuestion], {answer});

        // Then the input starts from that answer, so the user does not have to give it again
        expect(rendered.get('answer')?.defaultValue).toEqual(answer);
    });

    it('leaves a regular field to its draft when the user comes back to its page', () => {
        // Given a regular field with an answer, which FormProvider refills from the draft
        const nationality: DynamicFormField = {key: 'nationality', type: 'country', required: true};

        // When its page renders
        const rendered = renderFields([nationality, otherQuestion], {nationality: 'PL'});

        // Then the input gets no default of its own, so the draft stays the one source of its answer
        expect(rendered.get('nationality')?.defaultValue).toBeUndefined();
    });

    it.each<{name: string; field: DynamicFormField; inputID: string}>([
        {name: 'select', field: {key: 'answer', type: 'select', required: false, values: [{key: 'A', label: 'A'}]}, inputID: 'answer'},
        {name: 'country', field: {key: 'answer', type: 'country', required: false}, inputID: 'answer'},
        {name: 'currency', field: {key: 'answer', type: 'currency', required: false}, inputID: 'answer'},
        {name: 'amount currency', field: {key: 'answer', type: 'amount', required: false, currencyKey: 'answerCurrency'}, inputID: 'answerCurrency'},
        {name: 'address country', field: {key: 'answer', type: 'address', required: false}, inputID: getAddressInputKeys('answer').country},
    ])('labels the $name dropdown row with the shared DynamicForm Sentry labels', ({field, inputID}) => {
        // Given a field drawn as a single choice dropdown row, whose adapter takes its Sentry labels from the form

        // When it renders
        const rendered = renderFields([field, otherQuestion]);

        // Then it keeps the labels it had before the adapters moved out of DynamicForm, so its Sentry history carries on
        expect(rendered.get(inputID)).toMatchObject({
            sentryLabel: CONST.SENTRY_LABEL.DYNAMIC_FORM.CHOICE_FIELD,
            backButtonSentryLabel: CONST.SENTRY_LABEL.DYNAMIC_FORM.CHOICE_FIELD_BACK,
        });
    });

    it('labels the address state dropdown row with the shared DynamicForm Sentry labels', () => {
        // Given a US address, which asks for its state in a dropdown row
        const homeAddress: DynamicFormField = {key: 'homeAddress', type: 'address', required: false};
        const keys = getAddressInputKeys('homeAddress');

        // When it renders
        const rendered = renderFields([homeAddress], {[keys.country]: CONST.COUNTRY.US});

        // Then the state row keeps the labels it had before the adapters moved out of DynamicForm
        expect(rendered.get(keys.state)).toMatchObject({
            sentryLabel: CONST.SENTRY_LABEL.DYNAMIC_FORM.CHOICE_FIELD,
            backButtonSentryLabel: CONST.SENTRY_LABEL.DYNAMIC_FORM.CHOICE_FIELD_BACK,
        });
    });

    it.each(['multiselect', 'countryMultiselect'] as const)('labels the %s dropdown row and its Apply button with the shared DynamicForm Sentry labels', (type) => {
        // Given a field drawn as a multi choice dropdown row, which also has an Apply button
        const field: DynamicFormField = {key: 'answer', type, required: false, values: [{key: 'A', label: 'A'}]};

        // When it renders
        const rendered = renderFields([field, otherQuestion]);

        // Then the row, its back button and its Apply button keep the labels they had before the adapters moved out of DynamicForm
        expect(rendered.get('answer')).toMatchObject({
            sentryLabel: CONST.SENTRY_LABEL.DYNAMIC_FORM.CHOICE_FIELD,
            backButtonSentryLabel: CONST.SENTRY_LABEL.DYNAMIC_FORM.CHOICE_FIELD_BACK,
            applyButtonSentryLabel: CONST.SENTRY_LABEL.DYNAMIC_FORM.CHOICE_FIELD_APPLY,
        });
    });

    it('refills every part of a sensitive address from memory', () => {
        // Given a sensitive address whose parts are kept in memory
        const homeAddress: DynamicFormField = {key: 'homeAddress', type: 'address', required: true, sensitive: true};
        const keys = getAddressInputKeys('homeAddress');
        const values = {homeAddress: '1 Main St', [keys.city]: 'Austin', [keys.state]: 'TX', [keys.zipCode]: '78701', [keys.country]: CONST.COUNTRY.US};

        // When the user comes back to its page
        const rendered = renderFields([homeAddress], values);

        // Then every part starts from its answer, so none of them is asked again
        expect(rendered.get(keys.street)?.defaultValue).toBe('1 Main St');
        expect(rendered.get(keys.city)?.defaultValue).toBe('Austin');
        expect(rendered.get(keys.state)?.defaultValue).toBe('TX');
        expect(rendered.get(keys.zipCode)?.defaultValue).toBe('78701');
        expect(rendered.get(keys.country)?.defaultValue).toBe(CONST.COUNTRY.US);
    });

    it('refills the currency of a sensitive amount from memory', () => {
        // Given a sensitive amount whose currency the user picked, both kept in memory
        const expectedVolume: DynamicFormField = {key: 'expectedVolume', type: 'amount', required: true, sensitive: true, currencyKey: 'expectedVolumeCurrency'};

        // When the user comes back to its page
        const rendered = renderFields([expectedVolume], {expectedVolume: '1000', expectedVolumeCurrency: CONST.CURRENCY.EUR}, {currency: CONST.CURRENCY.GBP});

        // Then the picker starts from the picked currency rather than the screen currency
        expect(rendered.get('expectedVolumeCurrency')?.defaultValue).toBe(CONST.CURRENCY.EUR);
        expect(rendered.get('expectedVolume')?.defaultValue).toBe('1000');
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

    it.each([2, CONST.DYNAMIC_FORM.LARGE_SELECT_MIN_OPTIONS, CONST.STANDARD_LIST_ITEM_LIMIT + 1])('draws a select with %i options as a dropdown row', (optionCount) => {
        // Given a select next to another question, short or long, since every choice field on a shared page uses the
        // same dropdown the expense form uses for its category, tag and tax
        const options = Array.from({length: optionCount}, (_, index) => ({key: `option${index}`, label: `Option ${index}`}));
        const accountType: DynamicFormField = {key: 'accountType', label: 'Account type', type: 'select', required: true, values: options};

        // When the fields render
        const rendered = renderFields([accountType, otherQuestion]);

        // Then it is the dropdown row, offering every option
        expect(rendered.get('accountType')?.InputComponent).toBe(DropdownChoiceAdapter);
        expect(rendered.get('accountType')?.items).toHaveLength(optionCount);
    });

    it('hints a text field with its example when it has no description', () => {
        // Given a text field with an example and no description
        const accountNumber: DynamicFormField = {key: 'accountNumber', type: 'text', required: true, example: '12345678'};

        // When the fields render
        const rendered = renderFields([accountNumber]);

        // Then the example is the hint, so the user sees the expected format before typing
        expect(rendered.get('accountNumber')?.hint).toBe('dynamicForm.exampleHint:12345678');
    });

    it('stores address parts under the field key and drops the parts the form has no use for', () => {
        // Given an address field
        const homeAddress: DynamicFormField = {key: 'homeAddress', type: 'address', required: true};

        // When the fields render
        const rendered = renderFields([homeAddress]);

        // Then the street is the field's own value, the other parts are keyed under it, coordinates are dropped, and with no second street line there is no street2 part
        expect(rendered.get('homeAddress')?.renamedInputKeys).toMatchObject({
            street: 'homeAddress',
            city: 'homeAddress.city',
            zipCode: 'homeAddress.zipCode',
            country: 'homeAddress.country',
            lat: '',
            lng: '',
        });
        expect(rendered.get('homeAddress')?.renamedInputKeys).not.toHaveProperty('street2');
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

        // Then no input is drawn, and the row shows the translated country, masked in session recordings since a prefilled answer is still personal,
        // while the field name stays readable
        expect(rendered.size).toBe(0);
        expect(screen.getByText('allCountries.GB')).toBeOnTheScreen();
        expect(isMasked(screen.getByText('allCountries.GB'))).toBe(true);
        expect(isMasked(screen.UNSAFE_getByType(MenuItemField))).toBe(false);
    });

    it('draws a heading with its description above the fields that follow it', () => {
        // Given a heading item, which has no type, followed by two fields
        const legalName: DynamicFormHeading = {key: 'legalName', title: 'Legal name', description: 'As on your ID'};
        const firstName: DynamicFormField = {key: 'firstName', type: 'text', required: true};
        const lastName: DynamicFormField = {key: 'lastName', type: 'text', required: true};

        // When the content renders
        const rendered = renderFields([legalName, firstName, lastName]);

        // Then the heading is drawn as a title screen readers can jump to, not as an input, and both fields still get theirs
        expect(screen.getByRole(CONST.ROLE.HEADER, {name: 'Legal name'})).toBeOnTheScreen();
        expect(screen.getByText('As on your ID')).toBeOnTheScreen();
        expect([...rendered.keys()]).toEqual(['firstName', 'lastName']);
    });

    it('leaves out a heading over a field of an unknown type', () => {
        // Given a name field, then a "Signature" heading over a signature field this App version does not know
        const accountHolderName: DynamicFormField = {key: 'accountHolderName', type: 'text', required: true};
        const signatureHeading: DynamicFormHeading = {key: 'signatureHeading', title: 'Signature'};
        const signature: DynamicFormSchemaField = {key: 'signature', type: 'signature', required: true};

        // When the content renders
        const rendered = renderFields([accountHolderName, signatureHeading, signature]);

        // Then the name field renders and the heading does not, since a title over nothing would be an orphan
        expect([...rendered.keys()]).toEqual(['accountHolderName']);
        expect(screen.queryByText('Signature')).not.toBeOnTheScreen();
    });

    it('leaves out a heading over a hidden field', () => {
        // Given a heading over a field shown only for business recipients
        const companyHeading: DynamicFormHeading = {key: 'company', title: 'Company'};
        const companyName: DynamicFormField = {key: 'companyName', type: 'text', required: true, showWhen: {key: 'legalType', equals: ['BUSINESS']}};

        // When the content renders for a private recipient
        renderFields([companyHeading, companyName], {legalType: 'PRIVATE'});

        // Then the heading is not drawn, since a title over nothing would be an orphan
        expect(screen.queryByText('Company')).not.toBeOnTheScreen();
    });

    it('leaves out a heading whose own condition does not match, but keeps the fields after it', () => {
        // Given a heading shown only for business recipients, followed by a field with no condition
        const businessHeading: DynamicFormHeading = {key: 'business', title: 'Business details', showWhen: {key: 'legalType', equals: ['BUSINESS']}};
        const email: DynamicFormField = {key: 'email', type: 'text', required: true};

        // When the content renders for a private recipient
        const rendered = renderFields([businessHeading, email], {legalType: 'PRIVATE'});

        // Then the heading is hidden, and the field still renders since a heading marks a place rather than containing fields
        expect(screen.queryByText('Business details')).not.toBeOnTheScreen();
        expect([...rendered.keys()]).toEqual(['email']);
    });

    it('renders a heading and a field that share a key without a duplicate key warning', () => {
        // Given a heading keyed like the field under it, which the schema allows since only fields need unique keys
        const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
        const addressHeading: DynamicFormHeading = {key: 'address', title: 'Address'};
        const address: DynamicFormField = {key: 'address', type: 'text', required: true};

        // When the content renders
        const rendered = renderFields([addressHeading, address]);

        // Then both render and React reports no duplicate key, which would let it mix up the two rows
        expect(screen.getByText('Address')).toBeOnTheScreen();
        expect([...rendered.keys()]).toEqual(['address']);
        const loggedArguments: unknown[] = consoleError.mock.calls.flat();
        expect(loggedArguments.some((argument) => typeof argument === 'string' && argument.includes('same key'))).toBe(false);
        consoleError.mockRestore();
    });

    it('lets the user tick several options of a multiselect and stores them as a list', () => {
        // Given a multiselect field next to another question
        const industries: DynamicFormField = {key: 'industries', label: 'Industries', type: 'multiselect', required: true, values: [{key: 'RETAIL', label: 'Retail'}]};

        // When it renders
        const rendered = renderFields([industries, otherQuestion]);

        // Then the dropdown row allows several choices, and the answer is a list of option keys
        expect(rendered.get('industries')).toMatchObject({InputComponent: MultiChoiceDropdownAdapter, valueType: 'stringList', items: [{value: 'RETAIL', label: 'Retail'}]});
    });

    it('keeps the label above an input readable in session recordings while masking the input', () => {
        // Given a file field, which names the field above its upload button
        const proofOfFunds: DynamicFormField = {key: 'proofOfFunds', label: 'Source of funds document', type: 'file', required: true};

        // When it renders
        renderFields([proofOfFunds]);

        // Then reviewers can still see which field it is, while the upload itself stays masked
        expect(isMasked(screen.getByText('Source of funds document'))).toBe(false);
        expect(isMasked(screen.UNSAFE_getByProps({inputID: 'proofOfFunds'}))).toBe(true);
    });

    it('takes one file unless the schema allows more, and names the field above the upload button', () => {
        // Given a file field with no file limit, alone in the list like the source of funds page, and one allowing three files
        const proofOfFunds: DynamicFormField = {key: 'proofOfFunds', label: 'Source of funds document', type: 'file', required: true};
        const idDocument: DynamicFormField = {key: 'idDocument', type: 'file', required: true, maxFiles: 3};

        // When each renders
        const rendered = renderFields([proofOfFunds]);
        const isLabelShown = screen.queryByText('Source of funds document') !== null;
        const severalFiles = renderFields([idDocument]);

        // Then the first takes a single file and the second up to its limit, and the label stays visible as a heading
        expect(rendered.get('proofOfFunds')).toMatchObject({
            valueType: 'files',
            fileLimit: 1,
            buttonText: 'common.chooseFile',
            accessibilityLabel: 'common.chooseFile, Source of funds document',
        });
        expect(severalFiles.get('idDocument')).toMatchObject({fileLimit: 3, buttonText: 'common.chooseFiles'});
        expect(isLabelShown).toBe(true);
    });

    it('limits a file to its own size, falling back to the screen limit, and to none when neither is set', () => {
        // Given a case file allowing 15 MB, a document setting no limit, and a screen limit of 10 MB
        const caseFile: DynamicFormField = {key: 'caseFile', type: 'file', required: true, maxFileSize: 15728640};
        const idDocument: DynamicFormField = {key: 'idDocument', type: 'file', required: true};
        const screenLimit = 10485760;

        // When they render with the screen limit, and the document renders without one
        const withScreenLimit = renderFields([caseFile, idDocument], {}, {maxFileSize: screenLimit});
        const withoutScreenLimit = renderFields([idDocument]);

        // Then the schema limit wins, the screen limit covers fields without one, and with neither the uploader takes any size
        expect(withScreenLimit.get('caseFile')?.maxFileSize).toBe(15728640);
        expect(withScreenLimit.get('idDocument')?.maxFileSize).toBe(screenLimit);
        expect(withoutScreenLimit.get('idDocument')?.maxFileSize).toBeUndefined();
    });

    it('prices an amount in the currency the user picked, falling back to the screen currency', () => {
        // Given an amount whose currency the user picks under another key
        const expectedVolume: DynamicFormField = {key: 'expectedVolume', type: 'amount', required: true, currencyKey: 'expectedVolumeCurrency'};

        // When it renders before and after a currency is picked
        const beforePick = renderFields([expectedVolume], {}, {currency: CONST.CURRENCY.GBP});
        const afterPick = renderFields([expectedVolume], {expectedVolumeCurrency: CONST.CURRENCY.EUR}, {currency: CONST.CURRENCY.GBP});

        // Then the currency picker starts on the screen currency, so the form submits a currency even if the user never opens it, and the amount follows the pick
        expect(beforePick.get('expectedVolumeCurrency')).toMatchObject({InputComponent: CurrencyDropdownAdapter, defaultValue: CONST.CURRENCY.GBP});
        expect(beforePick.get('expectedVolume')).toMatchObject({InputComponent: AmountForm, currency: CONST.CURRENCY.GBP});
        expect(afterPick.get('expectedVolume')?.currency).toBe(CONST.CURRENCY.EUR);
    });

    it('masks an amount in session recordings', () => {
        // Given an amount, whose AmountForm input takes no FullStory class
        const expectedVolume: DynamicFormField = {key: 'expectedVolume', type: 'amount', required: true};

        // When it renders
        renderFields([expectedVolume, otherQuestion]);

        // Then a masked view wraps the amount input, so the typed amount stays out of session recordings
        expect(screen.UNSAFE_getByProps({inputID: 'expectedVolume'}).parent?.props.fsClass).toBe(CONST.FULLSTORY.CLASS.MASK);
    });

    it('draws the full address form with a country picker', () => {
        // Given an address field
        const homeAddress: DynamicFormField = {key: 'homeAddress', label: 'Home address', type: 'address', required: true};

        // When it renders
        const rendered = renderFields([homeAddress]);

        // Then the user sees and can correct every part, each stored under the field key, with no extra heading since every part is labeled
        expect([...rendered.keys()]).toEqual(['homeAddress', 'homeAddress.city', 'homeAddress.state', 'homeAddress.zipCode', 'homeAddress.country']);
        expect(screen.queryByText('Home address')).not.toBeOnTheScreen();
    });

    it('draws the state and country of an address as dropdown rows', () => {
        // Given an address field
        const homeAddress: DynamicFormField = {key: 'homeAddress', type: 'address', required: true};
        const addressKeys = getAddressInputKeys(homeAddress.key);

        // When it renders
        const rendered = renderFields([homeAddress]);

        // Then the state and country open like every other choice field of the form, and a new country clears the state, since the old one is not in its list
        expect(rendered.get(addressKeys.state)?.InputComponent).toBe(DropdownChoiceAdapter);
        expect(rendered.get(addressKeys.country)?.InputComponent).toBe(DropdownChoiceAdapter);
        expect(rendered.get(addressKeys.country)?.stateInputIDToReset).toBe(addressKeys.state);
    });

    it('searches the address countries by their code', () => {
        // Given an address field
        const homeAddress: DynamicFormField = {key: 'homeAddress', type: 'address', required: true};
        const addressKeys = getAddressInputKeys(homeAddress.key);

        // When it renders
        const rendered = renderFields([homeAddress]);

        // Then its country list searches by code as well as name, the way the country field next to it does
        expect(rendered.get(addressKeys.country)?.items?.find((item) => item.value === 'GB')?.searchValue).toMatch(/^gb/);
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

    it('caps the height a multiline text field grows to, and leaves a single-line one uncapped', () => {
        // Given a multiline business description next to a single-line name
        const businessDescription: DynamicFormField = {key: 'businessDescription', type: 'text', required: true, multiline: true};
        const name: DynamicFormField = {key: 'name', type: 'text', required: true};

        // When they render
        const rendered = renderFields([businessDescription, name]);

        // Then only the multiline field stops growing at the shared limit, so a long answer scrolls inside its input instead of pushing the page down
        expect(rendered.get('businessDescription')?.maxAutoGrowHeight).toBe(variables.textInputAutoGrowMaxHeight);
        expect(rendered.get('name')?.maxAutoGrowHeight).toBeUndefined();
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

    describe('offline', () => {
        beforeEach(() => {
            mockNetwork.isOffline = true;
        });

        afterEach(() => {
            mockNetwork.isOffline = false;
        });

        const manyOptions = Array.from({length: CONST.DYNAMIC_FORM.LARGE_SELECT_MIN_OPTIONS + 1}, (_, index) => ({key: `option${index}`, label: `Option ${index}`}));
        const refreshingFields: Array<[string, DynamicFormField]> = [
            ['text', {key: 'answer', type: 'text', required: true, refreshOnChange: true}],
            ['number', {key: 'answer', type: 'number', required: true, refreshOnChange: true}],
            ['amount', {key: 'answer', type: 'amount', required: true, refreshOnChange: true}],
            ['date', {key: 'answer', type: 'date', required: true, refreshOnChange: true}],
            ['currency', {key: 'answer', type: 'currency', required: true, refreshOnChange: true}],
            ['country', {key: 'answer', type: 'country', required: true, refreshOnChange: true}],
            ['short select', {key: 'answer', type: 'select', required: true, refreshOnChange: true, values: manyOptions.slice(0, 2)}],
        ];

        it.each(refreshingFields)('locks a %s field that changes the requirements', (_, field) => {
            // Given a field whose change asks the server for new requirements, which would only wait in the queue offline and leave the form stale
            // When it renders offline, next to another question so it is drawn as a row
            const rendered = renderFields([field, otherQuestion]);

            // Then the user cannot change it until they are back online
            expect(rendered.get('answer')?.disabled).toBe(true);
        });

        it('locks a long select that changes the requirements', () => {
            // Given a select with more options than fit in a picker, which opens as a searchable list, and changes the requirements
            const bankType: DynamicFormField = {key: 'bankType', type: 'select', required: true, refreshOnChange: true, values: manyOptions};

            // When it renders offline
            const rendered = renderFields([bankType, otherQuestion]);

            // Then its list cannot be opened, so no refresh is queued
            expect(rendered.get('bankType')?.disabled).toBe(true);
        });

        it('locks only the country of an address that changes the requirements', () => {
            // Given an address whose country changes the requirements
            const homeAddress: DynamicFormField = {key: 'homeAddress', type: 'address', required: true, refreshOnChange: true};

            // When it renders offline
            const rendered = renderFields([homeAddress]);

            // Then the country is locked, while the street and city stay editable since typing them sends nothing to the server
            expect(rendered.get('homeAddress.country')?.disabled).toBe(true);
            expect(rendered.get('homeAddress')?.disabled).toBeFalsy();
            expect(rendered.get('homeAddress.city')?.disabled).toBeFalsy();
        });

        it('keeps a field that does not change the requirements editable', () => {
            // Given a currency and a text field that change nothing on the server
            const nickname: DynamicFormField = {key: 'nickname', type: 'text', required: false};
            const payoutCurrency: DynamicFormField = {key: 'payoutCurrency', type: 'currency', required: true};

            // When they render offline
            const rendered = renderFields([nickname, payoutCurrency]);

            // Then the user can still fill them in, since only Confirm sends the answers
            expect(rendered.get('nickname')?.disabled).toBeFalsy();
            expect(rendered.get('payoutCurrency')?.disabled).toBeFalsy();
        });
    });

    it('keeps a field that changes the requirements editable online', () => {
        // Given a currency that changes the requirements
        const payoutCurrency: DynamicFormField = {key: 'payoutCurrency', type: 'currency', required: true, refreshOnChange: true};

        // When it renders online
        const rendered = renderFields([payoutCurrency, otherQuestion]);

        // Then the user can change it, since the new requirements can be fetched
        expect(rendered.get('payoutCurrency')?.disabled).toBeFalsy();
    });

    it('shows a readonly address as one line', () => {
        // Given a readonly, prefilled address
        const officeAddress: DynamicFormField = {key: 'office', type: 'address', required: true, readonly: true};
        const addressKeys = getAddressInputKeys(officeAddress.key);
        const values = {
            office: '224 Main Street',
            [addressKeys.city]: 'San Francisco',
            [addressKeys.state]: 'CA',
            [addressKeys.zipCode]: '94123',
            [addressKeys.country]: CONST.COUNTRY.US,
        };

        // When it renders
        renderFields([officeAddress], values);

        // Then the row reads like a postal address, ending with the country, since the same street and city can exist in several countries
        expect(screen.getByText('224 Main Street, San Francisco, CA 94123, allCountries.US')).toBeOnTheScreen();
    });

    it('shows readonly multiselect, file and percent answers as text', () => {
        // Given readonly answers to a multiselect, a file field holding two files and a percent
        const industries: DynamicFormField = {
            key: 'industries',
            type: 'multiselect',
            required: true,
            readonly: true,
            values: [
                {key: 'RETAIL', label: 'Retail'},
                {key: 'SERVICES', label: 'Services'},
            ],
        };
        const proofOfFunds: DynamicFormField = {key: 'proofOfFunds', type: 'file', required: true, readonly: true};
        const ownership: DynamicFormField = {key: 'ownership', type: 'percent', required: true, readonly: true};
        const values = {industries: ['RETAIL', 'SERVICES'], proofOfFunds: [{name: 'a.pdf'}, {name: 'b.pdf'}], ownership: '25'} as DynamicFormValues;

        // When they render
        renderFields([industries, proofOfFunds, ownership], values);

        // Then the options read as their labels, the files as a count and the percent with its sign
        expect(screen.getByText('Retail, Services')).toBeOnTheScreen();
        expect(screen.getByText('dynamicForm.fileCount:2')).toBeOnTheScreen();
        expect(screen.getByText('25%')).toBeOnTheScreen();
    });

    it('shows a readonly list as the names of its entries', () => {
        // Given a readonly list of owners holding two entries
        const owners: DynamicFormField = {
            key: 'owners',
            type: 'list',
            required: true,
            readonly: true,
            itemFields: [
                {key: 'firstName', type: 'text', required: true},
                {key: 'lastName', type: 'text', required: true},
            ],
        };
        const values = {
            owners: [
                {id: 'jane', firstName: 'Jane', lastName: 'Doe'},
                {id: 'john', firstName: 'John', lastName: 'Roe'},
            ],
        } as DynamicFormValues;

        // When it renders
        const rendered = renderFields([owners], values);

        // Then no input is drawn, and the row names every owner, since a readonly list cannot be opened to see them
        expect(rendered.size).toBe(0);
        expect(screen.getByText('Jane Doe, John Roe')).toBeOnTheScreen();
    });

    it.each([
        ['select', InlineSelectionListAdapter, {valueType: 'string'}],
        ['multiselect', InlineSelectionListAdapter, {canSelectMultiple: true, valueType: 'stringList'}],
        ['country', InlineSelectionListAdapter, {isSearchable: true}],
        ['countryMultiselect', InlineSelectionListAdapter, {canSelectMultiple: true, valueType: 'stringList', isSearchable: true}],
        ['currency', CurrencyInlineListAdapter, {}],
    ] as const)('draws a %s field alone on its page as the page itself', (type, ExpectedInput, expectedProps) => {
        // Given the only question on a page without its own title, so the page is titled after the question
        const field: DynamicFormField = {key: 'answer', label: 'The question', type, required: true};

        // When it renders
        const rendered = renderFields([field], {}, {isLoneFieldInHeadline: true});

        // Then the choice is drawn as the page itself, keeping its kind of answer, and the label is left to the page title instead of repeating it
        expect(rendered.get('answer')?.InputComponent).toBe(ExpectedInput);
        expect(rendered.get('answer')).toMatchObject(expectedProps);
        expect(screen.queryByText('The question')).not.toBeOnTheScreen();
    });

    it.each(['select', 'multiselect', 'country', 'currency', 'boolean', 'radio', 'list'] as const)('shows the question above a lone %s field on a page with its own title', (type) => {
        // Given the only question on a page whose own title, such as "Ownership", does not ask it
        const field: DynamicFormField =
            type === 'list' ? {key: 'answer', label: 'The question', type, required: true, itemFields: []} : {key: 'answer', label: 'The question', type, required: true};

        // When it renders
        renderFields([field]);

        // Then the question is drawn as a heading above the answers, since nothing else on the page says what they answer
        expect(screen.getByRole(CONST.ROLE.HEADING, {name: 'The question'})).toBeOnTheScreen();
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

    it('draws a choice with the tabs presentation as a tab row under its question', () => {
        // Given a recipient type select presented as tabs, next to another question
        const legalType: DynamicFormField = {
            key: 'legalType',
            label: 'Recipient type',
            type: 'select',
            required: true,
            presentation: 'tabs',
            values: [{key: 'PRIVATE'}, {key: 'BUSINESS'}],
        };

        // When it renders
        const rendered = renderFields([legalType, otherQuestion]);

        // Then it is a tab row, as the schema asked, with the question above it, since the tab titles alone do not say what they answer
        expect(rendered.get('legalType')?.InputComponent).toBe(TabsAdapter);
        expect(screen.getByText('Recipient type')).toBeOnTheScreen();
    });

    it('keeps the tab row for a tabs choice that is the only question on its page', () => {
        // Given a recipient type presented as tabs, followed by a field it reveals, so the tabs are the page's only question
        const legalType: DynamicFormField = {
            key: 'legalType',
            label: 'Recipient type',
            type: 'select',
            required: true,
            presentation: 'tabs',
            values: [{key: 'PRIVATE'}, {key: 'BUSINESS'}],
        };
        const companyName: DynamicFormField = {key: 'companyName', type: 'text', required: true, showWhen: {key: 'legalType', equals: ['BUSINESS']}};

        // When it renders for a business recipient on a page without its own title
        const rendered = renderFields([legalType, companyName], {legalType: 'BUSINESS'}, {isLoneFieldInHeadline: true});

        // Then it is still a tab row rather than an inline list, since the schema asked for tabs, and the question is left to the page title
        expect(rendered.get('legalType')?.InputComponent).toBe(TabsAdapter);
        expect(screen.queryByText('Recipient type')).not.toBeOnTheScreen();
    });

    it('names radio buttons, tabs and a Yes/No question after their question for screen readers', () => {
        // Given a radio question and a tabs question sharing a page, and a Yes/No question alone on its page
        const accountType: DynamicFormField = {key: 'accountType', label: 'Account type', type: 'radio', required: true, values: [{key: 'CHECKING'}]};
        const legalType: DynamicFormField = {key: 'legalType', label: 'Recipient type', type: 'radio', required: true, presentation: 'tabs', values: [{key: 'PRIVATE'}]};
        const hasOtherOwners: DynamicFormField = {key: 'hasOtherOwners', label: 'Does anyone else own 25% or more?', type: 'boolean', required: true};

        // When they render
        const sharedPage = renderFields([accountType, legalType]);
        const lonePage = renderFields([hasOtherOwners]);

        // Then each group is named after its question, since otherwise a screen reader announces "Yes, radio button" without saying what it answers
        expect(sharedPage.get('accountType')?.accessibilityLabel).toBe('Account type');
        expect(sharedPage.get('legalType')?.accessibilityLabel).toBe('Recipient type');
        expect(lonePage.get('hasOtherOwners')?.accessibilityLabel).toBe('Does anyone else own 25% or more?');
    });

    it('asks a boolean as Yes/No wherever it sits, and as a checkbox only when the schema asks for one', () => {
        // Given a question next to another field, the same question alone on its page, and a consent checkbox
        const ownsQuarter: DynamicFormField = {key: 'ownsQuarter', label: 'Do you own 25% or more?', type: 'boolean', required: true};
        const acceptTerms: DynamicFormField = {key: 'acceptTerms', type: 'boolean', required: true, presentation: 'checkbox'};

        // When each renders
        const sharedPage = renderFields([ownsQuarter, otherQuestion]);
        const lonePage = renderFields([ownsQuarter]);
        const consent = renderFields([acceptTerms, otherQuestion]);

        // Then the question offers No as an answer on both pages, since how the fields are grouped into pages must not change what it asks, while the consent is a checkbox to tick
        expect(sharedPage.get('ownsQuarter')?.InputComponent).toBe(YesNoAdapter);
        expect(lonePage.get('ownsQuarter')?.InputComponent).toBe(YesNoAdapter);
        expect(consent.get('acceptTerms')?.InputComponent).toBe(CheckboxWithLabel);
    });

    it('asks a boolean as a link with its own wording for each answer when the schema asks for one', () => {
        // Given an opt-out the user taps, worded differently once tapped so the second tap reads as undoing the first
        const hasNoSSN: DynamicFormField = {
            key: 'hasNoSSN',
            label: "I don't have an SSN",
            toggledLabel: 'I have an SSN',
            type: 'boolean',
            required: false,
            presentation: 'link',
        };

        // When it renders
        const rendered = renderFields([hasNoSSN, otherQuestion]);

        // Then it is a link carrying both wordings, with no label drawn above it, since the link text is the question
        expect(rendered.get('hasNoSSN')).toMatchObject({InputComponent: ToggleLinkAdapter, label: "I don't have an SSN", toggledLabel: 'I have an SSN'});
        expect(screen.queryByText("I don't have an SSN")).not.toBeOnTheScreen();
    });

    it('asks for the state only in countries the state picker covers', () => {
        // Given an address in the UK
        const homeAddress: DynamicFormField = {key: 'homeAddress', type: 'address', required: true};
        const addressKeys = getAddressInputKeys(homeAddress.key);

        // When it renders
        const rendered = renderFields([homeAddress], {[addressKeys.country]: 'GB'});

        // Then there is no state input, since the picker only lists states for the US, Canada, Australia and Brazil
        expect(rendered.has(addressKeys.state)).toBe(false);
    });

    it('lists Australian states for an address in Australia', () => {
        // Given an address whose draft holds a country the state picker has its own list for
        const homeAddress: DynamicFormField = {key: 'homeAddress', type: 'address', required: true};
        const addressKeys = getAddressInputKeys(homeAddress.key);

        // When it renders
        const rendered = renderFields([homeAddress], {[addressKeys.country]: 'AU'});

        // Then the state is asked from the Australian list, not from US states
        expect(rendered.get(addressKeys.state)?.items).toContainEqual(expect.objectContaining({value: 'NSW'}));
    });

    it('lists Canadian provinces for an address restored with Canada as its country', () => {
        // Given an address whose draft holds Canada
        const homeAddress: DynamicFormField = {key: 'homeAddress', type: 'address', required: true};
        const addressKeys = getAddressInputKeys(homeAddress.key);

        // When it renders
        const rendered = renderFields([homeAddress], {[addressKeys.country]: 'CA'});

        // Then the state picker offers provinces such as Ontario, not US states
        expect(rendered.get(addressKeys.state)?.items).toContainEqual(expect.objectContaining({value: 'ON'}));
    });

    it('asks for new requirements once when the user picks the country of a refreshing address', () => {
        // Given an address whose country changes the requirements
        const onRefreshRequirements = jest.fn();
        const homeAddress: DynamicFormField = {key: 'homeAddress', type: 'address', required: true, refreshOnChange: true};
        const addressKeys = getAddressInputKeys(homeAddress.key);
        const rendered = renderFields([homeAddress], {}, {onRefreshRequirements});

        // When the user picks Great Britain, and the picker then clears the state, which reaches the same handler as ''
        act(() => {
            rendered.get(addressKeys.country)?.onValueChange?.('GB', addressKeys.country);
            rendered.get(addressKeys.country)?.onValueChange?.('', addressKeys.state);
        });

        // Then the screen fetches the requirements once for the picked country, never for an empty one
        expect(onRefreshRequirements).toHaveBeenCalledTimes(1);
        expect(onRefreshRequirements).toHaveBeenCalledWith(addressKeys.country, 'GB');
    });

    it('does not ask for new requirements when an address pick keeps the country', () => {
        // Given a refreshing address in Great Britain
        const onRefreshRequirements = jest.fn();
        const homeAddress: DynamicFormField = {key: 'homeAddress', type: 'address', required: true, refreshOnChange: true};
        const addressKeys = getAddressInputKeys(homeAddress.key);
        const rendered = renderFields([homeAddress], {[addressKeys.country]: 'GB'}, {onRefreshRequirements});

        // When the user picks another British address, which reports Great Britain again
        act(() => {
            rendered.get(addressKeys.country)?.onValueChange?.('GB', addressKeys.country);
        });

        // Then nothing is fetched, since the requirements depend on the country and it did not change
        expect(onRefreshRequirements).not.toHaveBeenCalled();
    });

    it.each(['text', 'number', 'amount', 'percent'] as const)('asks a %s field that changes the requirements to refetch them when the user leaves it, not on every keystroke', (type) => {
        // Given a typed field that changes the requirements
        const onRefreshRequirements = jest.fn();
        const bankCode: DynamicFormField = {key: 'bankCode', type, required: true, refreshOnChange: true};
        const rendered = renderFields([bankCode], {bankCode: '0261'}, {onRefreshRequirements});

        // When the user leaves the input
        rendered.get('bankCode')?.onBlur?.();

        // Then the screen fetches the requirements once with the typed answer, and typing alone fetches nothing
        expect(onRefreshRequirements).toHaveBeenCalledWith('bankCode', '0261');
        expect(rendered.get('bankCode')?.onValueChange).toBeUndefined();
    });

    it('announces that the questions changed when an answer shows new ones', () => {
        // Given a business number asked only of businesses, on a page answered as a person
        const content: DynamicFormContentItem[] = [
            {
                key: 'type',
                type: 'select',
                required: true,
                values: [
                    {key: 'PRIVATE', label: 'Person'},
                    {key: 'BUSINESS', label: 'Business'},
                ],
            },
            {key: 'ein', type: 'text', required: true, showWhen: {key: 'type', equals: ['BUSINESS']}},
        ];
        const {rerender} = render(
            <DynamicFormFields
                content={content}
                values={{type: 'PRIVATE'}}
            />,
        );
        const isAnnouncing = () => mockAnnouncement.mock.lastCall?.[1];
        expect(isAnnouncing()).toBe(false);

        // When the answer changes to a business, which shows the business number
        rerender(
            <DynamicFormFields
                content={content}
                values={{type: 'BUSINESS'}}
            />,
        );

        // Then the change is announced, since a screen reader user can't see a question appear
        expect(mockAnnouncement.mock.lastCall).toEqual(['dynamicForm.questionsChanged', true, expect.objectContaining({announcementKey: 1})]);
    });
});
