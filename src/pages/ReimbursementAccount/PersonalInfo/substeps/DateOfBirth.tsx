import React from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import type {FormOnyxKeys, FormOnyxValues} from '@components/Form/types';
import DateOfBirthStep from '@components/SubStepForms/DateOfBirthStep';
import useLocalize from '@hooks/useLocalize';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxFormValuesMapping} from '@src/ONYXKEYS';
import type {ReimbursementAccountForm} from '@src/types/form';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import type {ReimbursementAccount} from '@src/types/onyx';

type DateOfBirthOnyxProps = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;

    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: OnyxEntry<ReimbursementAccountForm>;
};

type DateOfBirthProps = DateOfBirthOnyxProps & SubStepProps;

const PERSONAL_INFO_DOB_KEY = INPUT_IDS.PERSONAL_INFO_STEP.DOB;
const STEP_FIELDS = [PERSONAL_INFO_DOB_KEY] as Array<FormOnyxKeys<keyof OnyxFormValuesMapping>>;

function DateOfBirth({reimbursementAccount, reimbursementAccountDraft, onNext, onMove, isEditing}: DateOfBirthProps) {
    const {translate} = useLocalize();

    const dobDefaultValue = reimbursementAccount?.achData?.[PERSONAL_INFO_DOB_KEY] ?? reimbursementAccountDraft?.[PERSONAL_INFO_DOB_KEY] ?? '';

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: isEditing,
    }) as (values: FormOnyxValues<keyof OnyxFormValuesMapping>) => void;

    return (
        <DateOfBirthStep
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            formTitle={translate('personalInfoStep.enterYourDateOfBirth')}
            onSubmit={handleSubmit}
            stepFields={STEP_FIELDS}
            dobInputID={PERSONAL_INFO_DOB_KEY as keyof FormOnyxValues}
            dobDefaultValue={dobDefaultValue}
        />
    );
}

DateOfBirth.defaultName = 'DateOfBirth';

export default withOnyx<DateOfBirthProps, DateOfBirthOnyxProps>({
    // @ts-expect-error: ONYXKEYS.REIMBURSEMENT_ACCOUNT is conflicting with ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
    reimbursementAccountDraft: {
        key: ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT,
    },
})(DateOfBirth);
