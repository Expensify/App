import React from 'react';
import {useOnyx} from 'react-native-onyx';
import type {FormOnyxKeys, FormOnyxValues} from '@components/Form/types';
import CommonDateOfBirthStep from '@components/SubStepForms/DateOfBirthStep';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useWalletAdditionalDetailsStepFormSubmit from '@hooks/useWalletAdditionalDetailsStepFormSubmit';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxFormValuesMapping} from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/WalletAdditionalDetailsForm';

const PERSONAL_INFO_DOB_KEY = INPUT_IDS.PERSONAL_INFO_STEP.DOB;
const STEP_FIELDS = [PERSONAL_INFO_DOB_KEY] as Array<FormOnyxKeys<keyof OnyxFormValuesMapping>>;

function DateOfBirthStep({onNext, onMove, isEditing}: SubStepProps) {
    const {translate} = useLocalize();

    const [walletAdditionalDetails] = useOnyx(ONYXKEYS.WALLET_ADDITIONAL_DETAILS);
    const dobDefaultValue = walletAdditionalDetails?.[PERSONAL_INFO_DOB_KEY] ?? walletAdditionalDetails?.[PERSONAL_INFO_DOB_KEY] ?? '';

    const handleSubmit = useWalletAdditionalDetailsStepFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: isEditing,
    }) as (values: FormOnyxValues<keyof OnyxFormValuesMapping>) => void;

    return (
        <CommonDateOfBirthStep<typeof ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS>
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            formID={ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS}
            formTitle={translate('personalInfoStep.whatsYourDOB')}
            onSubmit={handleSubmit}
            stepFields={STEP_FIELDS}
            dobInputID={PERSONAL_INFO_DOB_KEY as keyof FormOnyxValues}
            dobDefaultValue={dobDefaultValue}
        />
    );
}

DateOfBirthStep.displayName = 'DateOfBirthStep';

export default DateOfBirthStep;
