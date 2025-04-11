import React, {useCallback} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import SingleFieldStep from '@components/SubStepForms/SingleFieldStep';
import useLocalize from '@hooks/useLocalize';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import {getFieldRequiredErrors, isValidCompanyName} from '@libs/ValidationUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

const COMPANY_NAME_KEY = INPUT_IDS.BUSINESS_INFO_STEP.COMPANY_NAME;
const STEP_FIELDS = [COMPANY_NAME_KEY];

function NameBusiness({onNext, onMove, isEditing}: SubStepProps) {
    const {translate} = useLocalize();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);

    const defaultCompanyName = reimbursementAccount?.achData?.companyName ?? '';
    const bankAccountID = reimbursementAccount?.achData?.bankAccountID;

    const shouldDisableCompanyName = !!(bankAccountID && defaultCompanyName && reimbursementAccount?.achData?.state !== 'SETUP');

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
            const errors = getFieldRequiredErrors(values, STEP_FIELDS);

            if (values.companyName && !isValidCompanyName(values.companyName)) {
                errors.companyName = translate('bankAccount.error.companyName');
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
            formTitle={translate('businessInfoStep.enterTheNameOfYourBusiness')}
            validate={validate}
            onSubmit={handleSubmit}
            inputId={COMPANY_NAME_KEY}
            inputLabel={translate('businessInfoStep.businessName')}
            defaultValue={defaultCompanyName}
            shouldUseDefaultValue={shouldDisableCompanyName}
            disabled={shouldDisableCompanyName}
            shouldShowHelpLinks={false}
        />
    );
}

NameBusiness.displayName = 'NameBusiness';

export default NameBusiness;
