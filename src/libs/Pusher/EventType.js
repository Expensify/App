/**
 * See https://github.com/Expensify/Web-Expensify/tree/main/lib/Push/Event for the various
 * types of Pusher events sent by our API.
 */
export default {
    REPORT_COMMENT: 'reportComment',
    REPORT_COMMENT_CHUNK: 'chunked-reportComment',
    REPORT_COMMENT_EDIT_CHUNK: 'chunked-reportCommentEdit',
    REPORT_COMMENT_EDIT: 'reportCommentEdit',
    REPORT_TOGGLE_PINNED: 'reportTogglePinned',
    PREFERRED_LOCALE: 'preferredLocale',
    EXPENSIFY_CARD_UPDATE: 'expensifyCardUpdate',
    SCREEN_SHARE_REQUEST: 'screenshareRequest',
    ONYX_API_UPDATE: 'onyxApiUpdate',
    ONYX_API_UPDATE_CHUNK: 'chunked-onyxApiUpdate',
};
