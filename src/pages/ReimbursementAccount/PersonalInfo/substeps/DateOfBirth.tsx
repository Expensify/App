import React from 'react';
import {useOnyx} from 'react-native-onyx';
import DateOfBirthStep from '@components/SubStepForms/DateOfBirthStep';
import useLocalize from '@hooks/useLocalize';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import HelpLinks from '@pages/ReimbursementAccount/PersonalInfo/HelpLinks';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

const PERSONAL_INFO_DOB_KEY = INPUT_IDS.PERSONAL_INFO_STEP.DOB;
const STEP_FIELDS = [PERSONAL_INFO_DOB_KEY];

function DateOfBirth({onNext, onMove, isEditing}: SubStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);

    const dobDefaultValue = reimbursementAccount?.achData?.[PERSONAL_INFO_DOB_KEY] ?? reimbursementAccountDraft?.[PERSONAL_INFO_DOB_KEY] ?? '';

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: isEditing,
    });

    return (
        <DateOfBirthStep<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            formTitle={translate('personalInfoStep.enterYourDateOfBirth')}
            onSubmit={handleSubmit}
            stepFields={STEP_FIELDS}
            dobInputID={PERSONAL_INFO_DOB_KEY}
            dobDefaultValue={dobDefaultValue}
            footerComponent={<HelpLinks containerStyles={[styles.mt5]} />}
        />
    );
}

DateOfBirth.displayName = 'DateOfBirth';

export default DateOfBirth;
