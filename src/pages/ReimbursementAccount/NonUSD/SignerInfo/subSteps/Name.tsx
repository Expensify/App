import React from 'react';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import SingleFieldStep from '@components/SubStepForms/SingleFieldStep';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubPageProps} from '@hooks/useSubPage/types';
import {getFieldRequiredErrors, isValidLegalName} from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

type NameProps = SubPageProps;

const {SIGNER_FULL_NAME} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;

function Name({onNext, onMove, isEditing}: NameProps) {
    const {translate} = useLocalize();
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);

    const defaultValue = String(reimbursementAccountDraft?.[SIGNER_FULL_NAME] ?? '');

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
        const errors = getFieldRequiredErrors(values, [SIGNER_FULL_NAME], translate);

        if (values[SIGNER_FULL_NAME] && !isValidLegalName(String(values[SIGNER_FULL_NAME]))) {
            errors[SIGNER_FULL_NAME] = translate('bankAccount.error.fullName');
        }

        return errors;
    };

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: [SIGNER_FULL_NAME],
        onNext,
        shouldSaveDraft: isEditing,
    });

    return (
        <SingleFieldStep<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            formTitle={translate('signerInfoStep.whatsYourName')}
            validate={validate}
            onSubmit={handleSubmit}
            inputId={SIGNER_FULL_NAME}
            inputLabel={translate('signerInfoStep.fullName')}
            inputMode={CONST.INPUT_MODE.TEXT}
            defaultValue={defaultValue}
            shouldShowHelpLinks={false}
            shouldDelayAutoFocus
        />
    );
}

export default Name;
