/**
 * See https://github.com/Expensify/Web-Expensify/tree/main/lib/Push/Event for the various
 * types of Pusher events sent by our API.
 */
export default {
    REPORT_COMMENT: 'reportComment',
    ONYX_API_UPDATE: 'onyxApiUpdate',
    USER_IS_LEAVING_ROOM: 'client-userIsLeavingRoom',
    USER_IS_TYPING: 'client-userIsTyping',
    CONCIERGE_REASONING: 'conciergeReasoning',
    MULTIPLE_EVENTS: 'multipleEvents',

    // An event that the server sends back to the client in response to a "ping" API command
    PONG: 'pong',
    MULTIPLE_EVENT_TYPE: {
        ONYX_API_UPDATE: 'onyxApiUpdate',
        RECONNECT_APP: 'reconnectApp',
    },
} as const;
