import React from 'react';
import FullNameStep from '@components/SubStepForms/FullNameStep';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

const PERSONAL_INFO_STEP_KEY = INPUT_IDS.PERSONAL_INFO_STEP;
const STEP_FIELDS = [PERSONAL_INFO_STEP_KEY.FIRST_NAME, PERSONAL_INFO_STEP_KEY.LAST_NAME];

function FullName({onNext, onMove, isEditing}: SubStepProps) {
    const {translate} = useLocalize();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);

    const defaultValues = {
        firstName: reimbursementAccount?.achData?.[PERSONAL_INFO_STEP_KEY.FIRST_NAME] ?? '',
        lastName: reimbursementAccount?.achData?.[PERSONAL_INFO_STEP_KEY.LAST_NAME] ?? '',
    };

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: isEditing,
    });

    return (
        <FullNameStep<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            formTitle={translate('personalInfoStep.enterYourLegalFirstAndLast')}
            onSubmit={handleSubmit}
            stepFields={STEP_FIELDS}
            firstNameInputID={PERSONAL_INFO_STEP_KEY.FIRST_NAME}
            lastNameInputID={PERSONAL_INFO_STEP_KEY.LAST_NAME}
            defaultValues={defaultValues}
            forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}
        />
    );
}

export default FullName;
