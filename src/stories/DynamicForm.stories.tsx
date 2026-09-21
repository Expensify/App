import DynamicFormFields from '@components/DynamicForm/DynamicFormFields';
import DynamicFormPage from '@components/DynamicForm/DynamicFormPage';
import DynamicFormShell from '@components/DynamicForm/DynamicFormShell';
import getDynamicFieldErrors from '@components/DynamicForm/getDynamicFieldErrors';
import getInputComponentForField from '@components/DynamicForm/getInputComponentForField';
import groupFieldsIntoPages from '@components/DynamicForm/groupFieldsIntoPages';
import FormProvider from '@components/Form/FormProvider';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {clearDraftValues, setDraftValues} from '@userActions/FormActions';

import ONYXKEYS from '@src/ONYXKEYS';
import styles from '@src/styles';
import {defaultTheme} from '@src/styles/theme';
import type {DynamicFormField} from '@src/types/onyx';
import type {DynamicFormListItem} from '@src/types/onyx/DynamicFormField';

import type {Meta, StoryFn} from 'storybook-react-rsbuild';

import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {useArgs} from 'storybook/preview-api';

import allFieldTypes from '../../tests/fixtures/dynamicForm/allFieldTypes';

const defaultStyles = styles(defaultTheme);

const STORYBOOK_FORM_ID = ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM;

type DynamicFormStoryProps = {
    fields: DynamicFormField[];

    /** Answers seeded into the form draft before the first render */
    draftValues: Record<string, string | boolean | string[] | DynamicFormListItem[]>;

    /** One group per step through DynamicFormShell and DynamicFormPage, or every group on one page for screenshots */
    layout: 'pages' | 'single';
};

type DynamicFormStory = StoryFn<DynamicFormStoryProps>;

type LayoutProps = Omit<DynamicFormStoryProps, 'layout'>;

/** Seeds the draft after mount and reports when Onyx holds exactly it, so the form mounts with the draft as a real page would */
function useSeededDraft(draftValues: DynamicFormStoryProps['draftValues']): boolean {
    const [draft] = useOnyx(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM_DRAFT);
    const [isSeeded, setIsSeeded] = useState(false);
    useEffect(() => {
        clearDraftValues(STORYBOOK_FORM_ID);
        setDraftValues(STORYBOOK_FORM_ID, draftValues).then(() => setIsSeeded(true));
    }, [draftValues]);
    return isSeeded && Object.keys(draftValues).every((key) => JSON.stringify(draft?.[key]) === JSON.stringify(draftValues[key]));
}

