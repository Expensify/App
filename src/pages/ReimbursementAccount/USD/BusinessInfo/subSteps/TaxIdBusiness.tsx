import React, {useCallback} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import SingleFieldStep from '@components/SubStepForms/SingleFieldStep';
import useLocalize from '@hooks/useLocalize';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import {getFieldRequiredErrors, isValidTaxID} from '@libs/ValidationUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

const COMPANY_TAX_ID_KEY = INPUT_IDS.BUSINESS_INFO_STEP.COMPANY_TAX_ID;
const STEP_FIELDS = [COMPANY_TAX_ID_KEY];
function TaxIdBusiness({onNext, onMove, isEditing}: SubStepProps) {
    const {translate} = useLocalize();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);

    // This is default value for the input to be display
    /* eslint-disable-next-line rulesdir/no-default-id-values */
    const defaultCompanyTaxID = reimbursementAccount?.achData?.companyTaxID ?? '';
    const bankAccountID = reimbursementAccount?.achData?.bankAccountID;
    const shouldDisableCompanyTaxID = !!(bankAccountID && defaultCompanyTaxID && reimbursementAccount?.achData?.state !== 'SETUP');

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
            const errors = getFieldRequiredErrors(values, STEP_FIELDS);

            if (values.companyTaxID && !isValidTaxID(values.companyTaxID)) {
                errors.companyTaxID = translate('bankAccount.error.taxID');
            }

            return errors;
        },
        [translate],
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
            formTitle={translate('businessInfoStep.enterYourCompanysTaxIdNumber')}
            validate={validate}
            onSubmit={handleSubmit}
            inputId={COMPANY_TAX_ID_KEY}
            inputLabel={translate('businessInfoStep.taxIDNumber')}
            defaultValue={defaultCompanyTaxID}
            shouldUseDefaultValue={shouldDisableCompanyTaxID}
            disabled={shouldDisableCompanyTaxID}
            shouldShowHelpLinks={false}
            placeholder={translate('businessInfoStep.taxIDNumberPlaceholder')}
        />
    );
}

TaxIdBusiness.displayName = 'TaxIdBusiness';

export default TaxIdBusiness;
