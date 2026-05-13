import React from 'react';
import type {FormOnyxValues} from '@components/Form/types';
import FullNameStep from '@components/SubStepForms/FullNameStep';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SafeString from '@src/utils/SafeString';

const {FIRST_NAME, LAST_NAME} = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA;
const BENEFICIAL_OWNER_PREFIX = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA.PREFIX;

type LegalNameUBOProps = SubStepProps & {beneficialOwnerBeingModifiedID: string};

function LegalNameUBO({onNext, onMove, isEditing, beneficialOwnerBeingModifiedID}: LegalNameUBOProps) {
    const {translate} = useLocalize();

    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);

    const firstNameInputID = `${BENEFICIAL_OWNER_PREFIX}_${beneficialOwnerBeingModifiedID}_${FIRST_NAME}` as keyof FormOnyxValues;
    const lastNameInputID = `${BENEFICIAL_OWNER_PREFIX}_${beneficialOwnerBeingModifiedID}_${LAST_NAME}` as keyof FormOnyxValues;
    const stepFields = [firstNameInputID, lastNameInputID];
    const defaultValues = {
        firstName: SafeString(reimbursementAccountDraft?.[firstNameInputID]),
        lastName: SafeString(reimbursementAccountDraft?.[lastNameInputID]),
    };

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: stepFields,
        onNext,
        shouldSaveDraft: isEditing,
    });

    return (
        <FullNameStep<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            formTitle={translate('beneficialOwnerInfoStep.enterLegalFirstAndLastName')}
            onSubmit={handleSubmit}
            stepFields={stepFields}
            firstNameInputID={firstNameInputID}
            lastNameInputID={lastNameInputID}
            defaultValues={defaultValues}
        />
    );
}

export default LegalNameUBO;
