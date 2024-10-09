import type {FormOnyxKeys} from '@components/Form/types';
import type {OnyxFormKey} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import useStepFormSubmit from './useStepFormSubmit';
import type {SubStepProps} from './useSubStep/types';

type UsePersonalDetailsFormSubmitParams = Pick<SubStepProps, 'onNext'> & {
    formId?: OnyxFormKey;
    fieldIds: Array<FormOnyxKeys<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM>>;
    shouldSaveDraft: boolean;
};

/**
 * Hook for handling submit method in Missing Personal Details substeps.
 * When user is in editing mode, we should save values only when user confirms the change
 * @param onNext - callback
 * @param fieldIds - field IDs for particular step
 * @param shouldSaveDraft - if we should save draft values
 */
export default function usePersonalDetailsFormSubmit({onNext, fieldIds, shouldSaveDraft}: UsePersonalDetailsFormSubmitParams) {
    return useStepFormSubmit<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM>({
        formId: ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM,
        onNext,
        fieldIds,
        shouldSaveDraft,
    });
}
