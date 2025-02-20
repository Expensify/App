import React, {useCallback} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import SingleFieldStep from '@components/SubStepForms/SingleFieldStep';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useWalletAdditionalDetailsStepFormSubmit from '@hooks/useWalletAdditionalDetailsStepFormSubmit';
import {getFieldRequiredErrors, isValidUSPhone} from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/WalletAdditionalDetailsForm';

const PERSONAL_INFO_STEP_KEY = INPUT_IDS.PERSONAL_INFO_STEP;
const STEP_FIELDS = [PERSONAL_INFO_STEP_KEY.PHONE_NUMBER];

function PhoneNumberStep({onNext, onMove, isEditing}: SubStepProps) {
    const {translate} = useLocalize();

    const [walletAdditionalDetails] = useOnyx(ONYXKEYS.WALLET_ADDITIONAL_DETAILS);
    const defaultPhoneNumber = walletAdditionalDetails?.[PERSONAL_INFO_STEP_KEY.PHONE_NUMBER] ?? '';

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS>): FormInputErrors<typeof ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS> => {
            const errors = getFieldRequiredErrors(values, STEP_FIELDS);

            if (values.phoneNumber && !isValidUSPhone(values.phoneNumber, true)) {
                errors.phoneNumber = translate('bankAccount.error.phoneNumber');
            }
            return errors;
        },
        [translate],
    );

    const handleSubmit = useWalletAdditionalDetailsStepFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: isEditing,
    });

    return (
        <SingleFieldStep<typeof ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS>
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            formID={ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS}
            formTitle={translate('personalInfoStep.whatsYourPhoneNumber')}
            formDisclaimer={translate('personalInfoStep.weNeedThisToVerify')}
            validate={validate}
            onSubmit={handleSubmit}
            inputId={PERSONAL_INFO_STEP_KEY.PHONE_NUMBER}
            inputLabel={translate('common.phoneNumber')}
            inputMode={CONST.INPUT_MODE.TEL}
            defaultValue={defaultPhoneNumber}
            enabledWhenOffline
        />
    );
}

PhoneNumberStep.displayName = 'PhoneNumberStep';

export default PhoneNumberStep;
