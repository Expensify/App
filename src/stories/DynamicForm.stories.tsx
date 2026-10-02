import DynamicFormFlow, {DynamicFormFields, getDynamicFieldErrors} from '@components/DynamicForm';
import type {DynamicFormLayout} from '@components/DynamicForm/types';
import groupFieldsIntoPages, {getGroupTitle} from '@components/DynamicForm/utils/groupFieldsIntoPages';
import isSupportedField from '@components/DynamicForm/utils/isSupportedField';
import FormProvider from '@components/Form/FormProvider';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';

import {clearDraftValues, setDraftValues} from '@userActions/FormActions';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import styles from '@src/styles';
import {defaultTheme} from '@src/styles/theme';
import type {DynamicFormField, DynamicFormListItem, DynamicFormSchemaField} from '@src/types/onyx';

import type {Meta, StoryFn} from 'storybook-react-rsbuild';

import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {useArgs} from 'storybook/preview-api';

import {StoryRouterProvider} from '../../.storybook/mocks/storyRouter';

const defaultStyles = styles(defaultTheme);

const STORYBOOK_FORM_ID = ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM;

const FLOW_ROUTE_PREFIX = 'settings/wallet/add-bank-account';

type Preset = {
    fields: DynamicFormSchemaField[];

    /** Answers seeded into the form draft before the first render */
    draftValues: Record<string, string | boolean | string[] | DynamicFormListItem[]>;
};

/** The old story's fixture without its Ownership page, in the current format, so the Flow story compares the same form */
const originalBankAccountFields: DynamicFormField[] = [
    {
        key: 'accountNumber',
        label: 'Account number',
        labelKey: 'bankAccount.accountNumber',
        group: 'Account details',
        type: 'text',
        required: true,
        regex: '^\\d{8}$',
        minLength: 8,
        maxLength: 8,
        example: '12345678',
    },
    {
        key: 'legalType',
        label: 'Recipient type',
        group: 'Account details',
        type: 'radio',
        required: true,
        values: [
            {key: 'PRIVATE', label: 'Person'},
            {key: 'BUSINESS', label: 'Business'},
        ],
        refreshRequirementsOnChange: true,
    },
    {
        key: 'accountType',
        label: 'Account type',
        group: 'Account details',
        type: 'select',
        required: true,
        dependsOn: {
            key: 'legalType',
            valuesBy: {
                PRIVATE: [
                    {key: 'CHECKING', label: 'Checking'},
                    {key: 'SAVINGS', label: 'Savings'},
                ],
                BUSINESS: [
                    {key: 'CHECKING', label: 'Checking'},
                    {key: 'SAVINGS', label: 'Savings'},
                    {key: 'BUSINESS_CHECKING', label: 'Business checking'},
                ],
            },
        },
    },
    {
        key: 'businessRegistrationDocument',
        label: 'Business registration document',
        group: 'Account details',
        type: 'file',
        required: true,
        maxFiles: 2,
        showWhen: {key: 'legalType', equals: ['BUSINESS']},
    },
    {key: 'annualVolume', label: 'Annual volume', group: 'Account details', type: 'amount', required: true, currencyKey: 'annualVolumeCurrency'},
    {key: 'numberOfEmployees', label: 'Number of employees', group: 'Account details', type: 'number', required: true, example: '25'},
    {key: 'settlementCurrency', label: 'Settlement currency', group: 'Account details', type: 'currency', required: true},
    {key: 'operatingCountries', label: 'Countries you operate in', group: 'Account holder details', type: 'countryMultiselect', required: true},
    {key: 'dateOfBirth', label: 'Date of birth', labelKey: 'common.dob', group: 'Account holder details', type: 'date', rule: 'dateOfBirth', required: true},
    {key: 'country', label: 'Country', labelKey: 'common.country', group: 'Account holder details', type: 'country', required: true, refreshRequirementsOnChange: true},
    {key: 'address', label: 'Address', labelKey: 'common.address', group: 'Account holder details', type: 'address', required: true},
    {
        key: 'useCases',
        label: 'How will you use this account?',
        group: 'Account holder details',
        type: 'multiselect',
        required: true,
        values: [
            {key: 'PAYING_SUPPLIERS_CONTRACTORS_EMPLOYEES', label: 'Paying suppliers, contractors or employees'},
            {key: 'RECEIVING_MONEY_FOR_SERVICES', label: 'Receiving money for services'},
            {key: 'TRANSFER_WITHIN_COMPANY_OR_GROUP', label: 'Transfers within the company or group'},
        ],
    },
    {key: 'isSourceOfFund', label: 'This source funds the account', group: 'Account holder details', type: 'boolean', required: false},
];

