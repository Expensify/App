import {useCallback} from 'react';
import type {FormOnyxKeys, FormOnyxValues} from '@components/Form/types';
import * as FormActions from '@userActions/FormActions';
import type {OnyxFormKey} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SubStepProps} from './useSubStep/types';

type UseReimbursementAccountStepFormSubmitParams = Pick<SubStepProps, 'isEditing' | 'onNext'> & {
    formId?: OnyxFormKey;
    fieldIds: Array<FormOnyxKeys<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>>;
};

/**
 * Hook for handling submit method in ReimbursementAccount substeps.
 * When user is in editing mode we should save values only when user confirm that
 * @param formId - ID for particular form
 * @param isEditing - if form is in editing mode
 * @param onNext - callback
 * @param fieldIds - field IDs for particular step
 */
export default function useReimbursementAccountStepFormSubmit({
    formId = ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM,
    isEditing,
    onNext,
    fieldIds,
}: UseReimbursementAccountStepFormSubmitParams) {
    return useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>) => {
            if (isEditing) {
                const stepValues = fieldIds.reduce(
                    (acc, key) => ({
                        ...acc,
                        [key]: values[key],
                    }),
                    {},
                );

                FormActions.setDraftValues(formId, stepValues);
            }

            onNext();
        },
        [isEditing, onNext, formId, fieldIds],
    );
}
