import React, {useMemo} from 'react';
import CommonAddressStep from '@components/SubStepForms/AddressStep';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useWalletAdditionalDetailsStepFormSubmit from '@hooks/useWalletAdditionalDetailsStepFormSubmit';
import CONST from '@src/CONST';
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

    const [walletAdditionalDetails] = useOnyx(ONYXKEYS.WALLET_ADDITIONAL_DETAILS, {canBeMissing: true});

    const defaultValues = useMemo(
        () => ({
            street: walletAdditionalDetails?.[PERSONAL_INFO_STEP_KEY.STREET] ?? '',
            city: walletAdditionalDetails?.[PERSONAL_INFO_STEP_KEY.CITY] ?? '',
            state: walletAdditionalDetails?.[PERSONAL_INFO_STEP_KEY.STATE] ?? '',
            zipCode: walletAdditionalDetails?.[PERSONAL_INFO_STEP_KEY.ZIP_CODE] ?? '',
        }),
        [walletAdditionalDetails],
    );

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
            formPOBoxDisclaimer={translate('common.noPO')}
            onSubmit={handleSubmit}
            stepFields={STEP_FIELDS}
            inputFieldsIDs={INPUT_KEYS}
            defaultValues={defaultValues}
            shouldShowHelpLinks
            shouldShowPatriotActLink
            forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}
        />
    );
}

export default AddressStep;
