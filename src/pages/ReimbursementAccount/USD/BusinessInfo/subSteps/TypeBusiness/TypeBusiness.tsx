import React from 'react';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
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
import BusinessTypePicker from './BusinessTypePicker';

const COMPANY_INCORPORATION_TYPE_KEY = INPUT_IDS.BUSINESS_INFO_STEP.INCORPORATION_TYPE;
const STEP_FIELDS = [COMPANY_INCORPORATION_TYPE_KEY];

function TypeBusiness({onNext, isEditing}: SubStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [reimbursementAccount, reimbursementAccountResult] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const isLoadingReimbursementAccount = isLoadingOnyxValue(reimbursementAccountResult);

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> =>
        getFieldRequiredErrors(values, STEP_FIELDS);

    const defaultIncorporationType = reimbursementAccount?.achData?.incorporationType ?? '';

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
            style={[styles.flexGrow1]}
            submitButtonStyles={[styles.ph5, styles.mb0]}
            shouldHideFixErrorsAlert
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5]}>{translate('businessInfoStep.selectYourCompanyType')}</Text>
            <InputWrapper
                InputComponent={BusinessTypePicker}
                inputID={COMPANY_INCORPORATION_TYPE_KEY}
                label={translate('businessInfoStep.companyType')}
                defaultValue={defaultIncorporationType}
                shouldSaveDraft={!isEditing}
                wrapperStyle={[styles.ph5, styles.mt3]}
            />
        </FormProvider>
    );
}

export default TypeBusiness;