function SinglePage({fields, draftValues}: LayoutProps) {
    const {translate} = useLocalize();
    const isDraftReady = useSeededDraft(draftValues);
    const pages = groupFieldsIntoPages(fields);

    if (!isDraftReady) {
        return null;
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

/** The same shell and page the flow uses, driven by local state because Storybook mounts no navigator */
function PageByPage({fields, draftValues}: LayoutProps) {
    const {translate} = useLocalize();
    const isDraftReady = useSeededDraft(draftValues);
    const [pageIndex, setPageIndex] = useState(0);
    const [draft] = useOnyx(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM_DRAFT);
    const pages = groupFieldsIntoPages(fields);
    const page = pages.at(pageIndex) ?? pages.at(0);
    const isLastPage = pageIndex >= pages.length - 1;

    if (!page || !isDraftReady) {
        return null;
    }

    return (
        <DynamicFormShell
            key={page.slug}
            testID="DynamicFormStory"
            headerTitle="Add bank account"
            stepNames={pages.map((item) => item.name)}
            stepIndex={pageIndex}
            onBackButtonPress={() => setPageIndex(Math.max(0, pageIndex - 1))}
        >
            <DynamicFormPage
                page={page}
                formID={STORYBOOK_FORM_ID}
                draft={{...draft}}
                currency="USD"
                submitButtonText={translate(isLastPage ? 'common.confirm' : 'common.next')}
                onSubmit={() => {
                    if (isLastPage) {
                        alert(JSON.stringify(draft, null, 4));
                        return;
                    }
                    setPageIndex(pageIndex + 1);
                }}
            />
        </DynamicFormShell>
    );
}

function Template({layout, ...props}: DynamicFormStoryProps) {
    if (layout === 'pages') {
        return <PageByPage {...props} />;
    }
    return <SinglePage {...props} />;
}

const story: Meta<DynamicFormStoryProps> = {
    title: 'Components/DynamicForm',
    component: Template,
    argTypes: {
        layout: {
            options: ['pages', 'single'],
            control: {type: 'radio'},
        },
    },
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

const PLAYGROUND_PRESETS: Record<PlaygroundPreset, Pick<DynamicFormStoryProps, 'fields' | 'draftValues'>> = {
    bankAccount: {
        fields: allFieldTypes.filter((field) => field.group !== 'Ownership'),
        draftValues: seededBankAccount,
    },
    singleQuestion: {
        fields: allFieldTypes.filter((field) => field.key === 'useCases'),
        draftValues: {},
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
};

type PlaygroundPreset = 'bankAccount' | 'singleQuestion' | 'owners';

type PlaygroundProps = DynamicFormStoryProps & {
    /** Loads a starting schema and draft into the editable `fields` and `draftValues` controls */
    preset: PlaygroundPreset;
};

function flattenSchema(fields: DynamicFormField[]): DynamicFormField[] {
    return fields.flatMap((field) => [field, ...flattenSchema(field.itemFields ?? [])]);
}

/** Editable schema: pick a preset, then change the field JSON in the Controls panel and watch the form follow */
function Playground({preset, fields, draftValues, layout}: PlaygroundProps) {
    const {translate} = useLocalize();
    const [, updateArgs] = useArgs();
    useEffect(() => {
        updateArgs(PLAYGROUND_PRESETS[preset]);
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

    return (
        <Template
            key={`${preset}-${JSON.stringify(draftValues)}-${schema.length}`}
            fields={schema}
            draftValues={draftValues ?? {}}
            layout={layout}
        />
    );
}

const PlaygroundStory: StoryFn<PlaygroundProps> = Playground.bind({});
PlaygroundStory.storyName = 'Playground';
PlaygroundStory.args = {
    preset: 'bankAccount',
    ...PLAYGROUND_PRESETS.bankAccount,
    layout: 'pages',
};
PlaygroundStory.argTypes = {
    preset: {options: ['bankAccount', 'singleQuestion', 'owners'], control: {type: 'select'}},
    fields: {control: {type: 'object'}},
    draftValues: {control: {type: 'object'}},
};

const AllFieldTypes: DynamicFormStory = Template.bind({});
AllFieldTypes.args = {
    fields: allFieldTypes,
    draftValues: {legalType: 'BUSINESS', accountType: 'BUSINESS_CHECKING', useCases: ['PAYING_SUPPLIERS_CONTRACTORS_EMPLOYEES']},
    layout: 'single',
};

const PageByPageFlow: DynamicFormStory = Template.bind({});
PageByPageFlow.args = {
    fields: allFieldTypes,
    draftValues: seededBankAccount,
    layout: 'pages',
};

const OwnersList: DynamicFormStory = Template.bind({});
OwnersList.args = {
    fields: allFieldTypes.filter((field) => field.key === 'legalEntityShareholders'),
    draftValues: {
        legalEntityShareholders: [
            {id: '1', name: 'Alice Nguyen', country: 'GB', ownershipPercentage: '25'},
            {id: '2', name: 'Marcus Webb', country: 'US', ownershipPercentage: '25'},
        ],
    },
    layout: 'pages',
};

const AmountWithCurrency: DynamicFormStory = Template.bind({});
AmountWithCurrency.args = {
    fields: allFieldTypes.filter((field) => field.key === 'annualVolume' || field.key === 'accountNumber'),
    draftValues: {annualVolume: '25000', annualVolumeCurrency: 'EUR'},
    layout: 'single',
};

const SingleQuestion: DynamicFormStory = Template.bind({});
SingleQuestion.args = {
    fields: allFieldTypes.filter((field) => field.key === 'useCases'),
    draftValues: {},
    layout: 'pages',
};

const YesNoQuestion: DynamicFormStory = Template.bind({});
YesNoQuestion.args = {
    fields: allFieldTypes.filter((field) => field.key === 'isSourceOfFund').map((field) => ({...field, required: true})),
    draftValues: {},
    layout: 'pages',
};

const HiddenFileField: DynamicFormStory = Template.bind({});
HiddenFileField.args = {
    fields: allFieldTypes,
    draftValues: {legalType: 'PRIVATE'},
    layout: 'single',
};

const LargeSelect: DynamicFormStory = Template.bind({});
LargeSelect.args = {
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
    layout: 'single',
};

export default story;
export {AllFieldTypes, AmountWithCurrency, HiddenFileField, LargeSelect, OwnersList, PageByPageFlow, PlaygroundStory, SingleQuestion, YesNoQuestion};
