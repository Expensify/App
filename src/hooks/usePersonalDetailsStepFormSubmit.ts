import type {FormOnyxKeys} from '@components/Form/types';
import type {OnyxFormKey} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import useStepFormSubmit from './useStepFormSubmit';
import type {SubStepProps} from './useSubStep/types';

type UsePersonalDetailsStepFormSubmitParams = Pick<SubStepProps, 'onNext'> & {
    formId?: OnyxFormKey;
    fieldIds: Array<FormOnyxKeys<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM>>;
    shouldSaveDraft: boolean;
};

/**
 * Hook for handling submit method in MissingPersonalDetails substeps.
 * When user is in editing mode, we should save values only when user confirms the change
 * @param onNext - callback
 * @param fieldIds - field IDs for particular step
 * @param shouldSaveDraft - if we should save draft values
 */
export default function usePersonalDetailsStepFormSubmit({onNext, fieldIds, shouldSaveDraft}: UsePersonalDetailsStepFormSubmitParams) {
    return useStepFormSubmit<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM>({
        formId: ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM,
        onNext,
        fieldIds,
        shouldSaveDraft,
    });
}
