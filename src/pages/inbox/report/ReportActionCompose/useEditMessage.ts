// eslint-disable-next-line lodash/import-scope
import type {DebouncedFuncLeading} from 'lodash';
import type React from 'react';
import type {ComposerRef} from '@components/Composer/types';
import useAncestors from '@hooks/useAncestors';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useReportScrollManager from '@hooks/useReportScrollManager';
import {clearReportActionDrafts, editReportComment} from '@libs/actions/Report';
import focusEditAfterCancelDelete from '@libs/focusEditAfterCancelDelete';
import {getOriginalReportID} from '@libs/ReportUtils';
import * as ReportActionContextMenu from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import {useReportActionActiveEditActions} from '@pages/inbox/report/ReportActionEditMessageContext';
import {draftMessageVideoAttributeCache} from '@pages/inbox/report/useDraftMessageVideoAttributeCache';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

type UseEditMessageProps = {
    reportID: string | undefined;
    originalReportID: string | undefined;
    reportAction: OnyxTypes.ReportAction | null | undefined;
    shouldScrollToLastMessage?: boolean;
    debouncedCommentMaxLengthValidation: DebouncedFuncLeading<(value: string) => boolean>;
    composerRef: React.RefObject<ComposerRef | null>;
};

/**
 * Delete the draft of the comment being edited. This will take the comment out of "edit mode" with the old content.
 */
function useEditMessage({reportID, originalReportID, reportAction, shouldScrollToLastMessage = false, debouncedCommentMaxLengthValidation, composerRef}: UseEditMessageProps) {
    const reportScrollManager = useReportScrollManager();

    const {email} = useCurrentUserPersonalDetails();
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`);
    const [visibleReportActionsData] = useOnyx(ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS);
    const originalParentReportID = getOriginalReportID(originalReportID, reportAction, reportActions);
    const [originalReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${originalReportID}`);
    const isOriginalReportArchived = useReportIsArchived(originalReportID);
    const isOriginalParentReportArchived = useReportIsArchived(originalParentReportID);
    const ancestors = useAncestors(originalReport);

    const {stopEditing, submitEdit} = useReportActionActiveEditActions();

    function deleteDraft(): void {
        if (!reportAction) {
            return;
        }

        stopEditing();

        clearReportActionDrafts();

        // Scroll to the last comment after editing to make sure the whole comment is clearly visible in the report.
        if (shouldScrollToLastMessage) {
            reportScrollManager.scrollToIndex(0, false);
        }
    }

    /**
     * Save the draft of the comment to be the new comment message. This will take the comment out of "edit mode" with
     * the new content.
     */
    function publishDraft(draftMessage: string) {
        if (!reportAction) {
            return;
        }

        // Do nothing if draft exceed the character limit
        if (!debouncedCommentMaxLengthValidation.flush()) {
            return;
        }

        const trimmedNewDraft = draftMessage.trim();

        // When user tries to save the empty message, it will delete it. Prompt the user to confirm deleting.
        if (!trimmedNewDraft) {
            composerRef.current?.blur();
            ReportActionContextMenu.showDeleteModal(originalReportID ?? reportID, reportAction, true, deleteDraft, () => focusEditAfterCancelDelete(composerRef.current));
            return;
        }

        submitEdit();

        editReportComment(
            originalReport,
            reportAction,
            ancestors,
            trimmedNewDraft,
            isOriginalReportArchived,
            isOriginalParentReportArchived,
            email ?? '',
            Object.fromEntries(draftMessageVideoAttributeCache),
            visibleReportActionsData,
        );
        deleteDraft();
    }

    return {publishDraft, deleteDraft};
}

export default useEditMessage;
