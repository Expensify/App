import React from 'react';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import SingleFieldStep from '@components/SubStepForms/SingleFieldStep';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import {getFieldRequiredErrors, isValidSSNLastFour} from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SafeString from '@src/utils/SafeString';

const SSN_LAST_4 = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA.SSN_LAST_4;
const BENEFICIAL_OWNER_PREFIX = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA.PREFIX;

type SocialSecurityNumberUBOProps = SubStepProps & {beneficialOwnerBeingModifiedID: string};

function SocialSecurityNumberUBO({onNext, onMove, isEditing, beneficialOwnerBeingModifiedID}: SocialSecurityNumberUBOProps) {
    const {translate} = useLocalize();

    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);

    const ssnLast4InputID = `${BENEFICIAL_OWNER_PREFIX}_${beneficialOwnerBeingModifiedID}_${SSN_LAST_4}` as const;
    const defaultSsnLast4 = SafeString(reimbursementAccountDraft?.[ssnLast4InputID]);
    const stepFields = [ssnLast4InputID];

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
        const errors = getFieldRequiredErrors(values, stepFields);
        if (values[ssnLast4InputID] && !isValidSSNLastFour(SafeString(values[ssnLast4InputID]))) {
            errors[ssnLast4InputID] = translate('bankAccount.error.ssnLast4');
        }
        return errors;
    };

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: stepFields,
        onNext,
        shouldSaveDraft: isEditing,
    });

    return (
        <SingleFieldStep<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            formTitle={translate('beneficialOwnerInfoStep.enterTheLast4')}
            formDisclaimer={translate('beneficialOwnerInfoStep.dontWorry')}
            validate={validate}
            onSubmit={handleSubmit}
            inputId={ssnLast4InputID}
            inputLabel={translate('beneficialOwnerInfoStep.last4SSN')}
            inputMode={CONST.INPUT_MODE.NUMERIC}
            defaultValue={defaultSsnLast4}
            shouldShowHelpLinks={false}
            maxLength={CONST.BANK_ACCOUNT.MAX_LENGTH.SSN}
        />
    );
}

export default SocialSecurityNumberUBO;
