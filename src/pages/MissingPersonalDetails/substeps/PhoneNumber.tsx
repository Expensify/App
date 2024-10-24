import {Str} from 'expensify-common';
import React, {useCallback} from 'react';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import SingleFieldStep from '@components/SubStepForms/SingleFieldStep';
import useLocalize from '@hooks/useLocalize';
import usePersonalDetailsFormSubmit from '@hooks/usePersonalDetailsFormSubmit';
import * as LoginUtils from '@libs/LoginUtils';
import * as PhoneNumberUtils from '@libs/PhoneNumber';
import * as ValidationUtils from '@libs/ValidationUtils';
import type {CustomSubStepProps} from '@pages/MissingPersonalDetails/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/PersonalDetailsForm';

const STEP_FIELDS = [INPUT_IDS.PHONE_NUMBER];

function PhoneNumberStep({isEditing, onNext, onMove, personalDetailsValues}: CustomSubStepProps) {
    const {translate} = useLocalize();

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM> => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM> = {};
            if (!ValidationUtils.isRequiredFulfilled(values[INPUT_IDS.PHONE_NUMBER])) {
                errors[INPUT_IDS.PHONE_NUMBER] = translate('common.error.fieldRequired');
            }
            const phoneNumber = LoginUtils.appendCountryCode(values[INPUT_IDS.PHONE_NUMBER]);
            const parsedPhoneNumber = PhoneNumberUtils.parsePhoneNumber(phoneNumber);
            if (!parsedPhoneNumber.possible || !Str.isValidE164Phone(phoneNumber.slice(0))) {
                errors[INPUT_IDS.PHONE_NUMBER] = translate('bankAccount.error.phoneNumber');
            }
            return errors;
        },
        [translate],
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
            onSubmit={handleSubmit}
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
