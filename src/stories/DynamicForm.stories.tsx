import DynamicFormFields from '@components/DynamicForm/DynamicFormFields';
import DynamicFormFlow from '@components/DynamicForm/DynamicFormFlow';
import getDynamicFieldErrors from '@components/DynamicForm/getDynamicFieldErrors';
import getInputComponentForField from '@components/DynamicForm/getInputComponentForField';
import groupFieldsIntoPages from '@components/DynamicForm/groupFieldsIntoPages';
import FormProvider from '@components/Form/FormProvider';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';

import {clearDraftValues, setDraftValues} from '@userActions/FormActions';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import styles from '@src/styles';
import {defaultTheme} from '@src/styles/theme';
import type {DynamicFormField} from '@src/types/onyx';
import type {DynamicFormListItem} from '@src/types/onyx/DynamicFormField';

import type {Meta, StoryFn} from 'storybook-react-rsbuild';

import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {useArgs} from 'storybook/preview-api';

import {StoryRouterProvider} from '../../.storybook/mocks/storyRouter';
import allFieldTypes from '../../tests/fixtures/dynamicForm/allFieldTypes';

const defaultStyles = styles(defaultTheme);

const STORYBOOK_FORM_ID = ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM;

const FLOW_ROUTE_PREFIX = 'settings/wallet/add-bank-account';

type Preset = {
    fields: DynamicFormField[];

    /** Answers seeded into the form draft before the first render */
    draftValues: Record<string, string | boolean | string[] | DynamicFormListItem[]>;
};

const seededBankAccount = {
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
    ownershipPercentage: '40',
};

