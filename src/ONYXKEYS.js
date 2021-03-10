/**
 * This is a file containing constants for all the top level keys in our store
 */
export default {
    // Holds information about the users account that is logging in
    ACCOUNT: 'account',

    // Holds an array of client IDs which is used for multi-tabs on web in order to know
    // which tab is the leader, and which ones are the followers
    ACTIVE_CLIENTS: 'activeClients',

    // When this key is changed, the active page changes (see Expensify.js and `redirect` in actions/App.js)
    APP_REDIRECT_TO: 'appRedirectTo',

    NETWORK_REQUEST_QUEUE: 'networkRequestQueue',

    // The current URL, you should not change this directly (use `redirect` in App.js)
    CURRENT_URL: 'currentURL',

    // Currently viewed reportID
    CURRENTLY_VIEWED_REPORTID: 'currentlyViewedReportID',

    // Credentials to authenticate the user
    CREDENTIALS: 'credentials',

    // Contains loading data for the IOU feature (IOUModal, IOUDetail, & IOUPreview Components)
    IOU: 'iou',

    // Contains the personalDetails of the user as well as their timezone
    MY_PERSONAL_DETAILS: 'myPersonalDetails',

    // Has information about the network status (offline/online)
    NETWORK: 'network',

    // Contains all the personalDetails the user has access to
    PERSONAL_DETAILS: 'personalDetails',

    // Contains the user preference for the LHN priority mode
    PRIORITY_MODE: 'priorityMode',

    // Contains the version of the update that has newly been downloaded.
    UPDATE_VERSION: 'updateVersion',

    // Saves the current country code which is displayed when the user types a phone number without
    // an international code
    COUNTRY_CODE: 'countryCode',

    // Contains all the users settings for the Settings page and sub pages
    USER: 'user',

    // Information about the current session (authToken, accountID, email, loading, error)
    SESSION: 'session',
    IS_SIDEBAR_SHOWN: 'isSidebarShown',
    BETAS: 'betas',

    // NVP keys
    NVP_PAYPAL_ME_ADDRESS: 'nvp_paypalMeAddress',

    // Collection Keys
    COLLECTION: {
        REPORT: 'report_',
        REPORT_ACTIONS: 'reportActions_',
        REPORT_DRAFT_COMMENT: 'reportDraftComment_',
        REPORT_USER_IS_TYPING: 'reportUserIsTyping_',
    },
};