const accountDetails: DynamicFormField[] = [
    {key: 'accountNumber', label: 'Account number', group: 'Account details', type: 'text', required: true, regex: '^\\d{8}$', minLength: 8, maxLength: 8, example: '12345678'},
    {
        key: 'legalType',
        label: 'Recipient type',
        group: 'Account details',
        type: 'radio',
        required: true,
        presentation: 'tabs',
        values: [
            {key: 'PRIVATE', label: 'Person'},
            {key: 'BUSINESS', label: 'Business'},
        ],
    },
    {
        key: 'accountType',
        label: 'Account type',
        group: 'Account details',
        type: 'select',
        required: true,
        dependsOn: {
            key: 'legalType',
            valuesBy: {
                PRIVATE: [
                    {key: 'CHECKING', label: 'Checking'},
                    {key: 'SAVINGS', label: 'Savings'},
                ],
                BUSINESS: [
                    {key: 'CHECKING', label: 'Checking'},
                    {key: 'BUSINESS_CHECKING', label: 'Business checking'},
                ],
            },
        },
    },
    {
        key: 'registrationDocument',
        label: 'Business registration document',
        group: 'Account details',
        type: 'file',
        required: true,
        maxFiles: 2,
        showWhen: {key: 'legalType', equals: ['BUSINESS']},
    },
    {key: 'annualVolume', label: 'Annual volume', group: 'Account details', type: 'amount', required: true, currencyKey: 'annualVolumeCurrency'},
    {key: 'numberOfEmployees', label: 'Number of employees', group: 'Account details', type: 'number', required: true, example: '25'},
    {key: 'settlementCurrency', label: 'Settlement currency', group: 'Account details', type: 'currency', required: true},
];

const accountHolder: DynamicFormField[] = [
    {key: 'legalName', label: 'Legal name', group: 'Account holder', type: 'text', required: true, rule: 'legalName'},
    {key: 'phone', label: 'Phone number', group: 'Account holder', type: 'text', required: true, rule: 'phone'},
    {key: 'dateOfBirth', label: 'Date of birth', group: 'Account holder', type: 'date', required: true, rule: 'dateOfBirth'},
    {
        key: 'ssn',
        label: 'Social security number or ITIN',
        group: 'Account holder',
        type: 'text',
        required: true,
        sensitive: true,
        keyboard: 'numeric',
        regex: '^\\d{9}$',
        example: '123456789',
    },
    {key: 'address', label: 'Address', group: 'Account holder', type: 'address', required: true, rule: 'zipCode'},
    {key: 'operatingCountries', label: 'Countries you operate in', group: 'Account holder', type: 'countryMultiselect', required: true},
    {key: 'ownershipPercentage', label: 'Your ownership percentage', group: 'Account holder', type: 'percent', required: true},
    {key: 'acceptTerms', label: 'I confirm the details above are correct', group: 'Account holder', type: 'boolean', required: true},
];

const businessInfo: DynamicFormField[] = [
    {key: 'legalBusinessName', label: 'Legal business name', group: 'Business info', type: 'text', required: true, readonly: true},
    {
        key: 'companyRole',
        label: 'Your role at the company',
        group: 'Business info',
        type: 'select',
        required: true,
        values: [
            {key: 'OWNER', label: 'Owner'},
            {key: 'DIRECTOR', label: 'Director'},
            {key: 'OTHER', label: 'Other'},
        ],
    },
    {
        key: 'industries',
        label: 'Industry category',
        group: 'Business info',
        type: 'multiselect',
        required: true,
        values: [
            {key: 'SOFTWARE', label: 'Software'},
            {key: 'RETAIL', label: 'Retail'},
            {key: 'CRYPTO', label: 'Crypto (high risk)'},
            {key: 'GAMBLING', label: 'Gambling (high risk)'},
        ],
    },
    {key: 'businessDescription', label: 'Business description', group: 'Business info', type: 'text', required: true, multiline: true, maxLength: 500},
];

