import React, {useCallback} from 'react';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import SingleFieldStep from '@components/SubStepForms/SingleFieldStep';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import {getFieldRequiredErrors, isValidTaxIDEINNumber} from '@libs/ValidationUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

type TaxIDEINNumberProps = SubStepProps;

const {TAX_ID_EIN_NUMBER, COMPANY_COUNTRY_CODE} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;
const STEP_FIELDS = [TAX_ID_EIN_NUMBER];

function TaxIDEINNumber({onNext, onMove, isEditing}: TaxIDEINNumberProps) {
    const {translate} = useLocalize();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: false});
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, {canBeMissing: false});

    const defaultValue = reimbursementAccount?.achData?.corpay?.[TAX_ID_EIN_NUMBER] ?? '';
    const businessStepCountryValue = reimbursementAccount?.achData?.corpay?.[COMPANY_COUNTRY_CODE] ?? reimbursementAccountDraft?.[COMPANY_COUNTRY_CODE] ?? '';

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
            const errors = getFieldRequiredErrors(values, STEP_FIELDS);

            if (values[TAX_ID_EIN_NUMBER] && !isValidTaxIDEINNumber(values[TAX_ID_EIN_NUMBER], businessStepCountryValue)) {
                errors[TAX_ID_EIN_NUMBER] = translate('businessInfoStep.error.taxIDEIN', businessStepCountryValue);
            }

            return errors;
        },
        [businessStepCountryValue, translate],
    );

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: isEditing,
    });

    return (
        <SingleFieldStep<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            formTitle={translate('businessInfoStep.whatsTheBusinessTaxIDEIN', businessStepCountryValue)}
            validate={validate}
            onSubmit={handleSubmit}
            inputId={TAX_ID_EIN_NUMBER}
            inputLabel={translate('businessInfoStep.taxIDEIN', businessStepCountryValue)}
            defaultValue={defaultValue}
            shouldShowHelpLinks={false}
        />
    );
}

export default TaxIDEINNumber;
