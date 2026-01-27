import React, {useCallback} from 'react';
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

type Last4SSNProps = SubStepProps & {isUserEnteringHisOwnData: boolean; ownerBeingModifiedID: string};

const {SSN_LAST_4, PREFIX} = CONST.NON_USD_BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA;

function Last4SSN({onNext, isEditing, onMove, isUserEnteringHisOwnData, ownerBeingModifiedID}: Last4SSNProps) {
    const {translate} = useLocalize();
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);

    const last4SSNInputID = `${PREFIX}_${ownerBeingModifiedID}_${SSN_LAST_4}` as const;
    const defaultLast4SSN = SafeString(reimbursementAccountDraft?.[last4SSNInputID]);
    const formTitle = translate(isUserEnteringHisOwnData ? 'ownershipInfoStep.whatsYourLast' : 'ownershipInfoStep.whatAreTheLast');

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
            const errors = getFieldRequiredErrors(values, [last4SSNInputID]);

            if (values[last4SSNInputID] && !isValidSSNLastFour(SafeString(values[last4SSNInputID]))) {
                errors[last4SSNInputID] = translate('bankAccount.error.ssnLast4');
            }

            return errors;
        },
        [last4SSNInputID, translate],
    );

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: [last4SSNInputID],
        onNext,
        shouldSaveDraft: isEditing,
    });

    return (
        <SingleFieldStep<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            formTitle={formTitle}
            formDisclaimer={translate('beneficialOwnerInfoStep.dontWorry')}
            validate={validate}
            onSubmit={handleSubmit}
            inputId={last4SSNInputID}
            inputLabel={translate('ownershipInfoStep.last4')}
            inputMode={CONST.INPUT_MODE.NUMERIC}
            defaultValue={defaultLast4SSN}
            shouldShowHelpLinks={false}
            maxLength={CONST.BANK_ACCOUNT.MAX_LENGTH.SSN}
        />
    );
}

export default Last4SSN;
