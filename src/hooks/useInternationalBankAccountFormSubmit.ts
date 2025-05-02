import type {FormOnyxKeys} from '@components/Form/types';
import type {OnyxFormKey} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import useStepFormSubmit from './useStepFormSubmit';
import type {SubStepProps} from './useSubStep/types';

type UseInternationalBankAccountFormSubmitParams = Pick<SubStepProps, 'onNext'> & {
    formId?: OnyxFormKey;
    fieldIds: Array<FormOnyxKeys<typeof ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM>>;
    shouldSaveDraft: boolean;
};

/**
 * Hook for handling submit method in Missing Personal Details substeps.
 * When user is in editing mode, we should save values only when user confirms the change
 * @param onNext - callback
 * @param fieldIds - field IDs for particular step
 * @param shouldSaveDraft - if we should save draft values
 */
export default function useInternationalBankAccountFormSubmit({onNext, fieldIds, shouldSaveDraft}: UseInternationalBankAccountFormSubmitParams) {
    return useStepFormSubmit<typeof ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM>({
        formId: ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM,
        onNext,
        fieldIds,
        shouldSaveDraft,
    });
}
