import React, {useCallback} from 'react';
import {useOnyx} from 'react-native-onyx';
import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

const COMPANY_INCORPORATION_DATE_KEY = INPUT_IDS.BUSINESS_INFO_STEP.INCORPORATION_DATE;
const STEP_FIELDS = [COMPANY_INCORPORATION_DATE_KEY];

function IncorporationDateBusiness({onNext, isEditing}: SubStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
            const errors = ValidationUtils.getFieldRequiredErrors(values, STEP_FIELDS);

            if (values.incorporationDate && !ValidationUtils.isValidDate(values.incorporationDate)) {
                errors.incorporationDate = translate('common.error.dateInvalid');
            } else if (values.incorporationDate && !ValidationUtils.isValidPastDate(values.incorporationDate)) {
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

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            validate={validate}
            onSubmit={handleSubmit}
            style={[styles.mh5, styles.flexGrow1]}
            submitButtonStyles={[styles.mb0]}
        >
            <Text style={[styles.textHeadlineLineHeightXXL]}>{translate('businessInfoStep.selectYourCompanysIncorporationDate')}</Text>
            <InputWrapper
                InputComponent={DatePicker}
                inputID={COMPANY_INCORPORATION_DATE_KEY}
                label={translate('businessInfoStep.incorporationDate')}
                containerStyles={[styles.mt6]}
                placeholder={translate('businessInfoStep.incorporationDatePlaceholder')}
                defaultValue={defaultCompanyIncorporationDate}
                shouldSaveDraft={!isEditing}
                maxDate={new Date()}
            />
        </FormProvider>
    );
}

IncorporationDateBusiness.displayName = 'IncorporationDateBusiness';

export default IncorporationDateBusiness;
