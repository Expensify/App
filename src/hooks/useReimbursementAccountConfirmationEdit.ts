import type {SubPageProps} from '@hooks/useSubPage/types';

import {cancelReimbursementAccountEdit, finishReimbursementAccountEdit, startReimbursementAccountEdit} from '@userActions/ReimbursementAccount';

import type {ReimbursementAccountForm} from '@src/types/form';

import type {OnyxEntry} from 'react-native-onyx';

type UseReimbursementAccountConfirmationEditParams = {
    isEditing: boolean;
    reimbursementAccountDraft: OnyxEntry<ReimbursementAccountForm>;
    nextPage: SubPageProps['onNext'];
    moveTo: SubPageProps['onMove'];
};

/**
 * Preserves the draft before opening a confirmation-page edit, commits it on Confirm, and restores it on Back.
 */
export default function useReimbursementAccountConfirmationEdit({isEditing, reimbursementAccountDraft, nextPage, moveTo}: UseReimbursementAccountConfirmationEditParams) {
    const moveToEditPage = (step: number, turnOnEditMode?: boolean) => {
        if (turnOnEditMode === false) {
            if (isEditing) {
                finishReimbursementAccountEdit();
            }
        } else if (!isEditing) {
            startReimbursementAccountEdit(reimbursementAccountDraft);
        }
        moveTo(step, turnOnEditMode);
    };

    const submitEdit = (data?: unknown) => {
        if (isEditing) {
            finishReimbursementAccountEdit();
        }
        nextPage(data);
    };

    const cancelEdit = () => {
        cancelReimbursementAccountEdit(reimbursementAccountDraft?.editDraftSnapshot);
    };

    return {moveToEditPage, submitEdit, cancelEdit};
}
