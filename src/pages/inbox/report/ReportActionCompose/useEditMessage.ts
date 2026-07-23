import type {ComposerRef} from '@components/Composer/types';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useReportScrollManager from '@hooks/useReportScrollManager';

import {clearAllReportActionDrafts, editReportComment} from '@libs/actions/Report';
import {isArchivedReport} from '@libs/ReportUtils';

import * as ReportActionContextMenu from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import {useReportActionActiveEditActions} from '@pages/inbox/report/ReportActionEditMessageContext';
import {draftMessageVideoAttributeCache} from '@pages/inbox/report/useDraftMessageVideoAttributeCache';

import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

// eslint-disable-next-line lodash/import-scope
import type {DebouncedFuncLeading} from 'lodash';
import type React from 'react';

import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';

import getOriginalReportIDSync from './getOriginalReportIDSync';

type UseEditMessageProps = {
    /** The report ID */
    reportID: string | undefined;
    /** The report action */
    reportAction: OnyxTypes.ReportAction | null | undefined;
    /** Whether to scroll to the last message */
    shouldScrollToLastMessage?: boolean;
    /** The debounced comment max length validation */
    debouncedCommentMaxLengthValidation: DebouncedFuncLeading<(value: string) => boolean>;
    /** The ref to the composer */
    composerRef: React.RefObject<ComposerRef | null>;
};

/**
 * Delete the draft of the comment being edited. This will take the comment out of "edit mode" with the old content.
 */
function useEditMessage({reportID, reportAction, shouldScrollToLastMessage = false, debouncedCommentMaxLengthValidation, composerRef}: UseEditMessageProps) {
    const reportScrollManager = useReportScrollManager();

    const {email} = useCurrentUserPersonalDetails();

    const {stopEditing, submitEdit} = useReportActionActiveEditActions();

    function deleteDraft(): void {
        if (!reportAction) {
            return;
        }

        stopEditing();

        clearAllReportActionDrafts();

        // Scroll to the last comment after editing to make sure the whole comment is clearly visible in the report.
        if (shouldScrollToLastMessage) {
            reportScrollManager.scrollToIndex(0);
        }
    }

    /**
     * Save the draft of the comment to be the new comment message. This will take the comment out of "edit mode" with
     * the new content.
     */
    function publishDraft(draftMessage: string) {
        console.log('publishDraft', draftMessage);
        if (!reportAction) {
            return;
        }

        // Do nothing if draft exceed the character limit
        if (debouncedCommentMaxLengthValidation.flush() === false) {
            return;
        }

        const trimmedNewDraft = draftMessage.trim();

        const actionOwnerReportID = getOriginalReportIDSync(reportID, reportAction) ?? reportID;

        // When user tries to save the empty message, it will delete it. Prompt the user to confirm deleting.
        if (!trimmedNewDraft) {
            composerRef.current?.blur();
            ReportActionContextMenu.showDeleteModal(actionOwnerReportID, reportAction, true, deleteDraft, () => requestIdleCallback(() => composerRef.current?.focus()));
            return;
        }

        submitEdit();

        const originalReport = OnyxUtils.get(`${ONYXKEYS.COLLECTION.REPORT}${actionOwnerReportID}` as const);
        const isOriginalReportArchived = !!isArchivedReport(OnyxUtils.get(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${actionOwnerReportID}` as const));
        const personalDetails = OnyxUtils.get(ONYXKEYS.PERSONAL_DETAILS_LIST);
        editReportComment(originalReport, reportAction, trimmedNewDraft, isOriginalReportArchived, email ?? '', personalDetails, Object.fromEntries(draftMessageVideoAttributeCache));
        deleteDraft();
    }

    return {publishDraft, deleteDraft};
}

export default useEditMessage;
