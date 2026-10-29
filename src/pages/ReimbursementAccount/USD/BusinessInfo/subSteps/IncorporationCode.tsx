import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import FormHeader from '@components/Form/Layout/FormHeader';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubPageProps} from '@hooks/useSubPage/types';
import useThemeStyles from '@hooks/useThemeStyles';

import {isValidIndustryCode} from '@libs/ValidationUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

import React from 'react';

import IndustryCodeSelector from './IndustryCode/IndustryCodeSelector';

const COMPANY_INCORPORATION_CODE_KEY = INPUT_IDS.BUSINESS_INFO_STEP.INCORPORATION_CODE;
const STEP_FIELDS = [COMPANY_INCORPORATION_CODE_KEY];

function IncorporationCode({onNext, isEditing}: SubPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: isEditing,
    });

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> = {};

        if (!values[COMPANY_INCORPORATION_CODE_KEY]) {
            errors[COMPANY_INCORPORATION_CODE_KEY] = translate('common.error.fieldRequired');
        } else if (!isValidIndustryCode(values[COMPANY_INCORPORATION_CODE_KEY])) {
            errors[COMPANY_INCORPORATION_CODE_KEY] = translate('bankAccount.error.industryCode');
        }

        return errors;
    };

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            validate={validate}
            onSubmit={handleSubmit}
            style={[styles.mh0, styles.flexGrow1]}
            submitButtonStyles={styles.ph5}
            shouldHideFixErrorsAlert
        >
            <FormHeader
                title={translate('companyStep.industryClassification')}
                style={styles.ph5}
            />
            <InputWrapper
                InputComponent={IndustryCodeSelector}
                inputID={COMPANY_INCORPORATION_CODE_KEY}
                shouldSaveDraft={!isEditing}
                defaultValue={isEditing ? reimbursementAccount?.achData?.industryCode : ''}
            />
        </FormProvider>
    );
}

export default IncorporationCode;
