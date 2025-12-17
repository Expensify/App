import React from 'react';
import DateOfBirthStep from '@components/SubStepForms/DateOfBirthStep';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SafeString from '@src/utils/SafeString';

const DOB = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA.DOB;
const BENEFICIAL_OWNER_PREFIX = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA.PREFIX;

type DateOfBirthUBOProps = SubStepProps & {beneficialOwnerBeingModifiedID: string};

function DateOfBirthUBO({onNext, onMove, isEditing, beneficialOwnerBeingModifiedID}: DateOfBirthUBOProps) {
    const {translate} = useLocalize();

    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);

    const dobInputID = `${BENEFICIAL_OWNER_PREFIX}_${beneficialOwnerBeingModifiedID}_${DOB}` as const;
    const dobDefaultValue = SafeString(reimbursementAccountDraft?.[dobInputID]);

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: [dobInputID],
        onNext,
        shouldSaveDraft: isEditing,
    });

    return (
        <DateOfBirthStep<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            formTitle={translate('beneficialOwnerInfoStep.enterTheDateOfBirthOfTheOwner')}
            onSubmit={handleSubmit}
            stepFields={[dobInputID]}
            dobInputID={dobInputID}
            dobDefaultValue={dobDefaultValue}
        />
    );
}

export default DateOfBirthUBO;
