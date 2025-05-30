import {useCallback} from 'react';
import type {TupleToUnion} from 'type-fest';
import type {FormOnyxKeys, FormOnyxValues} from '@components/Form/types';
import * as FormActions from '@userActions/FormActions';
import type {OnyxFormKey, OnyxFormValuesMapping, OnyxValues} from '@src/ONYXKEYS';
import type {BaseForm} from '@src/types/form/Form';
import type {SubStepProps} from './useSubStep/types';

type UseStepFormSubmitParams<T extends keyof OnyxFormValuesMapping> = Pick<SubStepProps, 'onNext'> & {
    formId: OnyxFormKey;
    fieldIds: Array<FormOnyxKeys<T>>;
    shouldSaveDraft: boolean;
};

/**
 * Hook for handling submit method in substeps.
 * When user is in editing mode, we should save values only when user confirms the change
 * @param formId - ID for particular form
 * @param onNext - callback
 * @param fieldIds - field IDs for particular step
 * @param shouldSaveDraft - if we should save draft values
 */
export default function useStepFormSubmit<T extends keyof OnyxFormValuesMapping>({formId, onNext, fieldIds, shouldSaveDraft}: UseStepFormSubmitParams<T>) {
    return useCallback(
        (values: FormOnyxValues<T>) => {
            if (shouldSaveDraft) {
                const stepValues = fieldIds.reduce((acc, key) => {
                    acc[key] = values[key];
                    return acc;
                }, {} as Record<TupleToUnion<typeof fieldIds>, OnyxValues[T][Exclude<keyof OnyxValues[T], keyof BaseForm>]>);

                FormActions.setDraftValues(formId, stepValues);
                onNext(stepValues);
                return;
            }

            onNext();
        },
        [onNext, formId, fieldIds, shouldSaveDraft],
    );
}
