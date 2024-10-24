import React from 'react';
import {useOnyx} from 'react-native-onyx';
import AddressStep from '@components/SubStepForms/AddressStep';
import useLocalize from '@hooks/useLocalize';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

const PERSONAL_INFO_STEP_KEY = INPUT_IDS.PERSONAL_INFO_STEP;

const INPUT_KEYS = {
    street: PERSONAL_INFO_STEP_KEY.STREET,
    city: PERSONAL_INFO_STEP_KEY.CITY,
    state: PERSONAL_INFO_STEP_KEY.STATE,
    zipCode: PERSONAL_INFO_STEP_KEY.ZIP_CODE,
};

const STEP_FIELDS = [PERSONAL_INFO_STEP_KEY.STREET, PERSONAL_INFO_STEP_KEY.CITY, PERSONAL_INFO_STEP_KEY.STATE, PERSONAL_INFO_STEP_KEY.ZIP_CODE];

function Address({onNext, onMove, isEditing}: SubStepProps) {
    const {translate} = useLocalize();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);

    const defaultValues = {
        street: reimbursementAccount?.achData?.[PERSONAL_INFO_STEP_KEY.STREET] ?? '',
        city: reimbursementAccount?.achData?.[PERSONAL_INFO_STEP_KEY.CITY] ?? '',
        state: reimbursementAccount?.achData?.[PERSONAL_INFO_STEP_KEY.STATE] ?? '',
        zipCode: reimbursementAccount?.achData?.[PERSONAL_INFO_STEP_KEY.ZIP_CODE] ?? '',
    };

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: isEditing,
    });

    return (
        <AddressStep<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            formTitle={translate('personalInfoStep.enterYourAddress')}
            formPOBoxDisclaimer={translate('common.noPO')}
            onSubmit={handleSubmit}
            stepFields={STEP_FIELDS}
            inputFieldsIDs={INPUT_KEYS}
            defaultValues={defaultValues}
        />
    );
}

Address.displayName = 'Address';

export default Address;
