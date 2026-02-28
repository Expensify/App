import React from 'react';
import DateOfBirthStep from '@components/SubStepForms/DateOfBirthStep';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SafeString from '@src/utils/SafeString';

type DateOfBirthProps = SubStepProps & {isUserEnteringHisOwnData: boolean; ownerBeingModifiedID: string};

const {DOB, PREFIX} = CONST.NON_USD_BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA;

function DateOfBirth({onNext, isEditing, onMove, isUserEnteringHisOwnData, ownerBeingModifiedID}: DateOfBirthProps) {
    const {translate} = useLocalize();
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);

    const dobInputID = `${PREFIX}_${ownerBeingModifiedID}_${DOB}` as const;
    const dobDefaultValue = SafeString(reimbursementAccountDraft?.[dobInputID]);
    const formTitle = translate(isUserEnteringHisOwnData ? 'ownershipInfoStep.whatsYourDOB' : 'ownershipInfoStep.whatsTheOwnersDOB');

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
            formTitle={formTitle}
            onSubmit={handleSubmit}
            stepFields={[dobInputID]}
            dobInputID={dobInputID}
            dobDefaultValue={dobDefaultValue}
        />
    );
}

export default DateOfBirth;
