import type {ActionDescriptor} from './actions/ActionDescriptor';
import {
    useCopyEmailAction,
    useCopyLinkAction,
    useCopyMessageAction,
    useCopyOnyxDataAction,
    useCopyToClipboardAction,
    useCopyURLAction,
    useDebugAction,
    useDeleteAction,
    useDownloadAction,
    useEditAction,
    useExplainAction,
    useFlagAsOffensiveAction,
    useHoldAction,
    useJoinThreadAction,
    useLeaveThreadAction,
    useMarkAsReadAction,
    useMarkAsUnreadAction,
    usePinAction,
    useReplyInThreadAction,
    useUnholdAction,
    useUnpinAction,
} from './actions/ContextMenuAction';

/**
 * Aggregates all individual context menu action hooks into a single ordered array.
 * Each hook is always called (rules of hooks), and returns null when it shouldn't be shown.
 * The returned array contains only the visible actions, in display order.
 */
function useContextMenuActions(visibleActionIDs: Set<string>): ActionDescriptor[] {
    const replyInThread = useReplyInThreadAction();
    const markAsUnread = useMarkAsUnreadAction();
    const explain = useExplainAction();
    const markAsRead = useMarkAsReadAction();
    const edit = useEditAction();
    const unhold = useUnholdAction();
    const hold = useHoldAction();
    const joinThread = useJoinThreadAction();
    const leaveThread = useLeaveThreadAction();
    const copyUrl = useCopyURLAction();
    const copyToClipboard = useCopyToClipboardAction();
    const copyEmail = useCopyEmailAction();
    const copyMessage = useCopyMessageAction();
    const copyLink = useCopyLinkAction();
    const pin = usePinAction();
    const unpin = useUnpinAction();
    const flagAsOffensive = useFlagAsOffensiveAction();
    const download = useDownloadAction();
    const copyOnyxData = useCopyOnyxDataAction();
    const debug = useDebugAction();
    const deleteAction = useDeleteAction();

    const allActions = [
        replyInThread,
        markAsUnread,
        explain,
        markAsRead,
        edit,
        unhold,
        hold,
        joinThread,
        leaveThread,
        copyUrl,
        copyToClipboard,
        copyEmail,
        copyMessage,
        copyLink,
        pin,
        unpin,
        flagAsOffensive,
        download,
        copyOnyxData,
        debug,
        deleteAction,
    ];

    return allActions.filter((action): action is ActionDescriptor => action !== null && visibleActionIDs.has(action.id));
}

export default useContextMenuActions;
