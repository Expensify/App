import React, {useCallback} from 'react';
import DatePicker from '@components/DatePicker';
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
import {getFieldRequiredErrors, isValidDate, isValidPastDate} from '@libs/ValidationUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

const COMPANY_INCORPORATION_DATE_KEY = INPUT_IDS.BUSINESS_INFO_STEP.INCORPORATION_DATE;
const STEP_FIELDS = [COMPANY_INCORPORATION_DATE_KEY];

function IncorporationDateBusiness({onNext, isEditing}: SubStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [reimbursementAccount, reimbursementAccountResult] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: true});
    const isLoadingReimbursementAccount = isLoadingOnyxValue(reimbursementAccountResult);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, {canBeMissing: true});

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
            const errors = getFieldRequiredErrors(values, STEP_FIELDS);

            if (values.incorporationDate && !isValidDate(values.incorporationDate)) {
                errors.incorporationDate = translate('common.error.dateInvalid');
            } else if (values.incorporationDate && !isValidPastDate(values.incorporationDate)) {
                errors.incorporationDate = translate('bankAccount.error.incorporationDateFuture');
            }

            return errors;
        },
        [translate],
    );

    const defaultCompanyIncorporationDate = reimbursementAccount?.achData?.incorporationDate ?? reimbursementAccountDraft?.incorporationDate ?? '';

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
            style={[styles.mh5, styles.flexGrow1]}
            submitButtonStyles={[styles.mb0]}
            shouldHideFixErrorsAlert
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.mb4]}>{translate('businessInfoStep.selectYourCompanyIncorporationDate')}</Text>
            <InputWrapper
                InputComponent={DatePicker}
                inputID={COMPANY_INCORPORATION_DATE_KEY}
                label={translate('businessInfoStep.incorporationDate')}
                placeholder={translate('businessInfoStep.incorporationDatePlaceholder')}
                defaultValue={defaultCompanyIncorporationDate}
                shouldSaveDraft={!isEditing}
                maxDate={new Date()}
                autoFocus
            />
        </FormProvider>
    );
}

export default IncorporationDateBusiness;