/** Every case Storybook shows, each usable in the Flow, the Playground and as its own sidebar entry */
const PRESETS = {
    bankAccount: {
        fields: allFieldTypes.filter((field) => field.group !== 'Ownership'),
        draftValues: seededBankAccount,
    },
    allFieldTypes: {
        fields: allFieldTypes,
        draftValues: {legalType: 'BUSINESS', accountType: 'BUSINESS_CHECKING', useCases: ['PAYING_SUPPLIERS_CONTRACTORS_EMPLOYEES']},
    },
    singleQuestion: {
        fields: allFieldTypes.filter((field) => field.key === 'useCases'),
        draftValues: {},
    },
    yesNoQuestion: {
        fields: allFieldTypes.filter((field) => field.key === 'isSourceOfFund').map((field) => ({...field, required: true})),
        draftValues: {},
    },
    amountWithCurrency: {
        fields: allFieldTypes.filter((field) => field.key === 'annualVolume' || field.key === 'accountNumber'),
        draftValues: {annualVolume: '25000', annualVolumeCurrency: 'EUR'},
    },
    hiddenFileField: {
        fields: allFieldTypes,
        draftValues: {legalType: 'PRIVATE'},
    },
    largeSelect: {
        fields: [
            {
                key: 'industry',
                label: 'Industry',
                group: 'Business info',
                type: 'select',
                required: true,
                values: ['Agriculture', 'Construction', 'Education', 'Finance', 'Healthcare', 'Hospitality', 'Manufacturing', 'Retail', 'Technology'].map((name) => ({
                    key: name.toUpperCase(),
                    label: name,
                })),
                refreshOnChange: false,
            },
            {
                key: 'businessDescription',
                label: 'Business description',
                group: 'Business info',
                type: 'text',
                required: true,
                multiline: true,
                maxLength: 500,
                refreshOnChange: false,
            },
        ],
        draftValues: {industry: 'TECHNOLOGY'},
    },
    sections: {
        fields: [
            {key: 'legalFirstName', label: 'Legal first name', group: 'Personal details', section: 'Basic details', type: 'text', required: true, refreshOnChange: false},
            {key: 'legalLastName', label: 'Legal last name', group: 'Personal details', section: 'Basic details', type: 'text', required: true, refreshOnChange: false},
            {key: 'dateOfBirth', label: 'Date of birth', group: 'Personal details', section: 'Basic details', type: 'date', required: true, rule: 'dateOfBirth', refreshOnChange: false},
            {key: 'phoneNumber', label: 'Phone number', group: 'Personal details', section: 'Contact', type: 'text', keyboard: 'tel', required: false, refreshOnChange: false},
            {key: 'homeAddress', label: 'Address', group: 'Personal details', section: 'Address', type: 'address', required: true, rule: 'zipCode', refreshOnChange: false},
        ],
        draftValues: {legalFirstName: 'Ali', legalLastName: 'Rahman'},
    },
    owners: {
        fields: allFieldTypes.filter((field) => field.key === 'legalEntityShareholders'),
        draftValues: {
            legalEntityShareholders: [
                {id: '1', name: 'Alice Nguyen', country: 'GB', ownershipPercentage: '25'},
                {id: '2', name: 'Marcus Webb', country: 'US', ownershipPercentage: '25'},
            ],
        },
    },
    ownersWithTabs: {
        fields: [
            {
                key: 'owners',
                label: 'Owners',
                itemLabel: 'owner',
                addItemDescription: 'Only applies if 25% ownership or more',
                group: 'Owners',
                type: 'list',
                required: true,
                minItems: 1,
                refreshOnChange: false,
                itemFields: [
                    {
                        key: 'ownerType',
                        label: 'Owner type',
                        group: 'Owner',
                        type: 'radio',
                        presentation: 'tabs',
                        required: true,
                        values: [
                            {key: 'INDIVIDUAL', label: 'Individual'},
                            {key: 'COMPANY', label: 'Company/Fund'},
                        ],
                        refreshOnChange: false,
                    },
                    {
                        key: 'firstName',
                        label: 'Legal first name',
                        group: 'Owner',
                        type: 'text',
                        required: true,
                        rule: 'legalName',
                        showWhen: {key: 'ownerType', equals: ['INDIVIDUAL']},
                        refreshOnChange: false,
                    },
                    {
                        key: 'lastName',
                        label: 'Legal last name',
                        group: 'Owner',
                        type: 'text',
                        required: true,
                        rule: 'legalName',
                        showWhen: {key: 'ownerType', equals: ['INDIVIDUAL']},
                        refreshOnChange: false,
                    },
                    {
                        key: 'dateOfBirth',
                        label: 'Date of birth',
                        group: 'Owner',
                        type: 'date',
                        required: true,
                        rule: 'dateOfBirth',
                        showWhen: {key: 'ownerType', equals: ['INDIVIDUAL']},
                        refreshOnChange: false,
                    },
                    {key: 'legalName', label: 'Legal business name', group: 'Owner', type: 'text', required: true, showWhen: {key: 'ownerType', equals: ['COMPANY']}, refreshOnChange: false},
                    {key: 'countryOfResidence', label: 'Country of residence', group: 'Owner', type: 'country', required: true, refreshOnChange: false},
                    {key: 'ownershipPercentage', label: 'Ownership percentage', group: 'Owner', type: 'percent', required: true, refreshOnChange: false},
                ],
            },
        ],
        draftValues: {
            owners: [{id: '1', ownerType: 'INDIVIDUAL', firstName: 'Alice', lastName: 'Nguyen', dateOfBirth: '1990-05-19', countryOfResidence: 'US', ownershipPercentage: '25'}],
        },
    },
    loneCountry: {
        fields: allFieldTypes.filter((field) => field.key === 'country'),
        draftValues: {country: 'GB'},
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

/** Every group on one screen, for screenshots of the renderer rather than the flow */
function SinglePage({fields, draftValues}: Preset) {
    const {translate} = useLocalize();
    const isDraftReady = useSeededDraft(draftValues);
    const pages = groupFieldsIntoPages(fields);

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
                pages.map((page) => (
                    <View key={page.name}>
                        <Text style={[defaultStyles.textHeadlineLineHeightXXL, defaultStyles.mt5, defaultStyles.mb3]}>{page.name}</Text>
                        <DynamicFormFields
                            fields={page.fields}
                            values={inputValues}
                            currency="USD"
                        />
                    </View>
                ))
            }
        </FormProvider>
    );
}

type FlowProps = Preset & {
    layout: 'auto' | 'stepper' | 'pages';
    confirmation: 'auto' | 'yes' | 'no';

    /** Remounts the route stack when it changes, so a new schema starts from its first page */
    resetKey: string;
};

