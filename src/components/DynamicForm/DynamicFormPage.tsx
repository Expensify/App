import FormProvider from '@components/Form/FormProvider';
import type {FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type {OnyxFormKey} from '@src/ONYXKEYS';

import React from 'react';

import type {DynamicFormPage as DynamicFormPageSchema} from './groupFieldsIntoPages';
import type {DynamicFormValues} from './types';

import DynamicFormFields from './DynamicFormFields';
import getDynamicFieldErrors from './getDynamicFieldErrors';

type DynamicFormPageProps = {
    page: DynamicFormPageSchema;
    formID: OnyxFormKey;

    /** Answers from earlier pages, so showWhen, dependsOn and validation see the whole form */
    draft: DynamicFormValues;

    /** Currency for amount fields without a currencyKey */
    currency?: string;

    submitButtonText: string;

    /** Receives the page's answers, including ones never written to the draft */
    onSubmit: (values: DynamicFormValues) => void;
};

/** One group of a dynamic form: the page title, the group's fields and a Next or Confirm button */
function DynamicFormPage({page, formID, draft, currency, submitButtonText, onSubmit}: DynamicFormPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const withDraft = (inputValues: FormOnyxValues<OnyxFormKey>): DynamicFormValues => ({...draft, ...inputValues});

    return (
        <FormProvider
            formID={formID}
            submitButtonText={submitButtonText}
            validate={(values) => getDynamicFieldErrors(page.fields, withDraft(values), translate)}
            onSubmit={(values) => onSubmit({...values})}
            style={[styles.mh5, styles.flexGrow1]}
            submitButtonStyles={styles.mb0}
            keyboardSubmitBehavior={CONST.KEYBOARD_SUBMIT_BEHAVIOR.SUBMIT_ONLY}
            enabledWhenOffline
        >
            {({inputValues}) => (
                <>
                    <Text style={[styles.textHeadlineLineHeightXXL, styles.mb3]}>{page.name}</Text>
                    <DynamicFormFields
                        fields={page.fields}
                        values={withDraft(inputValues)}
                        currency={currency}
                    />
                </>
            )}
        </FormProvider>
    );
}

export default DynamicFormPage;