/** The design doc's enhanced due diligence: a source of funds asked only for high-risk industries, then a proof for it, each on its own page */
const dueDiligence: DynamicFormField[] = [
    {
        key: 'sourceOfFunds',
        label: 'Source of funds',
        group: 'Source of funds',
        type: 'select',
        required: true,
        showWhen: {key: 'industries', equals: ['CRYPTO', 'GAMBLING']},
        values: [
            {key: 'SALES', label: 'Sales revenue'},
            {key: 'INVESTMENT', label: 'Investment'},
            {key: 'LOAN', label: 'Loan'},
        ],
    },
    {key: 'sourceOfFundsProof', label: 'Source of funds document', group: 'Proof', type: 'file', required: true, showWhen: {key: 'sourceOfFunds', equals: ['SALES', 'INVESTMENT', 'LOAN']}},
];

const owners: DynamicFormField = {
    key: 'owners',
    label: 'Owners',
    itemLabel: 'owner',
    addItemDescription: 'Only applies if 25% ownership or more',
    group: 'Owners',
    type: 'list',
    required: true,
    minItems: 1,
    maxItems: 4,
    itemFields: [
        {
            key: 'ownerType',
            label: 'Owner type',
            type: 'radio',
            presentation: 'tabs',
            required: true,
            values: [
                {key: 'INDIVIDUAL', label: 'Individual'},
                {key: 'COMPANY', label: 'Company/Fund'},
            ],
        },
        {key: 'firstName', label: 'Legal first name', type: 'text', required: true, rule: 'legalName', showWhen: {key: 'ownerType', equals: ['INDIVIDUAL']}},
        {key: 'lastName', label: 'Legal last name', type: 'text', required: true, rule: 'legalName', showWhen: {key: 'ownerType', equals: ['INDIVIDUAL']}},
        {key: 'ssn', label: 'SSN', type: 'text', required: false, sensitive: true, showWhen: {key: 'ownerType', equals: ['INDIVIDUAL']}},
        {key: 'companyName', label: 'Legal business name', type: 'text', required: true, showWhen: {key: 'ownerType', equals: ['COMPANY']}},
        {key: 'countryOfResidence', label: 'Country of residence', type: 'country', required: true},
        {key: 'ownership', label: 'Ownership percentage', type: 'percent', required: true},
    ],
};

/** Every case Storybook shows, each usable in the Flow, the Playground and as its own sidebar entry */
const PRESETS = {
    originalBankAccount: {
        fields: originalBankAccountFields,
        draftValues: {
            numberOfEmployees: '25',
            settlementCurrency: 'USD',
            operatingCountries: ['GB'],
            legalType: 'PRIVATE',
            accountNumber: '12345678',
            accountType: 'CHECKING',
            annualVolume: '1000',
            annualVolumeCurrency: 'USD',
            dateOfBirth: '1990-01-31',
            country: 'GB',
            address: '1 High Street',
        },
    },
    bankAccount: {
        fields: [...accountDetails, ...accountHolder],
        draftValues: {legalType: 'PRIVATE', numberOfEmployees: '25'},
    },
    businessOnboarding: {
        fields: [...businessInfo, ...dueDiligence, owners],
        draftValues: {legalBusinessName: 'Boulder Development Inc.'},
    },
    owners: {
        fields: [owners],
        draftValues: {
            owners: [
                {id: 'alice', answers: {ownerType: 'INDIVIDUAL', firstName: 'Alice', lastName: 'Nguyen', countryOfResidence: 'US', ownership: '25'}},
                {id: 'acme', answers: {ownerType: 'COMPANY', companyName: 'Acme Holdings', countryOfResidence: 'GB', ownership: '40'}},
            ],
        },
    },
    loneMultiselect: {
        fields: businessInfo.filter((field) => field.key === 'industries'),
        draftValues: {},
    },
    yesNoQuestion: {
        fields: [{key: 'hasOtherOwners', label: 'Does anyone else own 25% or more?', group: 'Ownership', type: 'boolean', required: true, presentation: 'yesNo'}],
        draftValues: {},
    },
    loneCheckbox: {
        fields: accountHolder.filter((field) => field.key === 'acceptTerms'),
        draftValues: {},
    },
    loneCountry: {
        fields: [{key: 'country', label: 'Where is your bank account?', group: 'Country', type: 'country', required: true}],
        draftValues: {},
    },
    loneCurrency: {
        fields: [{key: 'currency', label: 'Which currency?', group: 'Currency', type: 'currency', required: true}],
        draftValues: {},
    },
    amountWithCurrency: {
        fields: accountDetails.filter((field) => field.key === 'annualVolume' || field.key === 'accountNumber'),
        draftValues: {annualVolume: '25000'},
    },
    unknownType: {
        fields: [{key: 'signature', label: 'Signature', group: 'Sign', type: 'signature', required: true}, ...accountDetails.slice(0, 1).map((field) => ({...field, group: 'Sign'}))],
        draftValues: {},
    },
} satisfies Record<string, Preset>;

