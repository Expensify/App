import type {FormOnyxKeys} from '@components/Form/types';
import type {OnyxFormKey} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import useStepFormSubmit from './useStepFormSubmit';
import type {SubStepProps} from './useSubStep/types';

type UseEnableGlobalReimbursementsStepFormSubmit = Pick<SubStepProps, 'onNext'> & {
    formId?: OnyxFormKey;
    fieldIds: Array<FormOnyxKeys<typeof ONYXKEYS.FORMS.ENABLE_GLOBAL_REIMBURSEMENTS>>;
    shouldSaveDraft: boolean;
};

/**
 * Hook for handling submit method in EnterSignerInfo substeps.
 * When user is in editing mode, we should save values only when user confirms the change
 * @param onNext - callback
 * @param fieldIds - field IDs for particular step
 * @param shouldSaveDraft - if we should save draft values
 */
export default function useEnableGlobalReimbursementsStepFormSubmit({onNext, fieldIds, shouldSaveDraft}: UseEnableGlobalReimbursementsStepFormSubmit) {
    return useStepFormSubmit<typeof ONYXKEYS.FORMS.ENABLE_GLOBAL_REIMBURSEMENTS>({
        formId: ONYXKEYS.FORMS.ENABLE_GLOBAL_REIMBURSEMENTS,
        onNext,
        fieldIds,
        shouldSaveDraft,
    });
}
