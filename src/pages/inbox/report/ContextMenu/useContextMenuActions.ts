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
import type {ContextMenuPayloadContextValue} from './ContextMenuPayloadProvider';

/**
 * Aggregates all individual context menu action hooks into a single ordered array.
 * Each hook is always called (rules of hooks), and returns null when it shouldn't be shown.
 * The returned array contains only the visible actions, in display order.
 */
function useContextMenuActions(visibleActionIDs: Set<string>, payloadOverride?: ContextMenuPayloadContextValue): ActionDescriptor[] {
    const replyInThread = useReplyInThreadAction(payloadOverride);
    const markAsUnread = useMarkAsUnreadAction(payloadOverride);
    const explain = useExplainAction(payloadOverride);
    const markAsRead = useMarkAsReadAction(payloadOverride);
    const edit = useEditAction(payloadOverride);
    const unhold = useUnholdAction(payloadOverride);
    const hold = useHoldAction(payloadOverride);
    const joinThread = useJoinThreadAction(payloadOverride);
    const leaveThread = useLeaveThreadAction(payloadOverride);
    const copyUrl = useCopyURLAction(payloadOverride);
    const copyToClipboard = useCopyToClipboardAction(payloadOverride);
    const copyEmail = useCopyEmailAction(payloadOverride);
    const copyMessage = useCopyMessageAction(payloadOverride);
    const copyLink = useCopyLinkAction(payloadOverride);
    const pin = usePinAction(payloadOverride);
    const unpin = useUnpinAction(payloadOverride);
    const flagAsOffensive = useFlagAsOffensiveAction(payloadOverride);
    const download = useDownloadAction(payloadOverride);
    const copyOnyxData = useCopyOnyxDataAction(payloadOverride);
    const debug = useDebugAction(payloadOverride);
    const deleteAction = useDeleteAction(payloadOverride);

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
