import type {FormOnyxKeys, FormOnyxValues} from '@components/Form/types';

import * as FormActions from '@userActions/FormActions';

import type {OnyxFormKey, OnyxFormValuesMapping} from '@src/ONYXKEYS';

import type {SubStepProps} from './useSubStep/types';

type UseStepFormSubmitParams = Pick<SubStepProps, 'onNext'> & {
    formId: OnyxFormKey;
    fieldIds: ReadonlyArray<string | number | symbol>;
    shouldSaveDraft: boolean;
};

/**
 * Non-generic implementation so OXC's React Compiler can memoize the hook.
 * OXC bails on type params inside hooks ("Unsupported declaration type for hoisting").
 */
function useStepFormSubmitImpl({formId, onNext, fieldIds, shouldSaveDraft}: UseStepFormSubmitParams) {
    return (values: Record<string, unknown>) => {
        if (shouldSaveDraft) {
            const stepValues = fieldIds.reduce<Record<string, unknown>>((acc, key) => {
                acc[String(key)] = values[String(key)];
                return acc;
            }, {});

            FormActions.setDraftValues(formId, stepValues);
            onNext(stepValues);
            return;
        }

        onNext();
    };
}

type UseStepFormSubmitParamsGeneric<T extends keyof OnyxFormValuesMapping> = Pick<SubStepProps, 'onNext'> & {
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
export default function useStepFormSubmit<T extends keyof OnyxFormValuesMapping>({formId, onNext, fieldIds, shouldSaveDraft}: UseStepFormSubmitParamsGeneric<T>) {
    return useStepFormSubmitImpl({formId, onNext, fieldIds, shouldSaveDraft}) as (values: FormOnyxValues<T>) => void;
}
