import DynamicFormFields from '@components/DynamicForm/DynamicFormFields';
import getDynamicFieldErrors from '@components/DynamicForm/getDynamicFieldErrors';
import FormProvider from '@components/Form/FormProvider';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';

import {clearDraftValues, setDraftValues} from '@userActions/FormActions';

import ONYXKEYS from '@src/ONYXKEYS';
import styles from '@src/styles';
import {defaultTheme} from '@src/styles/theme';
import type {WiseField} from '@src/types/onyx';

import type {Meta, StoryFn} from 'storybook-react-rsbuild';

import React from 'react';
import {View} from 'react-native';

import allFieldTypes from '../../tests/fixtures/wise/allFieldTypes';

const defaultStyles = styles(defaultTheme);

const STORYBOOK_FORM_ID = ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM;

type DynamicFormStoryProps = {
    fields: WiseField[];

    /** Answers seeded into the form draft before the first render */
    draftValues: Record<string, string | boolean | string[]>;
};

type DynamicFormStory = StoryFn<DynamicFormStoryProps>;

function Template({fields, draftValues}: DynamicFormStoryProps) {
    const {translate} = useLocalize();
    clearDraftValues(STORYBOOK_FORM_ID);
    setDraftValues(STORYBOOK_FORM_ID, draftValues);
    const groups = [...new Set(fields.map((field) => field.group))];

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
                    <View key={group}>
                        <Text style={[defaultStyles.textHeadlineH2, defaultStyles.mt5, defaultStyles.mb2]}>{group}</Text>
                        <DynamicFormFields
                            fields={fields.filter((field) => field.group === group)}
                            values={inputValues}
                            currency="USD"
                        />
                    </View>
                ))
            }
        </FormProvider>
    );
}

const story: Meta<DynamicFormStoryProps> = {
    title: 'Components/DynamicForm',
    component: Template,
};

const AllFieldTypes: DynamicFormStory = Template.bind({});
AllFieldTypes.args = {
    fields: allFieldTypes,
    draftValues: {legalType: 'BUSINESS', accountType: 'BUSINESS_CHECKING', useCases: ['PAYING_SUPPLIERS_CONTRACTORS_EMPLOYEES']},
};

const HiddenFileField: DynamicFormStory = Template.bind({});
HiddenFileField.args = {
    fields: allFieldTypes,
    draftValues: {legalType: 'PRIVATE'},
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
};

export default story;
export {AllFieldTypes, HiddenFileField, LargeSelect};
