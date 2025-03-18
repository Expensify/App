import type {FormOnyxKeys} from '@components/Form/types';
import type {OnyxFormKey} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import useStepFormSubmit from './useStepFormSubmit';
import type {SubStepProps} from './useSubStep/types';

type UseNetSuiteImportAddCustomSegmentFormSubmitParams = Pick<SubStepProps, 'onNext'> & {
    formId?: OnyxFormKey;
    fieldIds: Array<FormOnyxKeys<typeof ONYXKEYS.FORMS.NETSUITE_CUSTOM_SEGMENT_ADD_FORM>>;
    shouldSaveDraft: boolean;
};

/**
 * Hook for handling submit method in NetSuite Custom Segment substeps.
 * When user is in editing mode, we should save values only when user confirms the change
 * @param onNext - callback
 * @param fieldIds - field IDs for particular step
 * @param shouldSaveDraft - if we should save draft values
 */
export default function useNetSuiteImportAddCustomSegmentFormSubmit({onNext, fieldIds, shouldSaveDraft}: UseNetSuiteImportAddCustomSegmentFormSubmitParams) {
    return useStepFormSubmit<typeof ONYXKEYS.FORMS.NETSUITE_CUSTOM_SEGMENT_ADD_FORM>({
        formId: ONYXKEYS.FORMS.NETSUITE_CUSTOM_SEGMENT_ADD_FORM,
        onNext,
        fieldIds,
        shouldSaveDraft,
    });
}
