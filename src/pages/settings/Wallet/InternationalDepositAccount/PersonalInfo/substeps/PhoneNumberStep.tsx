import React from 'react';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import SingleFieldStep from '@components/SubStepForms/SingleFieldStep';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePersonalBankAccountDetailsFormSubmit from '@hooks/usePersonalBankAccountDetailsFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import {appendCountryCode, formatE164PhoneNumber} from '@libs/LoginUtils';
import {getFieldRequiredErrors, isValidPhoneNumber, isValidUSPhone} from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/PersonalBankAccountForm';

const PERSONAL_INFO_STEP_KEY = INPUT_IDS.BANK_INFO_STEP;
const STEP_FIELDS = [PERSONAL_INFO_STEP_KEY.PHONE_NUMBER];

function PhoneNumberStep({onNext, onMove, isEditing}: SubStepProps) {
    const {translate} = useLocalize();

    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {canBeMissing: true});
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
    const defaultPhoneNumber = privatePersonalDetails?.[PERSONAL_INFO_STEP_KEY.PHONE_NUMBER] ?? '';

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM> => {
        const errors = getFieldRequiredErrors(values, STEP_FIELDS);

        if (values.phoneNumber) {
            const phoneNumberWithCountryCode = appendCountryCode(values.phoneNumber, countryCode);
            const e164FormattedPhoneNumber = formatE164PhoneNumber(values.phoneNumber, countryCode);

            if (!isValidPhoneNumber(phoneNumberWithCountryCode) || !isValidUSPhone(e164FormattedPhoneNumber)) {
                errors.phoneNumber = translate('common.error.phoneNumber');
            }
        }

        return errors;
    };

    const handleSubmit = usePersonalBankAccountDetailsFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: isEditing,
    });

    return (
        <SingleFieldStep<typeof ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM>
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            formID={ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM}
            formTitle={translate('personalInfoStep.whatsYourPhoneNumber')}
            formDisclaimer={translate('personalInfoStep.weNeedThisToVerify')}
            validate={validate}
            onSubmit={(values) => {
                handleSubmit({...values, phoneNumber: formatE164PhoneNumber(values.phoneNumber, countryCode) ?? ''});
            }}
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
