import {useCallback} from 'react';
import * as FormActions from '@userActions/FormActions';
import type {OnyxFormKeyWithoutDraft} from '@userActions/FormActions';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReimbursementAccountDraftValues} from '@src/types/onyx/ReimbursementAccountDraft';
import type {SubStepProps} from './useSubStep/types';

type UseReimbursementAccountStepFormSubmitParams = Pick<SubStepProps, 'isEditing' | 'onNext'> & {
    formId?: OnyxFormKeyWithoutDraft;
    fieldIds: Array<keyof ReimbursementAccountDraftValues>;
};

export default function useReimbursementAccountStepFormSubmit({
    formId = ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM,
    isEditing,
    onNext,
    fieldIds,
}: UseReimbursementAccountStepFormSubmitParams) {
    return useCallback(
        (values: ReimbursementAccountDraftValues) => {
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
