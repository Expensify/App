import React from 'react';
import CommonAddressStep from '@components/SubStepForms/AddressStep';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePersonalBankAccountDetailsFormSubmit from '@hooks/usePersonalBankAccountDetailsFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import {getCurrentAddress} from '@libs/PersonalDetailsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/PersonalBankAccountForm';

const PERSONAL_INFO_STEP_KEY = INPUT_IDS.BANK_INFO_STEP;

const INPUT_KEYS = {
    street: PERSONAL_INFO_STEP_KEY.STREET,
    city: PERSONAL_INFO_STEP_KEY.CITY,
    state: PERSONAL_INFO_STEP_KEY.STATE,
    zipCode: PERSONAL_INFO_STEP_KEY.ZIP_CODE,
};

const STEP_FIELDS = [PERSONAL_INFO_STEP_KEY.STREET, PERSONAL_INFO_STEP_KEY.CITY, PERSONAL_INFO_STEP_KEY.STATE, PERSONAL_INFO_STEP_KEY.ZIP_CODE];

function AddressStep({onNext, onMove, isEditing}: SubStepProps) {
    const {translate} = useLocalize();

    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {canBeMissing: true});
    const currentAddress = getCurrentAddress(privatePersonalDetails);

    const defaultValues = {
        street: currentAddress?.street ?? '',
        city: currentAddress?.city ?? '',
        state: currentAddress?.state ?? '',
        zipCode: currentAddress?.zip ?? '',
    };

    const handleSubmit = usePersonalBankAccountDetailsFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: isEditing,
    });

    return (
        <CommonAddressStep<typeof ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM>
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            formID={ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM}
            formTitle={translate('personalInfoStep.whatsYourAddress')}
            formPOBoxDisclaimer={translate('common.noPO')}
            onSubmit={handleSubmit}
            stepFields={STEP_FIELDS}
            inputFieldsIDs={INPUT_KEYS}
            defaultValues={defaultValues}
        />
    );
}

AddressStep.displayName = 'AddressStep';

export default AddressStep;
