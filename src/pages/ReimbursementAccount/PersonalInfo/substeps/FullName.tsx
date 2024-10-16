import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import type {FormOnyxKeys, FormOnyxValues} from '@components/Form/types';
import FullNameStep from '@components/SubStepForms/FullNameStep';
import useLocalize from '@hooks/useLocalize';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxFormValuesMapping} from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import type {ReimbursementAccount} from '@src/types/onyx';

type FullNameOnyxProps = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;
};

type FullNameProps = FullNameOnyxProps & SubStepProps;

const PERSONAL_INFO_STEP_KEY = INPUT_IDS.PERSONAL_INFO_STEP;
const STEP_FIELDS = [PERSONAL_INFO_STEP_KEY.FIRST_NAME, PERSONAL_INFO_STEP_KEY.LAST_NAME] as Array<FormOnyxKeys<keyof OnyxFormValuesMapping>>;

function FullName({reimbursementAccount, onNext, onMove, isEditing}: FullNameProps) {
    const {translate} = useLocalize();

    const defaultValues = {
        firstName: reimbursementAccount?.achData?.[PERSONAL_INFO_STEP_KEY.FIRST_NAME] ?? '',
        lastName: reimbursementAccount?.achData?.[PERSONAL_INFO_STEP_KEY.LAST_NAME] ?? '',
    };

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: isEditing,
    }) as (values: FormOnyxValues<keyof OnyxFormValuesMapping>) => void;

    return (
        <FullNameStep
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            formTitle={translate('personalInfoStep.enterYourLegalFirstAndLast')}
            onSubmit={handleSubmit}
            stepFields={STEP_FIELDS}
            firstNameInputID={PERSONAL_INFO_STEP_KEY.FIRST_NAME as keyof FormOnyxValues}
            lastNameInputID={PERSONAL_INFO_STEP_KEY.LAST_NAME as keyof FormOnyxValues}
            defaultValues={defaultValues}
        />
    );
}

FullName.defaultName = 'FullName';

export default withOnyx<FullNameProps, FullNameOnyxProps>({
    // @ts-expect-error: ONYXKEYS.REIMBURSEMENT_ACCOUNT is conflicting with ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
})(FullName);
