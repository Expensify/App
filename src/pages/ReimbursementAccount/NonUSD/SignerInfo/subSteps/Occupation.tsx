import React, {useCallback} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import SingleFieldStep from '@components/SubStepForms/SingleFieldStep';
import useLocalize from '@hooks/useLocalize';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import {getFieldRequiredErrors, isValidLegalName} from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type OccupationProps = SubStepProps & {directorID?: string};

const {PREFIX, DIRECTOR_OCCUPATION} = CONST.NON_USD_BANK_ACCOUNT.SIGNER_INFO_STEP.SIGNER_INFO_DATA;

function Occupation({onNext, onMove, isEditing, directorID}: OccupationProps) {
    const {translate} = useLocalize();
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);

    const inputID = `${PREFIX}_${directorID}_${DIRECTOR_OCCUPATION}`;
    const defaultValue = String(reimbursementAccountDraft?.[inputID] ?? '');

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
            const errors = getFieldRequiredErrors(values, [inputID]);

            if (values[inputID] && !isValidLegalName(String(values[inputID]))) {
                errors[inputID] = translate('bankAccount.error.fullName');
            }

            return errors;
        },
        [inputID, translate],
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
            formTitle={translate('signerInfoStep.whatsYourOccupation')}
            validate={validate}
            onSubmit={handleSubmit}
            inputId={inputID}
            inputLabel={translate('signerInfoStep.occupation')}
            inputMode={CONST.INPUT_MODE.TEXT}
            defaultValue={defaultValue}
            shouldShowHelpLinks={false}
        />
    );
}

Occupation.displayName = 'Occupation';

export default Occupation;
