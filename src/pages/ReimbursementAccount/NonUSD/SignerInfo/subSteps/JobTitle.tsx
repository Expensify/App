import React, {useCallback} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import SingleFieldStep from '@components/SubStepForms/SingleFieldStep';
import useLocalize from '@hooks/useLocalize';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SignerInfoStepProps} from '@src/types/form/ReimbursementAccountForm';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

type JobTitleProps = SubStepProps & {directorID?: string; isDirectorFlow?: boolean};

const {SIGNER_JOB_TITLE} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;
const {DIRECTOR_PREFIX, DIRECTOR_JOB_TITLE} = CONST.NON_USD_BANK_ACCOUNT.SIGNER_INFO_STEP.SIGNER_INFO_DATA;

function JobTitle({onNext, onMove, isEditing, directorID, isDirectorFlow}: JobTitleProps) {
    const {translate} = useLocalize();

    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
    const inputID =
        directorID && directorID !== CONST.NON_USD_BANK_ACCOUNT.CURRENT_USER_KEY ? (`${DIRECTOR_PREFIX}_${directorID}_${DIRECTOR_JOB_TITLE}` as keyof SignerInfoStepProps) : SIGNER_JOB_TITLE;
    const defaultValue = String(reimbursementAccountDraft?.[inputID] ?? '');

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
            return getFieldRequiredErrors(values, [inputID]);
        },
        [inputID],
    );

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: [inputID],
        onNext,
        shouldSaveDraft: isEditing,
    });

    return (
        <SingleFieldStep<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            formTitle={isDirectorFlow ? translate('signerInfoStep.whatsDirectorsJobTitle') : translate('signerInfoStep.whatsYourJobTitle')}
            validate={validate}
            onSubmit={handleSubmit}
            inputId={inputID}
            inputLabel={translate('signerInfoStep.jobTitle')}
            inputMode={CONST.INPUT_MODE.TEXT}
            defaultValue={defaultValue}
            shouldShowHelpLinks={false}
        />
    );
}

JobTitle.displayName = 'JobTitle';

export default JobTitle;
