import React, {useCallback} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import SingleFieldStep from '@components/SubStepForms/SingleFieldStep';
import useLocalize from '@hooks/useLocalize';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import * as ValidationUtils from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

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
    const defaultOwnershipPercentage = reimbursementAccountDraft?.[ownershipPercentageInputID] ?? '';
    const formTitle = translate(isUserEnteringHisOwnData ? 'ownershipInfoStep.whatsYoursPercentage' : 'ownershipInfoStep.whatPercentage');

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
            const errors = ValidationUtils.getFieldRequiredErrors(values, [ownershipPercentageInputID]);

            if (values[ownershipPercentageInputID] && !ValidationUtils.isValidOwnershipPercentage(values[ownershipPercentageInputID], totalOwnedPercentage, ownerBeingModifiedID)) {
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

OwnershipPercentage.displayName = 'OwnershipPercentage';

export default OwnershipPercentage;
