import React from 'react';
import {useOnyx} from 'react-native-onyx';
import CommonAddressStep from '@components/SubStepForms/AddressStep';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useWalletAdditionalDetailsStepFormSubmit from '@hooks/useWalletAdditionalDetailsStepFormSubmit';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/WalletAdditionalDetailsForm';

const PERSONAL_INFO_STEP_KEY = INPUT_IDS.PERSONAL_INFO_STEP;

const INPUT_KEYS = {
    street: PERSONAL_INFO_STEP_KEY.STREET,
    city: PERSONAL_INFO_STEP_KEY.CITY,
    state: PERSONAL_INFO_STEP_KEY.STATE,
    zipCode: PERSONAL_INFO_STEP_KEY.ZIP_CODE,
};

const STEP_FIELDS = [PERSONAL_INFO_STEP_KEY.STREET, PERSONAL_INFO_STEP_KEY.CITY, PERSONAL_INFO_STEP_KEY.STATE, PERSONAL_INFO_STEP_KEY.ZIP_CODE];

function AddressStep({onNext, onMove, isEditing}: SubStepProps) {
    const {translate} = useLocalize();

    const [walletAdditionalDetails] = useOnyx(ONYXKEYS.WALLET_ADDITIONAL_DETAILS);

    const defaultValues = {
        street: walletAdditionalDetails?.[PERSONAL_INFO_STEP_KEY.STREET] ?? '',
        city: walletAdditionalDetails?.[PERSONAL_INFO_STEP_KEY.CITY] ?? '',
        state: walletAdditionalDetails?.[PERSONAL_INFO_STEP_KEY.STATE] ?? '',
        zipCode: walletAdditionalDetails?.[PERSONAL_INFO_STEP_KEY.ZIP_CODE] ?? '',
    };

    const handleSubmit = useWalletAdditionalDetailsStepFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: isEditing,
    });

    return (
        <CommonAddressStep<typeof ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS>
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            formID={ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS}
            formTitle={translate('personalInfoStep.whatsYourAddress')}
            formPOBoxDisclaimer={translate('personalInfoStep.noPOBoxesPlease')}
            onSubmit={handleSubmit}
            stepFields={STEP_FIELDS}
            inputFieldsIDs={INPUT_KEYS}
            defaultValues={defaultValues}
        />
    );
}

AddressStep.defaultName = 'AddressStep';

export default AddressStep;
