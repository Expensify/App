/** Collects all nine required AU business activity declarations on one form. */
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import type {CheckboxWithLabelProps} from '@components/CheckboxWithLabel';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubPageProps} from '@hooks/useSubPage/types';
import useThemeStyles from '@hooks/useThemeStyles';

import {BUSINESS_ACTIVITY_FIELDS} from '@pages/ReimbursementAccount/NonUSD/utils/getBusinessActivityAnswers';

import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

type BusinessActivityCheckboxProps = Omit<CheckboxWithLabelProps, 'value' | 'defaultValue' | 'onInputChange'> & {
    label: string;

    /** String answers are shared with the onboarding draft and confirmation steps. */
    value?: string;
    defaultValue?: string;
    onInputChange?: (value: string) => void;
};

function BusinessActivityCheckbox({value, defaultValue = 'false', onInputChange, ...props}: BusinessActivityCheckboxProps) {
    return (
        <CheckboxWithLabel
            {...props}
            value={(value ?? defaultValue) === 'true'}
            onInputChange={(isChecked) => onInputChange?.(String(!!isChecked))}
        />
    );
}

function BusinessActivities({onNext, isEditing}: SubPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);

    const submit = useReimbursementAccountStepFormSubmit({
        fieldIds: BUSINESS_ACTIVITY_FIELDS.map(({inputID}) => inputID),
        onNext,
        // Untouched checkboxes still need explicit false answers in the final Corpay payload.
        shouldSaveDraft: true,
    });

    const saveActivities = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>) => {
        const activityValues = {...values};
        for (const {inputID} of BUSINESS_ACTIVITY_FIELDS) {
            activityValues[inputID] = String(values[inputID]) === 'true' ? 'true' : 'false';
        }
        submit(activityValues);
    };

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.continue')}
            onSubmit={saveActivities}
            style={[styles.mh5, styles.flexGrow1]}
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.mb3]}>{translate('businessInfoStep.businessActivities')}</Text>
            <Text style={[styles.textSupporting, styles.mb5]}>{translate('businessInfoStep.selectBusinessActivities')}</Text>
            {BUSINESS_ACTIVITY_FIELDS.map(({inputID, label}) => (
                <InputWrapper
                    key={inputID}
                    InputComponent={BusinessActivityCheckbox}
                    inputID={inputID}
                    label={translate(label)}
                    defaultValue={String(reimbursementAccountDraft?.[inputID] ?? reimbursementAccount?.achData?.corpay?.[inputID] ?? false)}
                    style={styles.mb5}
                    shouldSaveDraft={!isEditing}
                />
            ))}
        </FormProvider>
    );
}

export default BusinessActivities;
