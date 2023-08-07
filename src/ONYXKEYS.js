/**
 * This is a file containing constants for all the top level keys in our store
 */
export default {
    // Holds information about the users account that is logging in
    ACCOUNT: 'account',

    // Holds the reportID for the report between the user and their account manager
    ACCOUNT_MANAGER_REPORT_ID: 'accountManagerReportID',

    // Boolean flag only true when first set
    NVP_IS_FIRST_TIME_NEW_EXPENSIFY_USER: 'isFirstTimeNewExpensifyUser',

    // Holds an array of client IDs which is used for multi-tabs on web in order to know
    // which tab is the leader, and which ones are the followers
    ACTIVE_CLIENTS: 'activeClients',

    // A unique ID for the device
    DEVICE_ID: 'deviceID',

    // Boolean flag set whenever the sidebar has loaded
    IS_SIDEBAR_LOADED: 'isSidebarLoaded',

    // Note: These are Persisted Requests - not all requests in the main queue as the key name might lead one to believe
    PERSISTED_REQUESTS: 'networkRequestQueue',

    // Onyx updates from a response, or success or failure data from a request.
    QUEUED_ONYX_UPDATES: 'queuedOnyxUpdates',

    // Stores current date
    CURRENT_DATE: 'currentDate',

    // Credentials to authenticate the user
    CREDENTIALS: 'credentials',

    // Contains loading data for the IOU feature (MoneyRequestModal, IOUDetail, & IOUPreview Components)
    IOU: 'iou',

    // Keeps track if there is modal currently visible or not
    MODAL: 'modal',

    // Has information about the network status (offline/online)
    NETWORK: 'network',

    // Contains all the personalDetails the user has access to, keyed by accountID
    PERSONAL_DETAILS_LIST: 'personalDetailsList',

    // Contains all the private personal details of the user
    PRIVATE_PERSONAL_DETAILS: 'private_personalDetails',

    // Contains all the info for Tasks
    TASK: 'task',

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

    // The 'country' field in this code represents the return country based on the user's IP address.
    // It is expected to provide a two-letter country code such as US for United States, and so on.
    COUNTRY: 'country',

    // Contains all the users settings for the Settings page and sub pages
    USER: 'user',

    // Contains metadata (partner, login, validation date) for all of the user's logins
    LOGIN_LIST: 'loginList',

    // Information about the current session (authToken, accountID, email, loading, error)
    SESSION: 'session',
    BETAS: 'betas',

    // NVP keys
    // Contains the user's payPalMe data
    PAYPAL: 'paypal',

    // Contains the user preference for the LHN priority mode
    NVP_PRIORITY_MODE: 'nvp_priorityMode',

    // Contains the users's block expiration (if they have one)
    NVP_BLOCKED_FROM_CONCIERGE: 'private_blockedFromConcierge',

    // A unique identifier that each user has that's used to send notifications
    NVP_PRIVATE_PUSH_NOTIFICATION_ID: 'private_pushNotificationID',

    // The NVP with the last payment method used per policy
    NVP_LAST_PAYMENT_METHOD: 'nvp_lastPaymentMethod',

    // Does this user have push notifications enabled for this device?
    PUSH_NOTIFICATIONS_ENABLED: 'pushNotificationsEnabled',

    // Plaid data (access tokens, bank accounts ...)
    PLAID_DATA: 'plaidData',

    // If we disabled Plaid because of too many attempts
    IS_PLAID_DISABLED: 'isPlaidDisabled',

    // Token needed to initialize Plaid link
    PLAID_LINK_TOKEN: 'plaidLinkToken',

    // Token needed to initialize Onfido
    ONFIDO_TOKEN: 'onfidoToken',

    // Collection Keys
    COLLECTION: {
        DOWNLOAD: 'download_',
        POLICY: 'policy_',
        POLICY_MEMBERS: 'policyMembers_',
        WORKSPACE_INVITE_MEMBERS_DRAFT: 'workspaceInviteMembersDraft_',
        REPORT: 'report_',
        REPORT_ACTIONS: 'reportActions_',
        REPORT_ACTIONS_DRAFTS: 'reportActionsDrafts_',
        REPORT_ACTIONS_REACTIONS: 'reportActionsReactions_',
        REPORT_DRAFT_COMMENT: 'reportDraftComment_',
        REPORT_DRAFT_COMMENT_NUMBER_OF_LINES: 'reportDraftCommentNumberOfLines_',
        REPORT_IS_COMPOSER_FULL_SIZE: 'reportIsComposerFullSize_',
        REPORT_USER_IS_TYPING: 'reportUserIsTyping_',
        SECURITY_GROUP: 'securityGroup_',
        TRANSACTION: 'transactions_',

        // This is deprecated, but needed for a migration, so we still need to include it here so that it will be initialized in Onyx.init
        DEPRECATED_POLICY_MEMBER_LIST: 'policyMemberList_',
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

    // Object containing Wallet terms step state
    WALLET_TERMS: 'walletTerms',

    // The user's bank accounts
    BANK_ACCOUNT_LIST: 'bankAccountList',

    // The user's credit cards
    CARD_LIST: 'cardList',

    // The user's credit cards (renamed from cardList)
    FUND_LIST: 'fundList',

    // Stores information about the user's saved statements
    WALLET_STATEMENT: 'walletStatement',

    // Stores information about the active personal bank account being set up
    PERSONAL_BANK_ACCOUNT: 'personalBankAccount',

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

    // Is report data loading?
    IS_LOADING_REPORT_DATA: 'isLoadingReportData',

    // Is Keyboard shortcuts modal open?
    IS_SHORTCUTS_MODAL_OPEN: 'isShortcutsModalOpen',

    // Is the test tools modal open?
    IS_TEST_TOOLS_MODAL_OPEN: 'isTestToolsModalOpen',

    // Stores information about active wallet transfer amount, selectedAccountID, status, etc
    WALLET_TRANSFER: 'walletTransfer',

    // The policyID of the last workspace whose settings were accessed by the user
    LAST_ACCESSED_WORKSPACE_POLICY_ID: 'lastAccessedWorkspacePolicyID',

    // List of Form ids
    FORMS: {
        ADD_DEBIT_CARD_FORM: 'addDebitCardForm',
        REIMBURSEMENT_ACCOUNT_FORM: 'reimbursementAccount',
        WORKSPACE_SETTINGS_FORM: 'workspaceSettingsForm',
        WORKSPACE_RATE_AND_UNIT_FORM: 'workspaceRateAndUnitForm',
        CLOSE_ACCOUNT_FORM: 'closeAccount',
        PROFILE_SETTINGS_FORM: 'profileSettingsForm',
        DISPLAY_NAME_FORM: 'displayNameForm',
        ROOM_NAME_FORM: 'roomNameForm',
        WELCOME_MESSAGE_FORM: 'welcomeMessageForm',
        LEGAL_NAME_FORM: 'legalNameForm',
        WORKSPACE_INVITE_MESSAGE_FORM: 'workspaceInviteMessageForm',
        DATE_OF_BIRTH_FORM: 'dateOfBirthForm',
        HOME_ADDRESS_FORM: 'homeAddressForm',
        NEW_ROOM_FORM: 'newRoomForm',
        ROOM_SETTINGS_FORM: 'roomSettingsForm',
        NEW_TASK_FORM: 'newTaskForm',
        EDIT_TASK_FORM: 'editTaskForm',
        MONEY_REQUEST_DESCRIPTION_FORM: 'moneyRequestDescriptionForm',
        NEW_CONTACT_METHOD_FORM: 'newContactMethodForm',
        PAYPAL_FORM: 'payPalForm',
    },

    // Whether we should show the compose input or not
    SHOULD_SHOW_COMPOSE_INPUT: 'shouldShowComposeInput',

    // Is app in beta version
    IS_BETA: 'isBeta',

    // The theme setting set by the user in preferences.
    // This can be either "light", "dark" or "system"
    PREFERRED_THEME: 'preferredTheme',

    // Whether we're checking if the room is public or not
    IS_CHECKING_PUBLIC_ROOM: 'isCheckingPublicRoom',

    // A map of the user's security group IDs they belong to in specific domains
    MY_DOMAIN_SECURITY_GROUPS: 'myDomainSecurityGroups',

    // Report ID of the last report the user viewed as anonymous user
    LAST_OPENED_PUBLIC_ROOM_ID: 'lastOpenedPublicRoomID',

    // Experimental memory only Onyx mode flag
    IS_USING_MEMORY_ONLY_KEYS: 'isUsingMemoryOnlyKeys',

    // Manual request tab selector
    SELECTED_TAB: 'selectedTab',

    // Receipt upload modal
    RECEIPT_MODAL: 'receiptModal',
};
