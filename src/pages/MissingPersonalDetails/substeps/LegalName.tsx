import React, {useCallback} from 'react';
import type {FormInputErrors, FormOnyxKeys, FormOnyxValues} from '@components/Form/types';
import FullNameStep from '@components/SubStepForms/FullNameStep';
import useLocalize from '@hooks/useLocalize';
import usePersonalDetailsFormSubmit from '@hooks/usePersonalDetailsFormSubmit';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as ValidationUtils from '@libs/ValidationUtils';
import type {CustomSubStepProps} from '@pages/MissingPersonalDetails/types';
import CONST from '@src/CONST';
import type {OnyxFormValuesMapping} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/PersonalDetailsForm';

const STEP_FIELDS = [INPUT_IDS.LEGAL_FIRST_NAME, INPUT_IDS.LEGAL_LAST_NAME];

function LegalName({isEditing, onNext, onMove, personalDetailsValues}: CustomSubStepProps) {
    const {translate} = useLocalize();

    const defaultValues = {
        firstName: personalDetailsValues[INPUT_IDS.LEGAL_FIRST_NAME],
        lastName: personalDetailsValues[INPUT_IDS.LEGAL_LAST_NAME],
    };

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM> => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM> = {};
            if (!ValidationUtils.isRequiredFulfilled(values[INPUT_IDS.LEGAL_FIRST_NAME])) {
                errors[INPUT_IDS.LEGAL_FIRST_NAME] = translate('common.error.fieldRequired');
            } else if (!ValidationUtils.isValidLegalName(values[INPUT_IDS.LEGAL_FIRST_NAME])) {
                errors[INPUT_IDS.LEGAL_FIRST_NAME] = translate('privatePersonalDetails.error.hasInvalidCharacter');
            } else if (values[INPUT_IDS.LEGAL_FIRST_NAME].length > CONST.LEGAL_NAME.MAX_LENGTH) {
                errors[INPUT_IDS.LEGAL_FIRST_NAME] = translate('common.error.characterLimitExceedCounter', {
                    length: values[INPUT_IDS.LEGAL_FIRST_NAME].length,
                    limit: CONST.LEGAL_NAME.MAX_LENGTH,
                });
            }
            if (ValidationUtils.doesContainReservedWord(values[INPUT_IDS.LEGAL_FIRST_NAME], CONST.DISPLAY_NAME.RESERVED_NAMES)) {
                ErrorUtils.addErrorMessage(errors, INPUT_IDS.LEGAL_FIRST_NAME, translate('personalDetails.error.containsReservedWord'));
            }
            if (!ValidationUtils.isRequiredFulfilled(values[INPUT_IDS.LEGAL_LAST_NAME])) {
                errors[INPUT_IDS.LEGAL_LAST_NAME] = translate('common.error.fieldRequired');
            } else if (!ValidationUtils.isValidLegalName(values[INPUT_IDS.LEGAL_LAST_NAME])) {
                errors[INPUT_IDS.LEGAL_LAST_NAME] = translate('privatePersonalDetails.error.hasInvalidCharacter');
            } else if (values[INPUT_IDS.LEGAL_LAST_NAME].length > CONST.LEGAL_NAME.MAX_LENGTH) {
                errors[INPUT_IDS.LEGAL_LAST_NAME] = translate('common.error.characterLimitExceedCounter', {
                    length: values[INPUT_IDS.LEGAL_LAST_NAME].length,
                    limit: CONST.LEGAL_NAME.MAX_LENGTH,
                });
            }
            if (ValidationUtils.doesContainReservedWord(values[INPUT_IDS.LEGAL_LAST_NAME], CONST.DISPLAY_NAME.RESERVED_NAMES)) {
                ErrorUtils.addErrorMessage(errors, INPUT_IDS.LEGAL_LAST_NAME, translate('personalDetails.error.containsReservedWord'));
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
        <FullNameStep<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM>
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            formID={ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM}
            formTitle={translate('privatePersonalDetails.enterLegalName')}
            onSubmit={handleSubmit}
            customValidate={validate}
            stepFields={STEP_FIELDS}
            firstNameInputID={INPUT_IDS.LEGAL_FIRST_NAME}
            lastNameInputID={INPUT_IDS.LEGAL_LAST_NAME}
            defaultValues={defaultValues}
            shouldShowHelpLinks={false}
        />
    );
}

LegalName.displayName = 'LegalName';

export default LegalName;
