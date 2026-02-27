// eslint-disable-next-line lodash/import-scope
import type {DebouncedFuncLeading} from 'lodash';
import type React from 'react';
import {useEffect, useRef} from 'react';
import {InteractionManager} from 'react-native';
import type {ComposerRef} from '@components/Composer/types';
import useAncestors from '@hooks/useAncestors';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useReportScrollManager from '@hooks/useReportScrollManager';
import {isActive as isEmojiPickerActive} from '@libs/actions/EmojiPickerAction';
import {deleteReportActionDraft, editReportComment} from '@libs/actions/Report';
import focusEditAfterCancelDelete from '@libs/focusEditAfterCancelDelete';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {getOriginalReportID} from '@libs/ReportUtils';
import * as ReportActionContextMenu from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import {useReportActionActiveEdit} from '@pages/inbox/report/ReportActionEditMessageContext';
import {draftMessageVideoAttributeCache} from '@pages/inbox/report/useDraftMessageVideoAttributeCache';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import KeyboardUtils from '@src/utils/keyboard';

type UseEditMessageProps = {
    reportID: string | undefined;
    originalReportID: string | undefined;
    reportAction: OnyxTypes.ReportAction | null | undefined;
    shouldScrollToLastMessage?: boolean;
    isFocused: boolean;
    debouncedCommentMaxLengthValidation: DebouncedFuncLeading<(value: string) => boolean>;
    composerRef: React.RefObject<ComposerRef | null>;
};

/**
 * Delete the draft of the comment being edited. This will take the comment out of "edit mode" with the old content.
 */
function useEditMessage({reportID, originalReportID, reportAction, shouldScrollToLastMessage = false, isFocused, debouncedCommentMaxLengthValidation, composerRef}: UseEditMessageProps) {
    const reportScrollManager = useReportScrollManager();
    const isFocusedRef = useRef(isFocused);

    const {email} = useCurrentUserPersonalDetails();
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`);
    const [visibleReportActionsData] = useOnyx(ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS);
    const originalParentReportID = getOriginalReportID(originalReportID, reportAction, reportActions);
    const [originalReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${originalReportID}`);
    const isOriginalReportArchived = useReportIsArchived(originalReportID);
    const isOriginalParentReportArchived = useReportIsArchived(originalParentReportID);
    const ancestors = useAncestors(originalReport);

    const {didSubmitEditRef} = useReportActionActiveEdit();

    useEffect(() => {
        // required for keeping last state of isFocused variable
        isFocusedRef.current = isFocused;
    }, [isFocused]);

    // We consider the report action active if it's focused, its emoji picker is open or its context menu is open
    function isActive(): boolean {
        if (!reportAction) {
            return false;
        }

        return isFocusedRef.current || isEmojiPickerActive(reportAction.reportActionID) || ReportActionContextMenu.isActiveReportAction(reportAction.reportActionID);
    }

    function deleteDraft(): void {
        if (!reportAction) {
            return;
        }

        deleteReportActionDraft(reportID, reportAction);

        if (isActive()) {
            ReportActionComposeFocusManager.clear(true);
            // Wait for report action compose re-mounting on mWeb
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            InteractionManager.runAfterInteractions(() => ReportActionComposeFocusManager.focus());
        }

        // Scroll to the last comment after editing to make sure the whole comment is clearly visible in the report.
        if (shouldScrollToLastMessage) {
            KeyboardUtils.dismiss().then(() => {
                reportScrollManager.scrollToIndex(0, false);
            });
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

        didSubmitEditRef.current = true;

        const trimmedNewDraft = draftMessage.trim();

        // When user tries to save the empty message, it will delete it. Prompt the user to confirm deleting.
        if (!trimmedNewDraft) {
            composerRef.current?.blur();
            ReportActionContextMenu.showDeleteModal(originalReportID ?? reportID, reportAction, true, deleteDraft, () => focusEditAfterCancelDelete(composerRef.current));
            return;
        }

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
