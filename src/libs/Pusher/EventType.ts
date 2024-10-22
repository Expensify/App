/**
 * See https://github.com/Expensify/Web-Expensify/tree/main/lib/Push/Event for the various
 * types of Pusher events sent by our API.
 */
export default {
    REPORT_COMMENT: 'reportComment',
    ONYX_API_UPDATE: 'onyxApiUpdate',
    USER_IS_LEAVING_ROOM: 'client-userIsLeavingRoom',
    USER_IS_TYPING: 'client-userIsTyping',
    MULTIPLE_EVENTS: 'multipleEvents',
    MULTIPLE_EVENT_TYPE: {
        ONYX_API_UPDATE: 'onyxApiUpdate',
        RECONNECT_APP: 'reconnectApp',
    },
} as const;
