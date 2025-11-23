import React, {useCallback} from 'react';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import SingleFieldStep from '@components/SubStepForms/SingleFieldStep';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useWalletAdditionalDetailsStepFormSubmit from '@hooks/useWalletAdditionalDetailsStepFormSubmit';
import {getFieldRequiredErrors, isValidSSNFullNine, isValidSSNLastFour} from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/WalletAdditionalDetailsForm';

const PERSONAL_INFO_STEP_KEY = INPUT_IDS.PERSONAL_INFO_STEP;
const STEP_FIELDS = [PERSONAL_INFO_STEP_KEY.SSN_LAST_4];

function SocialSecurityNumberStep({onNext, onMove, isEditing}: SubStepProps) {
    const {translate} = useLocalize();

    const [walletAdditionalDetails] = useOnyx(ONYXKEYS.WALLET_ADDITIONAL_DETAILS, {canBeMissing: true});
    const shouldAskForFullSSN = walletAdditionalDetails?.errorCode === CONST.WALLET.ERROR.SSN;
    const defaultSsnLast4 = walletAdditionalDetails?.[PERSONAL_INFO_STEP_KEY.SSN_LAST_4] ?? '';

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS>): FormInputErrors<typeof ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS> => {
            const errors = getFieldRequiredErrors(values, STEP_FIELDS);

            if (shouldAskForFullSSN) {
                if (values.ssn && !isValidSSNFullNine(values.ssn)) {
                    errors.ssn = translate('additionalDetailsStep.ssnFull9Error');
                }
            } else if (values.ssn && !isValidSSNLastFour(values.ssn)) {
                errors.ssn = translate('bankAccount.error.ssnLast4');
            }

            return errors;
        },
        [translate, shouldAskForFullSSN],
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
            formTitle={translate('personalInfoStep.whatsYourSSN')}
            formDisclaimer={translate('personalInfoStep.noPersonalChecks')}
            validate={validate}
            onSubmit={handleSubmit}
            inputId={PERSONAL_INFO_STEP_KEY.SSN_LAST_4}
            inputLabel={translate(shouldAskForFullSSN ? 'common.ssnFull9' : 'personalInfoStep.last4SSN')}
            inputMode={CONST.INPUT_MODE.NUMERIC}
            defaultValue={defaultSsnLast4}
            maxLength={shouldAskForFullSSN ? CONST.BANK_ACCOUNT.MAX_LENGTH.FULL_SSN : CONST.BANK_ACCOUNT.MAX_LENGTH.SSN}
            shouldShowPatriotActLink
        />
    );
}

SocialSecurityNumberStep.displayName = 'SocialSecurityNumberStep';

export default SocialSecurityNumberStep;
