import React from 'react';
import {useOnyx} from 'react-native-onyx';
import FullNameStep from '@components/SubStepForms/FullNameStep';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useWalletAdditionalDetailsStepFormSubmit from '@hooks/useWalletAdditionalDetailsStepFormSubmit';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/WalletAdditionalDetailsForm';

const PERSONAL_INFO_STEP_KEY = INPUT_IDS.PERSONAL_INFO_STEP;
const STEP_FIELDS = [PERSONAL_INFO_STEP_KEY.FIRST_NAME, PERSONAL_INFO_STEP_KEY.LAST_NAME];

function LegalNameStep({onNext, onMove, isEditing}: SubStepProps) {
    const {translate} = useLocalize();
    const [walletAdditionalDetails] = useOnyx(ONYXKEYS.WALLET_ADDITIONAL_DETAILS);

    const defaultValues = {
        firstName: walletAdditionalDetails?.[PERSONAL_INFO_STEP_KEY.FIRST_NAME] ?? '',
        lastName: walletAdditionalDetails?.[PERSONAL_INFO_STEP_KEY.LAST_NAME] ?? '',
    };

    const handleSubmit = useWalletAdditionalDetailsStepFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: isEditing,
    });

    return (
        <FullNameStep<typeof ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS>
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            formID={ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS}
            formTitle={translate('personalInfoStep.whatsYourLegalName')}
            onSubmit={handleSubmit}
            stepFields={STEP_FIELDS}
            firstNameInputID={PERSONAL_INFO_STEP_KEY.FIRST_NAME}
            lastNameInputID={PERSONAL_INFO_STEP_KEY.LAST_NAME}
            defaultValues={defaultValues}
        />
    );
}

LegalNameStep.defaultName = 'LegalNameStep';

export default LegalNameStep;
