/**
 * This is a file containing constants for all the top level keys in our store
 */
export default {
    // Holds information about the users account that is logging in
    ACCOUNT: 'account',

    // Holds an array of client IDs which is used for multi-tabs on web in order to know
    // which tab is the leader, and which ones are the followers
    ACTIVE_CLIENTS: 'activeClients',

    // A key that is set while we are still waiting for the initial round of reports to load. Once set it should not be
    // false unless we sign out. If there are reports in storage when the app inits this will be `true`.
    INITIAL_REPORT_DATA_LOADED: 'initialReportDataLoaded',

    // Boolean flag set whenever we are waiting for the reconnection callbacks to finish.
    IS_LOADING_AFTER_RECONNECT: 'isLoadingAfterReconnect',

    NETWORK_REQUEST_QUEUE: 'networkRequestQueue',

    // What the active route is for our navigator. Global route that determines what views to display.
    CURRENT_URL: 'currentURL',

    // Currently viewed reportID
    CURRENTLY_VIEWED_REPORTID: 'currentlyViewedReportID',

    // Credentials to authenticate the user
    CREDENTIALS: 'credentials',

    // Contains loading data for the IOU feature (IOUModal, IOUDetail, & IOUPreview Components)
    IOU: 'iou',

    // Keeps track if there is modal currently visible or not
    MODAL: 'modal',

    // Contains the personalDetails of the user as well as their timezone
    MY_PERSONAL_DETAILS: 'myPersonalDetails',

    // Has information about the network status (offline/online)
    NETWORK: 'network',

    // Contains all the personalDetails the user has access to
    PERSONAL_DETAILS: 'personalDetails',

    // Contains a list of all currencies available to the user - user can
    // select a currency based on the list
    CURRENCY_LIST: 'currencyList',

    // Indicates whether an update is available and ready to beinstalled.
    UPDATE_AVAILABLE: 'updateAvailable',

    // Saves the current country code which is displayed when the user types a phone number without
    // an international code
    COUNTRY_CODE: 'countryCode',

    // Contains all the users settings for the Settings page and sub pages
    USER: 'user',

    // Information about the current session (authToken, accountID, email, loading, error)
    SESSION: 'session',
    BETAS: 'betas',

    // NVP keys
    // Contains the user's payPalMe address
    NVP_PAYPAL_ME_ADDRESS: 'nvp_paypalMeAddress',

    // Contains the user preference for the LHN priority mode
    NVP_PRIORITY_MODE: 'nvp_priorityMode',

    // SDK token used to communicate with Plaid API
    PLAID_LINK_TOKEN: 'plaidLinkToken',

    // List of bank accounts returned by Plaid
    PLAID_BANK_ACCOUNTS: 'plaidBankAccounts',

    // Collection Keys
    COLLECTION: {
        REPORT: 'report_',
        REPORT_ACTIONS: 'reportActions_',
        REPORT_DRAFT_COMMENT: 'reportDraftComment_',
        REPORT_ACTIONS_DRAFTS: 'reportActionsDrafts_',
        REPORT_USER_IS_TYPING: 'reportUserIsTyping_',
        REPORT_IOUS: 'reportIOUs_',
    },

    // Indicates which locale should be used
    PREFERRED_LOCALE: 'preferredLocale',

    // User's Expensify Wallet
    USER_WALLET: 'userWallet',

    // Object containing Onfido SDK Token + applicantID
    ONFIDO_APPLICANT_INFO: 'onfidoApplicantInfo',

    // Stores information about additional details form entry
    WALLET_ADDITIONAL_DETAILS: 'walletAdditionalDetails',
};
