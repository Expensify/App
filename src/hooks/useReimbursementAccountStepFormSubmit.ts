import {useCallback} from 'react';
import * as FormActions from '@userActions/FormActions';
import type {OnyxFormKeyWithoutDraft} from '@userActions/FormActions';
import ONYXKEYS from '@src/ONYXKEYS';
import type {FormValues} from '@src/types/onyx/Form';
import type {SubStepProps} from './useSubStep/types';

type UseReimbursementAccountStepFormSubmitParams = Pick<SubStepProps, 'isEditing' | 'onNext'> & {
    formId?: OnyxFormKeyWithoutDraft;
    fieldIds: Array<keyof FormValues>;
};

export default function useReimbursementAccountStepFormSubmit({formId = ONYXKEYS.REIMBURSEMENT_ACCOUNT, isEditing, onNext, fieldIds}: UseReimbursementAccountStepFormSubmitParams) {
    return useCallback(
        (values: FormValues) => {
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
