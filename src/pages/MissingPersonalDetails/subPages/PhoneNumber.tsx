import React, {useCallback} from 'react';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import SingleFieldStep from '@components/SubStepForms/SingleFieldStep';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePersonalDetailsFormSubmit from '@hooks/usePersonalDetailsFormSubmit';
import {appendCountryCode, formatE164PhoneNumber} from '@libs/LoginUtils';
import {isRequiredFulfilled, isValidPhoneNumber} from '@libs/ValidationUtils';
import type {CustomSubPageProps} from '@pages/MissingPersonalDetails/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/PersonalDetailsForm';

const STEP_FIELDS = [INPUT_IDS.PHONE_NUMBER];

function PhoneNumberStep({isEditing, onNext, onMove, personalDetailsValues}: CustomSubPageProps) {
    const {translate} = useLocalize();
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM> => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM> = {};
            const phoneNumber = values[INPUT_IDS.PHONE_NUMBER];
            const phoneNumberWithCountryCode = appendCountryCode(phoneNumber, countryCode);

            if (!isRequiredFulfilled(phoneNumber)) {
                errors[INPUT_IDS.PHONE_NUMBER] = translate('common.error.fieldRequired');
                return errors;
            }

            if (!isValidPhoneNumber(phoneNumberWithCountryCode)) {
                errors[INPUT_IDS.PHONE_NUMBER] = translate('common.error.phoneNumber');
            }

            return errors;
        },
        [translate, countryCode],
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
                handleSubmit({...values, phoneNumber: formatE164PhoneNumber(values[INPUT_IDS.PHONE_NUMBER], countryCode) ?? ''});
            }}
            inputId={INPUT_IDS.PHONE_NUMBER}
            inputLabel={translate('common.phoneNumber')}
            inputMode={CONST.INPUT_MODE.TEL}
            defaultValue={personalDetailsValues[INPUT_IDS.PHONE_NUMBER]}
            shouldShowHelpLinks={false}
        />
    );
}

export default PhoneNumberStep;
