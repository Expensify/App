import type {MutableRefObject} from 'react';
import {useEffect} from 'react';
import {hideContextMenu, hideDeleteModal, isActiveReportAction} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import {hideEmojiPicker, isActive} from '@userActions/EmojiPickerAction';

type ReactionListRef = MutableRefObject<{
    isActiveReportAction: (reportActionID: string) => boolean;
    hideReactionList: () => void;
} | null>;

function useActionCleanup(actionID: string, reactionListRef: ReactionListRef | null) {
    useEffect(
        () => () => {
            if (isActiveReportAction(actionID)) {
                hideContextMenu();
                hideDeleteModal();
            }
            if (isActive(actionID)) {
                hideEmojiPicker(true);
            }
            if (reactionListRef?.current?.isActiveReportAction(actionID)) {
                reactionListRef?.current?.hideReactionList();
            }
        },
        [actionID, reactionListRef],
    );
}

export default useActionCleanup;
