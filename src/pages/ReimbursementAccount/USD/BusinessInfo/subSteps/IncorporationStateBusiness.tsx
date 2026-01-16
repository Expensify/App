import React from 'react';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import StateSelector from '@components/StateSelector';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

const COMPANY_INCORPORATION_STATE_KEY = INPUT_IDS.BUSINESS_INFO_STEP.INCORPORATION_STATE;
const STEP_FIELDS = [COMPANY_INCORPORATION_STATE_KEY];

const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> =>
    getFieldRequiredErrors(values, STEP_FIELDS);

function IncorporationStateBusiness({onNext, isEditing}: SubStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [reimbursementAccount, reimbursementAccountResult] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const isLoadingReimbursementAccount = isLoadingOnyxValue(reimbursementAccountResult);

    const defaultCompanyIncorporationState = reimbursementAccount?.achData?.incorporationState ?? '';

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: isEditing,
    });

    if (isLoadingReimbursementAccount) {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            validate={validate}
            onSubmit={handleSubmit}
            style={[styles.mh0, styles.flexGrow1]}
            submitButtonStyles={[styles.ph5, styles.mb0]}
            shouldHideFixErrorsAlert
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5]}>{translate('businessInfoStep.pleaseSelectTheStateYourCompanyWasIncorporatedIn')}</Text>
            <InputWrapper
                InputComponent={StateSelector}
                inputID={COMPANY_INCORPORATION_STATE_KEY}
                label={translate('businessInfoStep.incorporationState')}
                defaultValue={defaultCompanyIncorporationState}
                shouldSaveDraft={!isEditing}
                wrapperStyle={[styles.ph5, styles.mt3]}
            />
        </FormProvider>
    );
}

export default IncorporationStateBusiness;
