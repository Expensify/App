import Button from '@components/Button';
import DynamicFormFields from '@components/DynamicForm/DynamicFormFields';
import getDynamicFieldErrors from '@components/DynamicForm/getDynamicFieldErrors';
import groupFieldsIntoPages from '@components/DynamicForm/groupFieldsIntoPages';
import type {DynamicFormValues} from '@components/DynamicForm/types';
import FormProvider from '@components/Form/FormProvider';
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

type DynamicFormStoryProps = {
    fields: WiseField[];

    /** Answers seeded into the form draft before the first render */
    draftValues: Record<string, string | boolean | string[]>;

    /** One group per page with Next and Back, or every group on one page */
    layout: 'pages' | 'single';
};

type DynamicFormStory = StoryFn<DynamicFormStoryProps>;

type LayoutProps = Omit<DynamicFormStoryProps, 'layout'>;

/** Seeds the draft once per mount, before the form registers its inputs, as a real page would find it */
function useSeededDraft(draftValues: DynamicFormStoryProps['draftValues']) {
    useState(() => {
        clearDraftValues(STORYBOOK_FORM_ID);
        setDraftValues(STORYBOOK_FORM_ID, draftValues);
        return null;
    });
}

function SinglePage({fields, draftValues}: LayoutProps) {
    const {translate} = useLocalize();
    useSeededDraft(draftValues);
    const pages = groupFieldsIntoPages(fields);

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
                        <Text style={[defaultStyles.textHeadlineH2, defaultStyles.mt5, defaultStyles.mb2]}>{page.name}</Text>
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
    useSeededDraft(draftValues);
    const [pageIndex, setPageIndex] = useState(0);
    const [draft] = useOnyx(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM_DRAFT);
    const pages = groupFieldsIntoPages(fields);
    const page = pages.at(pageIndex) ?? pages.at(0);
    const isLastPage = pageIndex >= pages.length - 1;

    if (!page) {
        return null;
    }

    const withDraft = (inputValues: DynamicFormValues): DynamicFormValues => ({...draft, ...inputValues});

    return (
        <View style={defaultStyles.flex1}>
            <View style={[defaultStyles.ph5, defaultStyles.mt5]}>
                <Text style={defaultStyles.textHeadlineH2}>{page.name}</Text>
                <Text style={[defaultStyles.mutedTextLabel, defaultStyles.mb2]}>{`Step ${pageIndex + 1} of ${pages.length}`}</Text>
            </View>
            <FormProvider
                key={page.name}
                formID={STORYBOOK_FORM_ID}
                submitButtonText={isLastPage ? 'Submit' : 'Next'}
                validate={(values) => getDynamicFieldErrors(page.fields, withDraft(values), translate)}
                onSubmit={(values) => {
                    if (isLastPage) {
                        alert(JSON.stringify({...draft, ...values}, null, 4));
                        return;
                    }
                    setPageIndex(pageIndex + 1);
                }}
                style={defaultStyles.ph5}
            >
                {({inputValues}) => (
                    <DynamicFormFields
                        fields={page.fields}
                        values={withDraft(inputValues)}
                        currency="USD"
                    />
                )}
            </FormProvider>
            {pageIndex > 0 && (
                <View style={[defaultStyles.ph5, defaultStyles.mt3]}>
                    <Button onPress={() => setPageIndex(pageIndex - 1)}>
                        <Button.Text>Back</Button.Text>
                    </Button>
                </View>
            )}
        </View>
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
    fields: allFieldTypes,
    draftValues: {legalType: 'PRIVATE', accountNumber: '12345678', accountType: 'CHECKING', annualVolume: '1000'},
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
    ],
    draftValues: {industry: 'TECHNOLOGY'},
    layout: 'single',
};

export default story;
export {AllFieldTypes, HiddenFileField, LargeSelect, PageByPageFlow};
