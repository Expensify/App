/**
 * This is a file containing constants for all the top level keys in our store
 */
export default {
    ACTIVE_CLIENTS: 'activeClients2',

    // When this key is changed, the active page changes (see Expensify.js and `redirect` in actions/App.js)
    APP_REDIRECT_TO: 'appRedirectTo',

    // The current URL, you should not change this directly (use `redirect` in App.js)
    CURRENT_URL: 'currentURL',

    // Currently viewed reportID
    CURRENTLY_VIEWED_REPORTID: 'currentlyViewedReportID',

    // Credentials to authenticate the user
    CREDENTIALS: 'credentials',

    // Contains the personalDetails of the user as well as their timezone
    MY_PERSONAL_DETAILS: 'myPersonalDetails',

    // Has information about the network status (offline/online)
    NETWORK: 'network',

    // Contains all the personalDetails the user has access to
    PERSONAL_DETAILS: 'personalDetails',

    // Information about the current session (authToken, accountID, email, loading, error)
    SESSION: 'session',
    IS_SIDEBAR_SHOWN: 'isSidebarShown',
    IS_CHAT_SWITCHER_ACTIVE: 'isChatSwitcherActive',
    IS_SIDEBAR_ANIMATING: 'isSidebarAnimating',

    // Collection Keys
    COLLECTION: {
        REPORT: 'report_',
        REPORT_ACTIONS: 'reportActions_',
        REPORT_DRAFT_COMMENT: 'reportDraftComment_',
        REPORT_USER_IS_TYPING: 'reportUserIsTyping_',
    },
};
