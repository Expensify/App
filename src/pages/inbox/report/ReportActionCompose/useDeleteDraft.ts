import {useEffect, useRef} from 'react';
import {InteractionManager} from 'react-native';
import useReportScrollManager from '@hooks/useReportScrollManager';
import {isActive as isEmojiPickerActive} from '@libs/actions/EmojiPickerAction';
import {deleteReportActionDraft} from '@libs/actions/Report';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import * as ReportActionContextMenu from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import type * as OnyxTypes from '@src/types/onyx';
import KeyboardUtils from '@src/utils/keyboard';

type UseDeleteDraftProps = {
    reportID: string | undefined;
    reportAction: OnyxTypes.ReportAction | null | undefined;
    index: number;
    isFocused: boolean;
};

/**
 * Delete the draft of the comment being edited. This will take the comment out of "edit mode" with the old content.
 */
function useDeleteDraft({reportID, reportAction, index, isFocused}: UseDeleteDraftProps) {
    const reportScrollManager = useReportScrollManager();
    const isFocusedRef = useRef(isFocused);

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
        if (index === 0) {
            KeyboardUtils.dismiss().then(() => {
                reportScrollManager.scrollToIndex(index, false);
            });
        }
    }

    return deleteDraft;
}

export default useDeleteDraft;
