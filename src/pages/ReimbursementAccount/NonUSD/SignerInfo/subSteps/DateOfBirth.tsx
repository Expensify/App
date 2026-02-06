import React from 'react';
import DateOfBirthStep from '@components/SubStepForms/DateOfBirthStep';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import WhyLink from '@pages/ReimbursementAccount/WhyLink';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

type DateOfBirthProps = SubStepProps;

const {SIGNER_DATE_OF_BIRTH} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;

function DateOfBirth({onNext, onMove, isEditing}: DateOfBirthProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const inputID = SIGNER_DATE_OF_BIRTH;
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: false});
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, {canBeMissing: true});
    const defaultValue = reimbursementAccount?.achData?.corpay?.[inputID] ?? reimbursementAccountDraft?.[inputID] ?? '';

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: [inputID],
        onNext,
        shouldSaveDraft: isEditing,
    });

    return (
        <DateOfBirthStep<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
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
