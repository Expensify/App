import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {ReportAction} from '@src/types/onyx';

const ACTION_IDS = {
    EMOJI_REACTION: 'emojiReaction',
    REPLY_IN_THREAD: 'replyInThread',
    MARK_AS_UNREAD: 'markAsUnread',
    EXPLAIN: 'explain',
    MARK_AS_READ: 'markAsRead',
    EDIT: 'edit',
    UNHOLD: 'unhold',
    HOLD: 'hold',
    JOIN_THREAD: 'joinThread',
    LEAVE_THREAD: 'leaveThread',
    COPY_URL: 'copyUrl',
    COPY_TO_CLIPBOARD: 'copyToClipboard',
    COPY_EMAIL: 'copyEmail',
    COPY_MESSAGE: 'copyMessage',
    COPY_LINK: 'copyLink',
    PIN: 'pin',
    UNPIN: 'unpin',
    FLAG_AS_OFFENSIVE: 'flagAsOffensive',
    DOWNLOAD: 'download',
    COPY_ONYX_DATA: 'copyOnyxData',
    DEBUG: 'debug',
    DELETE: 'delete',
    OVERFLOW_MENU: 'overflowMenu',
} as const;

type ActionID = ValueOf<typeof ACTION_IDS>;

function getActionHtml(reportAction: OnyxEntry<ReportAction>): string {
    const message = Array.isArray(reportAction?.message) ? (reportAction?.message?.at(-1) ?? null) : (reportAction?.message ?? null);
    return message?.html ?? '';
}

const RESTRICTED_READONLY_ACTION_IDS = new Set<ActionID>([ACTION_IDS.REPLY_IN_THREAD, ACTION_IDS.EDIT, ACTION_IDS.JOIN_THREAD, ACTION_IDS.DELETE]);

export {ACTION_IDS, RESTRICTED_READONLY_ACTION_IDS, getActionHtml};
export type {ActionID};
