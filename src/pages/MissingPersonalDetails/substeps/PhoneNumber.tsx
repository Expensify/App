import {Str} from 'expensify-common';
import React, {useCallback} from 'react';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import SingleFieldStep from '@components/SubStepForms/SingleFieldStep';
import useLocalize from '@hooks/useLocalize';
import usePersonalDetailsFormSubmit from '@hooks/usePersonalDetailsFormSubmit';
import {appendCountryCode} from '@libs/LoginUtils';
import {parsePhoneNumber} from '@libs/PhoneNumber';
import {isRequiredFulfilled} from '@libs/ValidationUtils';
import type {CustomSubStepProps} from '@pages/MissingPersonalDetails/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/PersonalDetailsForm';

const STEP_FIELDS = [INPUT_IDS.PHONE_NUMBER];

function PhoneNumberStep({isEditing, onNext, onMove, personalDetailsValues}: CustomSubStepProps) {
    const {translate} = useLocalize();

    const sanitizePhoneNumber = (num?: string): string => num?.replace(CONST.SANITIZE_PHONE_REGEX, '') ?? '';
    const formatPhoneNumber = useCallback((num: string) => {
        const phoneNumberWithCountryCode = appendCountryCode(sanitizePhoneNumber(num));
        const parsedPhoneNumber = parsePhoneNumber(phoneNumberWithCountryCode);

        return parsedPhoneNumber;
    }, []);

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM> => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM> = {};
            const phoneNumberValue = values[INPUT_IDS.PHONE_NUMBER];

            if (!isRequiredFulfilled(phoneNumberValue)) {
                errors[INPUT_IDS.PHONE_NUMBER] = translate('common.error.fieldRequired');
                return errors;
            }

            if (!CONST.PHONE_NUMBER_PATTERN.test(phoneNumberValue)) {
                errors[INPUT_IDS.PHONE_NUMBER] = translate('bankAccount.error.phoneNumber');
                return errors;
            }

            const sanitizedPhoneNumber = sanitizePhoneNumber(phoneNumberValue);
            const phoneNumberWithCountryCode = appendCountryCode(sanitizedPhoneNumber);
            const parsedPhoneNumber = formatPhoneNumber(phoneNumberValue);

            if (!parsedPhoneNumber.possible || !Str.isValidE164Phone(phoneNumberWithCountryCode)) {
                errors[INPUT_IDS.PHONE_NUMBER] = translate('bankAccount.error.phoneNumber');
            }

            return errors;
        },
        [formatPhoneNumber, translate],
    );

    const handleSubmit = usePersonalDetailsFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: true,
    });

    return (
        <SingleFieldStep<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM>
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            formID={ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM}
            formTitle={translate('privatePersonalDetails.enterPhoneNumber')}
            validate={validate}
            onSubmit={(values) => {
                handleSubmit({...values, phoneNumber: formatPhoneNumber(values[INPUT_IDS.PHONE_NUMBER]).number?.e164 ?? ''});
            }}
            inputId={INPUT_IDS.PHONE_NUMBER}
            inputLabel={translate('common.phoneNumber')}
            inputMode={CONST.INPUT_MODE.TEL}
            defaultValue={personalDetailsValues[INPUT_IDS.PHONE_NUMBER]}
            shouldShowHelpLinks={false}
        />
    );
}

PhoneNumberStep.displayName = 'PhoneNumberStep';

export default PhoneNumberStep;
