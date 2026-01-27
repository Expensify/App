import React, {useCallback} from 'react';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import SingleFieldStep from '@components/SubStepForms/SingleFieldStep';
import useEnterSignerInfoStepFormSubmit from '@hooks/useEnterSignerInfoStepFormSubmit';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import type {SubStepProps} from '@hooks/useSubStep/types';
import {getFieldRequiredErrors, isValidLegalName} from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/EnterSignerInfoForm';

function Name({onNext, onMove, isEditing}: SubStepProps) {
    const {translate} = useLocalize();
    const [enterSignerInfoFormDraft] = useOnyx(ONYXKEYS.FORMS.ENTER_SINGER_INFO_FORM_DRAFT, {canBeMissing: true});

    const inputID = INPUT_IDS.SIGNER_FULL_NAME;
    const defaultValue = String(enterSignerInfoFormDraft?.[inputID] ?? '');

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ENTER_SINGER_INFO_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.ENTER_SINGER_INFO_FORM> => {
            const errors = getFieldRequiredErrors(values, [inputID]);

            if (values[inputID] && !isValidLegalName(String(values[inputID]))) {
                errors[inputID] = translate('bankAccount.error.fullName');
            }

            return errors;
        },
        [inputID, translate],
    );

    const handleSubmit = useEnterSignerInfoStepFormSubmit({
        fieldIds: [inputID],
        onNext,
        shouldSaveDraft: isEditing,
    });

    return (
        <SingleFieldStep<typeof ONYXKEYS.FORMS.ENTER_SINGER_INFO_FORM>
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            formID={ONYXKEYS.FORMS.ENTER_SINGER_INFO_FORM}
            formTitle={translate('signerInfoStep.whatsYourName')}
            validate={validate}
            onSubmit={handleSubmit}
            inputId={inputID}
            inputLabel={translate('signerInfoStep.fullName')}
            inputMode={CONST.INPUT_MODE.TEXT}
            defaultValue={defaultValue}
            shouldShowHelpLinks={false}
            shouldDelayAutoFocus
        />
    );
}

export default Name;