/** The whole flow on a story-owned route stack: pages, resume, the item editor page and the confirmation are all clickable */
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
                testID="DynamicFormFlowStory"
                buildRoute={(pageName, action) => ROUTES.SETTINGS_ADD_BANK_ACCOUNT.getRoute(undefined, pageName, action)}
                onSubmit={(values) => alert(JSON.stringify(values, null, 4))}
                onBack={() => alert('Left the flow')}
                confirmationTitle="Let’s double check that everything looks right"
                layout={layout}
                hasConfirmation={hasConfirmation}
            />
        </StoryRouterProvider>
    );
}

type FlowStoryProps = Omit<FlowProps, keyof Preset | 'resetKey'> & {
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

const story: Meta<FlowStoryProps> = {
    title: 'Components/DynamicForm',
    component: FlowFromPreset,
};

type PlaygroundProps = Preset & {
    /** Loads a starting schema and draft into the editable `fields` and `draftValues` controls */
    preset: PresetName;

    /** The real flow, or every group on one screen */
    layout: 'flow' | 'single';
};

function flattenSchema(fields: DynamicFormField[]): DynamicFormField[] {
    return fields.flatMap((field) => [field, ...flattenSchema(field.itemFields ?? [])]);
}

/** Editable schema: pick a preset, then change the field JSON in the Controls panel and watch the form follow */
function Playground({preset, fields, draftValues, layout}: PlaygroundProps) {
    const {translate} = useLocalize();
    const [, updateArgs] = useArgs();
    useEffect(() => {
        updateArgs(PRESETS[preset]);
    }, [preset, updateArgs]);

    const schema = Array.isArray(fields) ? fields : [];
    const problems = flattenSchema(schema).flatMap((field, index) => {
        const name = field.key ?? `field ${index + 1}`;
        if (!field.key || !field.group) {
            return [`${name}: every field needs a key and a group`];
        }
        try {
            getInputComponentForField(field, {values: {}, translate, renderFields: () => null, isAloneOnPage: false});
            return [];
        } catch {
            return [`${name}: unknown type '${String(field.type)}'`];
        }
    });

    if (problems.length > 0) {
        return (
            <View style={defaultStyles.p5}>
                <Text style={defaultStyles.textHeadlineLineHeightXXL}>Schema problems</Text>
                {problems.map((problem) => (
                    <Text
                        key={problem}
                        style={[defaultStyles.textDanger, defaultStyles.mt2]}
                    >
                        {problem}
                    </Text>
                ))}
            </View>
        );
    }

    const resetKey = `${preset}-${JSON.stringify(draftValues)}-${schema.length}`;
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

const FlowStory = presetFlowStory('bankAccount');
FlowStory.storyName = 'Flow';

const PlaygroundStory: StoryFn<PlaygroundProps> = Playground.bind({});
PlaygroundStory.storyName = 'Playground';
PlaygroundStory.args = {
    preset: 'bankAccount',
    ...PRESETS.bankAccount,
    layout: 'flow',
};
PlaygroundStory.argTypes = {
    preset: {options: PRESET_NAMES, control: {type: 'select'}},
    fields: {control: {type: 'object'}},
    draftValues: {control: {type: 'object'}},
    layout: {options: ['flow', 'single'], control: {type: 'radio'}},
};

const AllFieldTypes: StoryFn<Preset> = SinglePage.bind({});
AllFieldTypes.args = PRESETS.allFieldTypes;

const HiddenFileField: StoryFn<Preset> = SinglePage.bind({});
HiddenFileField.args = PRESETS.hiddenFileField;

const SingleQuestion = presetFlowStory('singleQuestion');
const YesNoQuestion = presetFlowStory('yesNoQuestion');
const AmountWithCurrency = presetFlowStory('amountWithCurrency');
const LargeSelect = presetFlowStory('largeSelect');
const LoneCountry = presetFlowStory('loneCountry');
const Sections = presetFlowStory('sections');
const OwnersList = presetFlowStory('owners');
const OwnersWithTabs = presetFlowStory('ownersWithTabs');

export default story;
export {FlowStory, PlaygroundStory, AllFieldTypes, HiddenFileField, SingleQuestion, YesNoQuestion, AmountWithCurrency, LargeSelect, LoneCountry, Sections, OwnersList, OwnersWithTabs};