type PresetName = keyof typeof PRESETS;

const PRESET_NAMES = Object.keys(PRESETS).filter((name): name is PresetName => name in PRESETS);

/** Seeds the draft after mount and reports once the write has landed, so the form mounts with the draft as a real page would */
function useSeededDraft(draftValues: Preset['draftValues']): boolean {
    const [isSeeded, setIsSeeded] = useState(false);
    useEffect(() => {
        clearDraftValues(STORYBOOK_FORM_ID);
        setDraftValues(STORYBOOK_FORM_ID, draftValues).then(() => setIsSeeded(true));
    }, [draftValues]);
    return isSeeded;
}

/** Every group on one screen, for looking at the renderer rather than the flow */
function SinglePage({fields, draftValues}: Preset) {
    const {translate} = useLocalize();
    const isDraftReady = useSeededDraft(draftValues);
    // List entries are edited on flow pages, so this screen leaves lists out
    const groups = groupFieldsIntoPages(fields.filter(isSupportedField).filter((field) => field.type !== 'list'));

    if (!isDraftReady) {
        return <View />;
    }

    return (
        <FormProvider
            formID={STORYBOOK_FORM_ID}
            submitButtonText="Submit"
            validate={(values) => getDynamicFieldErrors(fields, values, translate)}
            onSubmit={(values) => alert(JSON.stringify(values, null, 4))}
            style={defaultStyles.ph5}
        >
            {({inputValues}) =>
                groups.map((group) => (
                    <View key={group.slug}>
                        <Text style={[defaultStyles.textHeadlineLineHeightXXL, defaultStyles.mt5, defaultStyles.mb3]}>{getGroupTitle(group, translate)}</Text>
                        <DynamicFormFields
                            fields={group.fields}
                            allFields={fields}
                            values={inputValues}
                        />
                    </View>
                ))
            }
        </FormProvider>
    );
}

type FlowProps = Preset & {
    layout: DynamicFormLayout;
    confirmation: 'auto' | 'yes' | 'no';

    /** Remounts the route stack when it changes, so a new schema starts from its first page */
    resetKey: string;
};

/** The whole flow on a story-owned route stack: pages, resume, the entry editor pages and the confirmation are all clickable */
function Flow({fields, draftValues, layout, confirmation, resetKey}: FlowProps) {
    const isDraftReady = useSeededDraft(draftValues);
    if (!isDraftReady) {
        return <View />;
    }
    let hasConfirmation: boolean | undefined;
    if (confirmation !== 'auto') {
        hasConfirmation = confirmation === 'yes';
    }
    return (
        <StoryRouterProvider
            key={resetKey}
            routePrefix={FLOW_ROUTE_PREFIX}
        >
            <DynamicFormFlow
                fields={fields}
                formID={STORYBOOK_FORM_ID}
                headerTitle="Add bank account"
                confirmationTitle="Let’s double check that everything looks right"
                testID="DynamicFormFlowStory"
                buildRoute={(pageName, action) => ROUTES.SETTINGS_ADD_BANK_ACCOUNT.getRoute(undefined, pageName, action)}
                onSubmit={(values) => alert(JSON.stringify(values, null, 4))}
                onBack={() => alert('Left the flow')}
                onRefreshRequirements={(inputID, value) => console.debug('Refresh requirements', inputID, value)}
                layout={layout}
                hasConfirmation={hasConfirmation}
            />
        </StoryRouterProvider>
    );
}

type FlowStoryProps = Pick<FlowProps, 'layout' | 'confirmation'> & {
    preset: PresetName;
};

