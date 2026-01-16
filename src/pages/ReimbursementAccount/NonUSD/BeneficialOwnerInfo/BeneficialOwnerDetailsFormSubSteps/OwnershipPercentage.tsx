import React, {useCallback} from 'react';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import SingleFieldStep from '@components/SubStepForms/SingleFieldStep';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import {getFieldRequiredErrors, isValidOwnershipPercentage} from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SafeString from '@src/utils/SafeString';

type OwnershipPercentageProps = SubStepProps & {
    isUserEnteringHisOwnData: boolean;
    ownerBeingModifiedID: string;
    totalOwnedPercentage: Record<string, number>;
    setTotalOwnedPercentage: (ownedPercentage: Record<string, number>) => void;
};

const {OWNERSHIP_PERCENTAGE, PREFIX} = CONST.NON_USD_BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA;

function OwnershipPercentage({onNext, isEditing, onMove, isUserEnteringHisOwnData, ownerBeingModifiedID, totalOwnedPercentage, setTotalOwnedPercentage}: OwnershipPercentageProps) {
    const {translate} = useLocalize();
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);

    const ownershipPercentageInputID = `${PREFIX}_${ownerBeingModifiedID}_${OWNERSHIP_PERCENTAGE}` as const;
    const defaultOwnershipPercentage = SafeString(reimbursementAccountDraft?.[ownershipPercentageInputID]);
    const formTitle = translate(isUserEnteringHisOwnData ? 'ownershipInfoStep.whatsYoursPercentage' : 'ownershipInfoStep.whatPercentage');

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
            const errors = getFieldRequiredErrors(values, [ownershipPercentageInputID]);

            if (values[ownershipPercentageInputID] && !isValidOwnershipPercentage(SafeString(values[ownershipPercentageInputID]), totalOwnedPercentage, ownerBeingModifiedID)) {
                errors[ownershipPercentageInputID] = translate('bankAccount.error.ownershipPercentage');
            }

            setTotalOwnedPercentage({
                ...totalOwnedPercentage,
                [ownerBeingModifiedID]: Number(values[ownershipPercentageInputID]),
            });

            return errors;
        },
        [ownerBeingModifiedID, ownershipPercentageInputID, setTotalOwnedPercentage, totalOwnedPercentage, translate],
    );

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: [ownershipPercentageInputID],
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
            validate={validate}
            onSubmit={handleSubmit}
            inputId={ownershipPercentageInputID}
            inputLabel={translate('ownershipInfoStep.ownership')}
            inputMode={CONST.INPUT_MODE.NUMERIC}
            defaultValue={defaultOwnershipPercentage}
            shouldShowHelpLinks={false}
        />
    );
}

export default OwnershipPercentage;
