import React from 'react';
import DateOfBirthStep from '@components/SubStepForms/DateOfBirthStep';
import useEnterSignerInfoStepFormSubmit from '@hooks/useEnterSignerInfoStepFormSubmit';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import WhyLink from '@pages/ReimbursementAccount/WhyLink';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/EnterSignerInfoForm';

function DateOfBirth({onNext, onMove, isEditing}: SubStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const inputID = INPUT_IDS.SIGNER_DATE_OF_BIRTH;
    const [enterSignerInfoFormDraft] = useOnyx(ONYXKEYS.FORMS.ENTER_SINGER_INFO_FORM_DRAFT, {canBeMissing: false});
    const defaultValue = enterSignerInfoFormDraft?.[inputID] ?? '';

    const handleSubmit = useEnterSignerInfoStepFormSubmit({
        fieldIds: [inputID],
        onNext,
        shouldSaveDraft: isEditing,
    });

    return (
        <DateOfBirthStep<typeof ONYXKEYS.FORMS.ENTER_SINGER_INFO_FORM>
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            formID={ONYXKEYS.FORMS.ENTER_SINGER_INFO_FORM}
            formTitle={translate('signerInfoStep.whatsYourDOB')}
            onSubmit={handleSubmit}
            stepFields={[inputID]}
            dobInputID={inputID}
            dobDefaultValue={defaultValue}
            footerComponent={<WhyLink containerStyles={[styles.mt6]} />}
        />
    );
}

export default DateOfBirth;
