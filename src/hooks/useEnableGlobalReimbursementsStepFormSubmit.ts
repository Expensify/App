import type {FormOnyxKeys} from '@components/Form/types';
import type {OnyxFormKey} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import useStepFormSubmit from './useStepFormSubmit';
import type {SubPageProps} from './useSubPage/types';

type UseEnableGlobalReimbursementsStepFormSubmit = Pick<SubPageProps, 'onNext'> & {
    formId?: OnyxFormKey;
    fieldIds: Array<FormOnyxKeys<typeof ONYXKEYS.FORMS.ENABLE_GLOBAL_REIMBURSEMENTS>>;
    shouldSaveDraft: boolean;
};

/**
 * Hook for handling submit method in EnterSignerInfo subpages.
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
