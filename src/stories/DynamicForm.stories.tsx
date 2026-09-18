import DynamicFormFields from '@components/DynamicForm/DynamicFormFields';
import getDynamicFieldErrors from '@components/DynamicForm/getDynamicFieldErrors';
import groupFieldsIntoPages from '@components/DynamicForm/groupFieldsIntoPages';
import type {DynamicFormValues} from '@components/DynamicForm/types';
import FormProvider from '@components/Form/FormProvider';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {clearDraftValues, setDraftValues} from '@userActions/FormActions';

import ONYXKEYS from '@src/ONYXKEYS';
import styles from '@src/styles';
import {defaultTheme} from '@src/styles/theme';
import type {WiseField} from '@src/types/onyx';

import type {Meta, StoryFn} from 'storybook-react-rsbuild';

import React, {useState} from 'react';
import {View} from 'react-native';

import allFieldTypes from '../../tests/fixtures/wise/allFieldTypes';

const defaultStyles = styles(defaultTheme);

const STORYBOOK_FORM_ID = ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM;

/** Flows shorter than this are single-screen forms and get no step indicator */
const STEP_INDICATOR_MIN_PAGES = 3;

const ACCOUNT_USE_GROUP = 'Account use';

/** The fixture's two groups plus a third, so the paged story is a real multi-step flow */
const threeGroupFields: WiseField[] = allFieldTypes.map((field) => (['useCases', 'isSourceOfFund'].includes(field.key) ? {...field, group: ACCOUNT_USE_GROUP} : field));

type DynamicFormStoryProps = {
    fields: WiseField[];

    /** Answers seeded into the form draft before the first render */
    draftValues: Record<string, string | boolean | string[]>;

    /** One group per step inside InteractiveStepWrapper, or every group on one page for screenshots */
    layout: 'pages' | 'single';
};

type DynamicFormStory = StoryFn<DynamicFormStoryProps>;

type LayoutProps = Omit<DynamicFormStoryProps, 'layout'>;

/** Seeds the draft once per mount and reports when Onyx holds it, so the form mounts with the draft as a real page would */
function useSeededDraft(draftValues: DynamicFormStoryProps['draftValues']): boolean {
    useState(() => {
        clearDraftValues(STORYBOOK_FORM_ID);
        setDraftValues(STORYBOOK_FORM_ID, draftValues);
        return null;
    });
    const [draft] = useOnyx(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM_DRAFT);
    return Object.keys(draftValues).every((key) => draft?.[key] !== undefined);
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

    const withDraft = (inputValues: DynamicFormValues): DynamicFormValues => ({...draft, ...inputValues});

    return (
        <InteractiveStepWrapper
            key={page.name}
            wrapperID="DynamicFormStory"
            headerTitle="Add bank account"
            stepNames={pages.length >= STEP_INDICATOR_MIN_PAGES ? pages.map((item) => item.name) : undefined}
            startStepIndex={pageIndex}
            handleBackButtonPress={() => setPageIndex(Math.max(0, pageIndex - 1))}
        >
            <FormProvider
                formID={STORYBOOK_FORM_ID}
                submitButtonText={isLastPage ? translate('common.confirm') : translate('common.next')}
                validate={(values) => getDynamicFieldErrors(page.fields, withDraft(values), translate)}
                onSubmit={(values) => {
                    if (isLastPage) {
                        alert(JSON.stringify({...draft, ...values}, null, 4));
                        return;
                    }
                    setPageIndex(pageIndex + 1);
                }}
                style={[defaultStyles.mh5, defaultStyles.flexGrow1]}
                submitButtonStyles={defaultStyles.mb0}
            >
                {({inputValues}) => (
                    <>
                        <Text style={[defaultStyles.textHeadlineLineHeightXXL, defaultStyles.mb3]}>{page.name}</Text>
                        <DynamicFormFields
                            fields={page.fields}
                            values={withDraft(inputValues)}
                            currency="USD"
                        />
                    </>
                )}
            </FormProvider>
        </InteractiveStepWrapper>
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

const AllFieldTypes: DynamicFormStory = Template.bind({});
AllFieldTypes.args = {
    fields: allFieldTypes,
    draftValues: {legalType: 'BUSINESS', accountType: 'BUSINESS_CHECKING', useCases: ['PAYING_SUPPLIERS_CONTRACTORS_EMPLOYEES']},
    layout: 'single',
};

const PageByPageFlow: DynamicFormStory = Template.bind({});
PageByPageFlow.args = {
    fields: threeGroupFields,
    draftValues: {legalType: 'PRIVATE', accountNumber: '12345678', accountType: 'CHECKING', annualVolume: '1000', dateOfBirth: '1990-01-31', country: 'GB', address: '1 High Street'},
    layout: 'pages',
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
            maxLength: 500,
            refreshOnChange: false,
        },
    ],
    draftValues: {industry: 'TECHNOLOGY'},
    layout: 'single',
};

export default story;
export {AllFieldTypes, HiddenFileField, LargeSelect, PageByPageFlow, SingleQuestion, YesNoQuestion};