function FlowFromPreset({preset, layout, confirmation}: FlowStoryProps) {
    const {fields, draftValues} = PRESETS[preset];
    return (
        <Flow
            resetKey={preset}
            fields={fields}
            draftValues={draftValues}
            layout={layout}
            confirmation={confirmation}
        />
    );
}

const flowArgTypes = {
    preset: {options: PRESET_NAMES, control: {type: 'select'}},
    layout: {options: ['auto', 'stepper', 'pages'], control: {type: 'radio'}},
    confirmation: {options: ['auto', 'yes', 'no'], control: {type: 'radio'}},
} as const;

function presetFlowStory(preset: PresetName): StoryFn<FlowStoryProps> {
    const flowStory: StoryFn<FlowStoryProps> = FlowFromPreset.bind({});
    flowStory.args = {preset, layout: 'auto', confirmation: 'auto'};
    flowStory.argTypes = flowArgTypes;
    return flowStory;
}

const STORY_FRAME_INSET = '2rem';

const story: Meta<FlowStoryProps> = {
    title: 'Components/DynamicForm',
    component: FlowFromPreset,
    decorators: [
        (Story) => (
            // Screens size to their window, so these stories get the viewport as their frame
            <div style={{display: 'flex', flexDirection: 'column', height: `calc(100vh - ${STORY_FRAME_INSET})`}}>
                <Story />
            </div>
        ),
    ],
};

type PlaygroundProps = Preset & {
    /** Loads a starting schema and draft into the editable `fields` and `draftValues` controls */
    preset: PresetName;

    /** The real flow, or every group on one screen */
    layout: 'flow' | 'single';
};

/** Editable schema: pick a preset, then change the field JSON in the Controls panel and watch the form follow */
function Playground({preset, fields, draftValues, layout}: PlaygroundProps) {
    const [, updateArgs] = useArgs();
    useEffect(() => {
        updateArgs(PRESETS[preset]);
    }, [preset, updateArgs]);

    const schema = Array.isArray(fields) ? fields : [];
    const resetKey = `${preset}-${JSON.stringify(draftValues)}-${JSON.stringify(schema)}`;
    if (layout === 'single') {
        return (
            <SinglePage
                key={resetKey}
                fields={schema}
                draftValues={draftValues ?? {}}
            />
        );
    }
    return (
        <Flow
            resetKey={resetKey}
            fields={schema}
            draftValues={draftValues ?? {}}
            layout="auto"
            confirmation="auto"
        />
    );
}

const FlowStory = presetFlowStory('originalBankAccount');
FlowStory.storyName = 'Flow';

const PlaygroundStory: StoryFn<PlaygroundProps> = Playground.bind({});
PlaygroundStory.storyName = 'Playground';
PlaygroundStory.args = {preset: 'originalBankAccount', ...PRESETS.originalBankAccount, layout: 'flow'};
PlaygroundStory.argTypes = {
    preset: {options: PRESET_NAMES, control: {type: 'select'}},
    fields: {control: {type: 'object'}},
    draftValues: {control: {type: 'object'}},
    layout: {options: ['flow', 'single'], control: {type: 'radio'}},
};

const AllFieldTypes: StoryFn<Preset> = SinglePage.bind({});
AllFieldTypes.args = {fields: [...accountDetails, ...accountHolder, ...businessInfo], draftValues: {legalType: 'BUSINESS', legalBusinessName: 'Boulder Development Inc.'}};

const BankAccount = presetFlowStory('bankAccount');
const BusinessOnboarding = presetFlowStory('businessOnboarding');
const OwnersList = presetFlowStory('owners');
const LoneMultiselect = presetFlowStory('loneMultiselect');
const YesNoQuestion = presetFlowStory('yesNoQuestion');
const LoneCheckbox = presetFlowStory('loneCheckbox');
const LoneCountry = presetFlowStory('loneCountry');
const LoneCurrency = presetFlowStory('loneCurrency');
const AmountWithCurrency = presetFlowStory('amountWithCurrency');
const UnknownType = presetFlowStory('unknownType');

export default story;
export {
    FlowStory,
    PlaygroundStory,
    AllFieldTypes,
    BankAccount,
    BusinessOnboarding,
    OwnersList,
    LoneMultiselect,
    YesNoQuestion,
    LoneCheckbox,
    LoneCountry,
    LoneCurrency,
    AmountWithCurrency,
    UnknownType,
};
