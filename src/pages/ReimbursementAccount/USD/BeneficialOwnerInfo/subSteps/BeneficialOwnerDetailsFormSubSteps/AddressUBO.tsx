import React from 'react';
import AddressStep from '@components/SubStepForms/AddressStep';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SafeString from '@src/utils/SafeString';

const BENEFICIAL_OWNER_INFO_KEY = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA;
const BENEFICIAL_OWNER_PREFIX = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA.PREFIX;

type AddressUBOProps = SubStepProps & {beneficialOwnerBeingModifiedID: string};

function AddressUBO({onNext, onMove, isEditing, beneficialOwnerBeingModifiedID}: AddressUBOProps) {
    const {translate} = useLocalize();

    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);

    const inputKeys = {
        street: `${BENEFICIAL_OWNER_PREFIX}_${beneficialOwnerBeingModifiedID}_${BENEFICIAL_OWNER_INFO_KEY.STREET}`,
        city: `${BENEFICIAL_OWNER_PREFIX}_${beneficialOwnerBeingModifiedID}_${BENEFICIAL_OWNER_INFO_KEY.CITY}`,
        state: `${BENEFICIAL_OWNER_PREFIX}_${beneficialOwnerBeingModifiedID}_${BENEFICIAL_OWNER_INFO_KEY.STATE}`,
        zipCode: `${BENEFICIAL_OWNER_PREFIX}_${beneficialOwnerBeingModifiedID}_${BENEFICIAL_OWNER_INFO_KEY.ZIP_CODE}`,
    } as const;

    const defaultValues = {
        street: SafeString(reimbursementAccountDraft?.[inputKeys.street]),
        city: SafeString(reimbursementAccountDraft?.[inputKeys.city]),
        state: SafeString(reimbursementAccountDraft?.[inputKeys.state]),
        zipCode: SafeString(reimbursementAccountDraft?.[inputKeys.zipCode]),
    };

    const stepFields = [inputKeys.street, inputKeys.city, inputKeys.state, inputKeys.zipCode];

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: stepFields,
        onNext,
        shouldSaveDraft: isEditing,
    });

    return (
        <AddressStep<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            formTitle={translate('beneficialOwnerInfoStep.enterTheOwnersAddress')}
            formPOBoxDisclaimer={translate('common.noPO')}
            onSubmit={handleSubmit}
            stepFields={stepFields}
            inputFieldsIDs={inputKeys}
            defaultValues={defaultValues}
            shouldShowHelpLinks={false}
        />
    );
}

export default AddressUBO;
