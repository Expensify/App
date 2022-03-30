/**
 * This is a file containing constants for all the top level keys in our store
 */
export default {
    // Holds information about the users account that is logging in
    ACCOUNT: 'account',

    // Boolean flag only true when first set
    NVP_IS_FIRST_TIME_NEW_EXPENSIFY_USER: 'isFirstTimeNewExpensifyUser',

    // Holds an array of client IDs which is used for multi-tabs on web in order to know
    // which tab is the leader, and which ones are the followers
    ACTIVE_CLIENTS: 'activeClients',

    // A key that is set while we are still waiting for the initial round of reports to load. Once set it should not be
    // false unless we sign out. If there are reports in storage when the app inits this will be `true`.
    INITIAL_REPORT_DATA_LOADED: 'initialReportDataLoaded',

    // Boolean flag set whenever we are waiting for the reconnection callbacks to finish.
    IS_LOADING_AFTER_RECONNECT: 'isLoadingAfterReconnect',

    // Boolean flag set whenever the sidebar has loaded
    IS_SIDEBAR_LOADED: 'isSidebarLoaded',

    // Boolean flag set when workspace is being created
    IS_CREATING_WORKSPACE: 'isCreatingWorkspace',

    // Note: These are Persisted Requests - not all requests in the main queue as the key name might lead one to believe
    PERSISTED_REQUESTS: 'networkRequestQueue',

    // What the active route is for our navigator. Global route that determines what views to display.
    CURRENT_URL: 'currentURL',

    // Stores current date
    CURRENT_DATE: 'currentDate',

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

    // Indicates whether an update is available and ready to be installed.
    UPDATE_AVAILABLE: 'updateAvailable',

    // Indicates that a request to join a screen share with a GuidesPlus agent was received
    SCREEN_SHARE_REQUEST: 'screenShareRequest',

    // Saves the current country code which is displayed when the user types a phone number without
    // an international code
    COUNTRY_CODE: 'countryCode',

    // Contains all the users settings for the Settings page and sub pages
    USER: 'user',

    // Contains metadata (partner, login, validation date) for all of the user's logins
    LOGIN_LIST: 'loginList',

    // Information about the current session (authToken, accountID, email, loading, error)
    SESSION: 'session',
    BETAS: 'betas',

    // NVP keys
    // Contains the user's payPalMe address
    NVP_PAYPAL_ME_ADDRESS: 'nvp_paypalMeAddress',

    // Contains the user preference for the LHN priority mode
    NVP_PRIORITY_MODE: 'nvp_priorityMode',

    // Contains the users's block expiration (if they have one)
    NVP_BLOCKED_FROM_CONCIERGE: 'private_blockedFromConcierge',

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
        POLICY: 'policy_',
        REPORTS_WITH_DRAFT: 'reportWithDraft_',
    },

    // Indicates which locale should be used
    NVP_PREFERRED_LOCALE: 'preferredLocale',

    // List of transactionIDs in process of rejection
    TRANSACTIONS_BEING_REJECTED: 'transactionsBeingRejected',

    // User's Expensify Wallet
    USER_WALLET: 'userWallet',

    // Object containing Onfido SDK Token + applicantID
    WALLET_ONFIDO: 'walletOnfido',

    // Stores information about additional details form entry
    WALLET_ADDITIONAL_DETAILS: 'walletAdditionalDetails',

    // Stores values put into the additional details step of the wallet KYC flow
    WALLET_ADDITIONAL_DETAILS_DRAFT: 'walletAdditionalDetailsDraft',

    // Object containing Wallet terms step state
    WALLET_TERMS: 'walletTerms',

    // The user's bank accounts
    BANK_ACCOUNT_LIST: 'bankAccountList',

    // The user's credit cards
    CARD_LIST: 'cardList',

    // Stores information about the user's saved statements
    WALLET_STATEMENT: 'walletStatement',

    // Stores information about the active reimbursement account being set up
    REIMBURSEMENT_ACCOUNT: 'reimbursementAccount',

    // Stores draft information about the active reimbursement account being set up
    REIMBURSEMENT_ACCOUNT_DRAFT: 'reimbursementAccountDraft',

    // Store preferred skintone for emoji
    PREFERRED_EMOJI_SKIN_TONE: 'preferredEmojiSkinTone',

    // Store frequently used emojis for this user
    FREQUENTLY_USED_EMOJIS: 'frequentlyUsedEmojis',

    // Stores Workspace ID that will be tied to reimbursement account during setup
    REIMBURSEMENT_ACCOUNT_WORKSPACE_ID: 'reimbursementAccountWorkspaceID',

    // Set when we are loading payment methods
    IS_LOADING_PAYMENT_METHODS: 'isLoadingPaymentMethods',

    // Stores values for the add debit card form
    ADD_DEBIT_CARD_FORM: 'addDebitCardForm',

    // Stores values for the request call form
    REQUEST_CALL_FORM: 'requestCallForm',

    // The number of minutes a user has to wait for a call.
    INBOX_CALL_USER_WAIT_TIME: 'inboxCallUserWaitTime',

    // Are report actions loading?
    IS_LOADING_REPORT_ACTIONS: 'isLoadingReportActions',

    // Is report data loading?
    IS_LOADING_REPORT_DATA: 'isLoadingReportData',

    // Are we loading the create policy room command
    IS_LOADING_CREATE_POLICY_ROOM: 'isLoadingCratePolicyRoom',

    // Are we loading the rename policy room command
    IS_LOADING_RENAME_POLICY_ROOM: 'isLoadingRenamePolicyRoom',

    // Is Keyboard shortcuts modal open?
    IS_SHORTCUTS_MODAL_OPEN: 'isShortcutsModalOpen',

    // Is close acount modal open?
    IS_CLOSE_ACCOUNT_MODAL_OPEN: 'isCloseAccountModalOpen',

    // Stores information about active wallet transfer amount, selectedAccountID, status, etc
    WALLET_TRANSFER: 'walletTransfer',

    // The policyID of the last workspace whose settings were accessed by the user
    LAST_ACCESSED_WORKSPACE_POLICY_ID: 'lastAccessedWorkspacePolicyID',

    // Validating Email?
    USER_SIGN_UP: 'userSignUp',
};
