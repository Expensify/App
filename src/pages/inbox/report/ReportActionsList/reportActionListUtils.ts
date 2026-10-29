/** Stable row keys and measurement groups let LegendList recycle report actions without remounting them. */
import {getReportActionMessage} from '@libs/ReportActionsUtils';

import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

const REPORT_ACTION_COMMENT_SIZE = {
    SHORT: 'short',
    MEDIUM: 'medium',
    LONG: 'long',
    EXTRA_LONG: 'extra-long',
} as const;

// Character-count boundaries used to bucket comments so LegendList can recycle similarly sized items.
const REPORT_ACTION_COMMENT_SHORT_MAX_LENGTH = 80;
const REPORT_ACTION_COMMENT_MEDIUM_MAX_LENGTH = 320;
const REPORT_ACTION_COMMENT_LONG_MAX_LENGTH = 1200;

function getReportActionItemType(item: OnyxTypes.ReportAction): string {
    if (item.actionName !== CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT) {
        return item.actionName;
    }

    const message = getReportActionMessage(item);
    const commentSize = getReportActionCommentSize(message?.text.length ?? 0);

    if (item.isAttachmentOnly) {
        return `${item.actionName}-attachment`;
    }
    if (item.isAttachmentWithText) {
        return `${item.actionName}-attachment-${commentSize}`;
    }
    if (item.linkMetadata?.length) {
        return `${item.actionName}-link-preview-${commentSize}`;
    }
    return `${item.actionName}-${commentSize}`;
}

/**
 * Create a unique key for each action in the list.
 * We use the reportActionID that is a string representation of a random 64-bit int, which should be
 * random enough to avoid collisions
 */
function getReportActionKey(item: OnyxTypes.ReportAction): string {
    // A report has exactly one CREATED action. Using a stable key lets the list recycle the same cell
    // when the optimistic CREATED is swapped for the server one, avoiding a remount-induced scroll jump.
    if (item.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED) {
        return CONST.REPORT.ACTIONS.TYPE.CREATED;
    }
    return item.reportActionID;
}

function getReportActionCommentSize(messageLength: number): string {
    if (messageLength <= REPORT_ACTION_COMMENT_SHORT_MAX_LENGTH) {
        return REPORT_ACTION_COMMENT_SIZE.SHORT;
    }
    if (messageLength <= REPORT_ACTION_COMMENT_MEDIUM_MAX_LENGTH) {
        return REPORT_ACTION_COMMENT_SIZE.MEDIUM;
    }
    if (messageLength <= REPORT_ACTION_COMMENT_LONG_MAX_LENGTH) {
        return REPORT_ACTION_COMMENT_SIZE.LONG;
    }
    return REPORT_ACTION_COMMENT_SIZE.EXTRA_LONG;
}

export {getReportActionItemType, getReportActionKey};
