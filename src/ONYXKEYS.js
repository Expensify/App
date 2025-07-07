"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This is a file containing constants for all the top level keys in our store
 */
var ONYXKEYS = {
    /** Holds information about the users account that is logging in */
    ACCOUNT: 'account',
    /** Holds the reportID for the report between the user and their account manager */
    ACCOUNT_MANAGER_REPORT_ID: 'accountManagerReportID',
    /** Holds an array of client IDs which is used for multi-tabs on web in order to know
     * which tab is the leader, and which ones are the followers */
    ACTIVE_CLIENTS: 'activeClients',
    /** A unique ID for the device */
    DEVICE_ID: 'deviceID',
    /** Boolean flag set whenever the sidebar has loaded */
    IS_SIDEBAR_LOADED: 'isSidebarLoaded',
    /** Boolean flag set whenever we are searching for reports in the server */
    IS_SEARCHING_FOR_REPORTS: 'isSearchingForReports',
    /** Note: These are Persisted Requests - not all requests in the main queue as the key name might lead one to believe */
    PERSISTED_REQUESTS: 'networkRequestQueue',
    PERSISTED_ONGOING_REQUESTS: 'networkOngoingRequestQueue',
    /** Stores current date */
    CURRENT_DATE: 'currentDate',
    /** Credentials to authenticate the user */
    CREDENTIALS: 'credentials',
    STASHED_CREDENTIALS: 'stashedCredentials',
    /** Keeps track if there is modal currently visible or not */
    MODAL: 'modal',
    /** Keeps track if there is a full screen currently visible or not */
    FULLSCREEN_VISIBILITY: 'fullscreenVisibility',
    /** Has information about the network status (offline/online) */
    NETWORK: 'network',
    // draft status
    CUSTOM_STATUS_DRAFT: 'customStatusDraft',
    // keep edit message focus state
    INPUT_FOCUSED: 'inputFocused',
    /** Contains all the personalDetails the user has access to, keyed by accountID */
    PERSONAL_DETAILS_LIST: 'personalDetailsList',
    /** Contains all the private personal details of the user */
    PRIVATE_PERSONAL_DETAILS: 'private_personalDetails',
    /**
     * PERSONAL_DETAILS_METADATA is a perf optimization used to hold loading states of each entry in PERSONAL_DETAILS_LIST.
     * A lot of components are connected to the PERSONAL_DETAILS_LIST entity and do not care about the loading state.
     * Setting the loading state directly on the personal details entry caused a lot of unnecessary re-renders.
     */
    PERSONAL_DETAILS_METADATA: 'personalDetailsMetadata',
    /** Contains all the info for Tasks */
    TASK: 'task',
    /** Contains a list of all currencies available to the user - user can
     * select a currency based on the list */
    CURRENCY_LIST: 'currencyList',
    /** Indicates whether an update is available and ready to be installed. */
    UPDATE_AVAILABLE: 'updateAvailable',
    /** Indicates that a request to join a screen share with a GuidesPlus agent was received */
    SCREEN_SHARE_REQUEST: 'screenShareRequest',
    /** Saves the current country code which is displayed when the user types a phone number without
     *  an international code */
    COUNTRY_CODE: 'countryCode',
    /**  The 'country' field in this code represents the return country based on the user's IP address.
     * It is expected to provide a two-letter country code such as US for United States, and so on. */
    COUNTRY: 'country',
    /** Contains latitude and longitude of user's last known location */
    USER_LOCATION: 'userLocation',
    /** Contains metadata (partner, login, validation date) for all of the user's logins */
    LOGIN_LIST: 'loginList',
    /** Object containing contact method that's going to be added */
    PENDING_CONTACT_ACTION: 'pendingContactAction',
    /** Store the information of magic code */
    VALIDATE_ACTION_CODE: 'validateActionCode',
    /** A list of policies that a user can join */
    JOINABLE_POLICIES: 'joinablePolicies',
    /* Contains meta data for the call to the API to get the joinable policies */
    VALIDATE_USER_AND_GET_ACCESSIBLE_POLICIES: 'validateUserAndGetAccessiblePolicies',
    /** Information about the current session (authToken, accountID, email, loading, error) */
    SESSION: 'session',
    STASHED_SESSION: 'stashedSession',
    BETAS: 'betas',
    /** Whether the user is a member of a policy other than their personal */
    HAS_NON_PERSONAL_POLICY: 'hasNonPersonalPolicy',
    /** NVP keys */
    /** This NVP contains list of at most 5 recent attendees */
    NVP_RECENT_ATTENDEES: 'nvp_expensify_recentAttendees',
    /** This NVP contains information about whether the onboarding flow was completed or not */
    NVP_ONBOARDING: 'nvp_onboarding',
    /** This NVP contains data associated with HybridApp */
    NVP_TRY_NEW_DOT: 'nvp_tryNewDot',
    /** Contains the platforms for which the user muted the sounds */
    NVP_MUTED_PLATFORMS: 'nvp_mutedPlatforms',
    /** Contains the user preference for the LHN priority mode */
    NVP_PRIORITY_MODE: 'nvp_priorityMode',
    /** Contains the users's block expiration (if they have one) */
    NVP_BLOCKED_FROM_CONCIERGE: 'nvp_private_blockedFromConcierge',
    /** Whether the user is blocked from chat */
    NVP_BLOCKED_FROM_CHAT: 'nvp_private_blockedFromChat',
    /** A unique identifier that each user has that's used to send notifications */
    NVP_PRIVATE_PUSH_NOTIFICATION_ID: 'nvp_private_pushNotificationID',
    /** The NVP with the last payment method used per policy */
    NVP_LAST_PAYMENT_METHOD: 'nvp_private_lastPaymentMethod',
    /** Last date (yyyy-MM-dd HH:mm:ss) when the location permission prompt was shown. */
    NVP_LAST_LOCATION_PERMISSION_PROMPT: 'nvp_lastLocalPermissionPrompt',
    /** This NVP holds to most recent waypoints that a person has used when creating a distance expense */
    NVP_RECENT_WAYPOINTS: 'nvp_expensify_recentWaypoints',
    /** This NVP contains the choice that the user made on the engagement modal */
    NVP_INTRO_SELECTED: 'nvp_introSelected',
    /** This NVP contains the active policyID */
    NVP_ACTIVE_POLICY_ID: 'nvp_expensify_activePolicyID',
    /** This NVP contains the referral banners the user dismissed */
    NVP_DISMISSED_REFERRAL_BANNERS: 'nvp_dismissedReferralBanners',
    /**
     * This NVP contains if user has ever seen the ASAP submit explanation modal and user intent to not show the ASAP submit explanation modal again
     * undefined : user has never seen the modal
     * false : user has seen the modal but has not chosen "do not show again"
     * true : user has seen the modal and does not want to see it again
     */
    NVP_DISMISSED_ASAP_SUBMIT_EXPLANATION: 'nvp_dismissedASAPSubmitExplanation',
    /** This NVP contains the training modals the user denied showing again */
    NVP_HAS_SEEN_TRACK_TRAINING: 'nvp_hasSeenTrackTraining',
    /** Indicates which locale should be used */
    NVP_PREFERRED_LOCALE: 'nvp_preferredLocale',
    /** Whether the app is currently loading a translation */
    ARE_TRANSLATIONS_LOADING: 'areTranslationsLoading',
    /** Whether the user has tried focus mode yet */
    NVP_TRY_FOCUS_MODE: 'nvp_tryFocusMode',
    /** Whether the user has dismissed the hold educational interstitial */
    NVP_DISMISSED_HOLD_USE_EXPLANATION: 'nvp_dismissedHoldUseExplanation',
    /** Whether the user has seen HybridApp explanation modal */
    NVP_SEEN_NEW_USER_MODAL: 'nvp_seen_new_user_modal',
    /** Store the state of the subscription */
    NVP_PRIVATE_SUBSCRIPTION: 'nvp_private_subscription',
    /** Store the state of the private tax-exempt */
    NVP_PRIVATE_TAX_EXEMPT: 'nvp_private_taxExempt',
    /** Store the stripe id status */
    NVP_PRIVATE_STRIPE_CUSTOMER_ID: 'nvp_private_stripeCustomerID',
    /** Store the billing dispute status */
    NVP_PRIVATE_BILLING_DISPUTE_PENDING: 'nvp_private_billingDisputePending',
    /** Store the billing status */
    NVP_PRIVATE_BILLING_STATUS: 'nvp_private_billingStatus',
    /** Store preferred skin tone for emoji */
    PREFERRED_EMOJI_SKIN_TONE: 'nvp_expensify_preferredEmojiSkinTone',
    /** Store frequently used emojis for this user */
    FREQUENTLY_USED_EMOJIS: 'nvp_expensify_frequentlyUsedEmojis',
    /** The NVP with the last distance rate used per policy */
    NVP_LAST_SELECTED_DISTANCE_RATES: 'nvp_expensify_lastSelectedDistanceRates',
    /** The NVP with the last action taken (for the Quick Action Button) */
    NVP_QUICK_ACTION_GLOBAL_CREATE: 'nvp_quickActionGlobalCreate',
    /** The NVP containing all information necessary to connect with Spotnana */
    NVP_TRAVEL_SETTINGS: 'nvp_travelSettings',
    /** The start date (yyyy-MM-dd HH:mm:ss) of the workspace owner’s free trial period. */
    NVP_FIRST_DAY_FREE_TRIAL: 'nvp_private_firstDayFreeTrial',
    /** The end date (yyyy-MM-dd HH:mm:ss) of the workspace owner’s free trial period. */
    NVP_LAST_DAY_FREE_TRIAL: 'nvp_private_lastDayFreeTrial',
    /** ID associated with the payment card added by the user. */
    NVP_BILLING_FUND_ID: 'nvp_expensify_billingFundID',
    /** The amount owed by the workspace’s owner. */
    NVP_PRIVATE_AMOUNT_OWED: 'nvp_private_amountOwed',
    /** The end date (epoch timestamp) of the workspace owner’s grace period after the free trial ends. */
    NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END: 'nvp_private_billingGracePeriodEnd',
    /**  The NVP containing the target url to navigate to when deleting a transaction */
    NVP_DELETE_TRANSACTION_NAVIGATE_BACK_URL: 'nvp_deleteTransactionNavigateBackURL',
    /** A timestamp of when the last full reconnect should have been done */
    NVP_RECONNECT_APP_IF_FULL_RECONNECT_BEFORE: 'nvp_reconnectAppIfFullReconnectBefore',
    /** User's first policy creation date */
    NVP_PRIVATE_FIRST_POLICY_CREATED_DATE: 'nvp_private_firstPolicyCreatedDate',
    /** If the user should see the team 2025 subscription pricing */
    NVP_PRIVATE_MANUAL_TEAM_2025_PRICING: 'nvp_private_manualTeam2025Pricing',
    /** Details on whether an account is locked or not */
    NVP_PRIVATE_LOCK_ACCOUNT_DETAILS: 'nvp_private_lockAccountDetails',
    /** Plaid data (access tokens, bank accounts ...) */
    PLAID_DATA: 'plaidData',
    /** If we disabled Plaid because of too many attempts */
    IS_PLAID_DISABLED: 'isPlaidDisabled',
    /** Token needed to initialize Plaid link */
    PLAID_LINK_TOKEN: 'plaidLinkToken',
    /** Capture Plaid event  */
    PLAID_CURRENT_EVENT: 'plaidCurrentEvent',
    /** Token needed to initialize Onfido */
    ONFIDO_TOKEN: 'onfidoToken',
    ONFIDO_APPLICANT_ID: 'onfidoApplicantID',
    /** User's Expensify Wallet */
    USER_WALLET: 'userWallet',
    /** User's metadata that will be used to segmentation */
    USER_METADATA: 'userMetadata',
    /** Object containing Onfido SDK Token + applicantID */
    WALLET_ONFIDO: 'walletOnfido',
    /** Stores information about additional details form entry */
    WALLET_ADDITIONAL_DETAILS: 'walletAdditionalDetails',
    /** Object containing Wallet terms step state */
    WALLET_TERMS: 'walletTerms',
    /** The user's bank accounts */
    BANK_ACCOUNT_LIST: 'bankAccountList',
    /** The user's payment and P2P cards */
    FUND_LIST: 'fundList',
    /** The user's cash card and imported cards (including the Expensify Card) */
    CARD_LIST: 'cardList',
    /** Stores information about the user's saved statements */
    WALLET_STATEMENT: 'walletStatement',
    /** Stores information about the user's purchases */
    PURCHASE_LIST: 'purchaseList',
    /** Stores information about the active personal bank account being set up */
    PERSONAL_BANK_ACCOUNT: 'personalBankAccount',
    /** Stores information about the active reimbursement account being set up */
    REIMBURSEMENT_ACCOUNT: 'reimbursementAccount',
    /** Stores Workspace ID that will be tied to reimbursement account during setup */
    REIMBURSEMENT_ACCOUNT_WORKSPACE_ID: 'reimbursementAccountWorkspaceID',
    /** Set when we are loading payment methods */
    IS_LOADING_PAYMENT_METHODS: 'isLoadingPaymentMethods',
    /** Is report data loading? */
    IS_LOADING_REPORT_DATA: 'isLoadingReportData',
    /** Is report data loading? */
    IS_LOADING_APP: 'isLoadingApp',
    /** Is the app loaded? */
    HAS_LOADED_APP: 'hasLoadedApp',
    /** Is the test tools modal open? */
    IS_TEST_TOOLS_MODAL_OPEN: 'isTestToolsModalOpen',
    /** Is app in profiling mode */
    APP_PROFILING_IN_PROGRESS: 'isProfilingInProgress',
    /** Stores information about active wallet transfer amount, selectedAccountID, status, etc */
    WALLET_TRANSFER: 'walletTransfer',
    /** The policyID of the last workspace whose settings were accessed by the user */
    LAST_ACCESSED_WORKSPACE_POLICY_ID: 'lastAccessedWorkspacePolicyID',
    /** Whether we should show the compose input or not */
    SHOULD_SHOW_COMPOSE_INPUT: 'shouldShowComposeInput',
    /** Is app in beta version */
    IS_BETA: 'isBeta',
    /** Whether we're checking if the room is public or not */
    IS_CHECKING_PUBLIC_ROOM: 'isCheckingPublicRoom',
    /** A map of the user's security group IDs they belong to in specific domains */
    MY_DOMAIN_SECURITY_GROUPS: 'myDomainSecurityGroups',
    /** Report ID of the last report the user viewed as anonymous user */
    LAST_OPENED_PUBLIC_ROOM_ID: 'lastOpenedPublicRoomID',
    // The theme setting set by the user in preferences.
    // This can be either "light", "dark" or "system"
    PREFERRED_THEME: 'nvp_preferredTheme',
    // Information about the onyx updates IDs that were received from the server
    ONYX_UPDATES_FROM_SERVER: 'onyxUpdatesFromServer',
    // The last update ID that was applied to the client
    ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT: 'OnyxUpdatesLastUpdateIDAppliedToClient',
    // The access token to be used with the Mapbox library
    MAPBOX_ACCESS_TOKEN: 'mapboxAccessToken',
    // Max area supported for HTML <canvas> element
    MAX_CANVAS_AREA: 'maxCanvasArea',
    // Max height supported for HTML <canvas> element
    MAX_CANVAS_HEIGHT: 'maxCanvasHeight',
    /** Onboarding Purpose selected by the user during Onboarding flow */
    ONBOARDING_PURPOSE_SELECTED: 'onboardingPurposeSelected',
    /** Onboarding customized choices to display to the user based on their profile when signing up */
    ONBOARDING_CUSTOM_CHOICES: 'onboardingCustomChoices',
    /** Onboarding error message to be displayed to the user */
    ONBOARDING_ERROR_MESSAGE: 'onboardingErrorMessage',
    /** Onboarding policyID selected by the user during Onboarding flow */
    ONBOARDING_POLICY_ID: 'onboardingPolicyID',
    /** Onboarding company size selected by the user during Onboarding flow */
    ONBOARDING_COMPANY_SIZE: 'onboardingCompanySize',
    /** Onboarding Purpose selected by the user during Onboarding flow */
    ONBOARDING_ADMINS_CHAT_REPORT_ID: 'onboardingAdminsChatReportID',
    // Stores onboarding last visited path
    ONBOARDING_LAST_VISITED_PATH: 'onboardingLastVisitedPath',
    // Object containing names/timestamps of dismissed product training elements (Modal, Tooltip, etc.)
    NVP_DISMISSED_PRODUCT_TRAINING: 'nvp_dismissedProductTraining',
    // Max width supported for HTML <canvas> element
    MAX_CANVAS_WIDTH: 'maxCanvasWidth',
    // Stores last visited path
    LAST_VISITED_PATH: 'lastVisitedPath',
    // Stores the recently used report fields
    RECENTLY_USED_REPORT_FIELDS: 'recentlyUsedReportFields',
    /** Indicates whether an forced upgrade is required */
    UPDATE_REQUIRED: 'updateRequired',
    /** Indicates whether an forced reset is required. Used in emergency situations where we must completely erase the Onyx data in the client because it is in a bad state. This will clear Onyx data without signing the user out. */
    RESET_REQUIRED: 'resetRequired',
    /** Stores the logs of the app for debugging purposes */
    LOGS: 'logs',
    /** Indicates whether we should store logs or not */
    SHOULD_STORE_LOGS: 'shouldStoreLogs',
    /** Indicates whether we should record troubleshoot data or not */
    SHOULD_RECORD_TROUBLESHOOT_DATA: 'shouldRecordTroubleshootData',
    /** Indicates whether we should mask fragile user data while exporting onyx state or not */
    SHOULD_MASK_ONYX_STATE: 'shouldMaskOnyxState',
    /** Stores new group chat draft */
    NEW_GROUP_CHAT_DRAFT: 'newGroupChatDraft',
    // Paths of PDF file that has been cached during one session
    CACHED_PDF_PATHS: 'cachedPDFPaths',
    /** Stores iframe link to verify 3DS flow for subscription */
    VERIFY_3DS_SUBSCRIPTION: 'verify3dsSubscription',
    /** Holds the checks used while transferring the ownership of the workspace */
    POLICY_OWNERSHIP_CHANGE_CHECKS: 'policyOwnershipChangeChecks',
    // These statuses below are in separate keys on purpose - it allows us to have different behaviors of the banner based on the status
    /** Indicates whether ClearOutstandingBalance failed */
    SUBSCRIPTION_RETRY_BILLING_STATUS_FAILED: 'subscriptionRetryBillingStatusFailed',
    /** Indicates whether ClearOutstandingBalance was successful */
    SUBSCRIPTION_RETRY_BILLING_STATUS_SUCCESSFUL: 'subscriptionRetryBillingStatusSuccessful',
    /** Indicates whether ClearOutstandingBalance is pending */
    SUBSCRIPTION_RETRY_BILLING_STATUS_PENDING: 'subscriptionRetryBillingStatusPending',
    /** Stores info during review duplicates flow */
    REVIEW_DUPLICATES: 'reviewDuplicates',
    /** Stores the last export method for policy */
    LAST_EXPORT_METHOD: 'lastExportMethod',
    /** Stores the information about the state of adding a new company card */
    ADD_NEW_COMPANY_CARD: 'addNewCompanyCard',
    /** Stores the information about the state of assigning a company card */
    ASSIGN_CARD: 'assignCard',
    /** Stores the information if mobile selection mode is active */
    MOBILE_SELECTION_MODE: 'mobileSelectionMode',
    NVP_PRIVATE_CANCELLATION_DETAILS: 'nvp_private_cancellationDetails',
    /** Stores the information about currently edited advanced approval workflow */
    APPROVAL_WORKFLOW: 'approvalWorkflow',
    /** Stores the user search value for persistence across the screens */
    ROOM_MEMBERS_USER_SEARCH_PHRASE: 'roomMembersUserSearchPhrase',
    /** Stores information about recently uploaded spreadsheet file */
    IMPORTED_SPREADSHEET: 'importedSpreadsheet',
    /** Stores the route to open after changing app permission from settings */
    LAST_ROUTE: 'lastRoute',
    /** Stores the information if user loaded the Onyx state through Import feature  */
    IS_USING_IMPORTED_STATE: 'isUsingImportedState',
    /** Stores the information about the saved searches */
    SAVED_SEARCHES: 'nvp_savedSearches',
    /** Stores the information about the recent searches */
    RECENT_SEARCHES: 'nvp_recentSearches',
    /** Stores recently used currencies */
    RECENTLY_USED_CURRENCIES: 'nvp_recentlyUsedCurrencies',
    /** States whether we transitioned from OldDot to show only certain group of screens. It should be undefined on pure NewDot. */
    IS_SINGLE_NEW_DOT_ENTRY: 'isSingleNewDotEntry',
    /** Company cards custom names */
    NVP_EXPENSIFY_COMPANY_CARDS_CUSTOM_NAMES: 'nvp_expensify_ccCustomNames',
    /** The user's Concierge reportID */
    CONCIERGE_REPORT_ID: 'conciergeReportID',
    /** The details of unknown user while sharing a file - we don't know if they exist */
    SHARE_UNKNOWN_USER_DETAILS: 'shareUnknownUserDetails',
    /** Temporary file to be shared from outside the app */
    SHARE_TEMP_FILE: 'shareTempFile',
    /** Corpay fields to be used in the bank account creation setup */
    CORPAY_FIELDS: 'corpayFields',
    /** The user's session that will be preserved when using imported state */
    PRESERVED_USER_SESSION: 'preservedUserSession',
    /** Corpay onboarding fields used in steps 3-5 in the global reimbursements */
    CORPAY_ONBOARDING_FIELDS: 'corpayOnboardingFields',
    /** Timestamp of when the last full reconnect was done on this client */
    LAST_FULL_RECONNECT_TIME: 'lastFullReconnectTime',
    /** Information about travel provisioning process */
    TRAVEL_PROVISIONING: 'travelProvisioning',
    /** Stores the information about the state of side panel */
    NVP_SIDE_PANEL: 'nvp_sidePanel',
    /** Stores draft information while user is scheduling the call. */
    SCHEDULE_CALL_DRAFT: 'scheduleCallDraft',
    /** Onyx updates that should be stored after sequential queue is flushed */
    QUEUE_FLUSHED_DATA: 'queueFlushedData',
    /** Set when we are loading bill when downgrade */
    IS_LOADING_BILL_WHEN_DOWNGRADE: 'isLoadingBillWhenDowngrade',
    /**
     * Determines whether billing is required when the user downgrades their plan.
     * If true, the "Pay & Downgrade" RHP will be displayed to guide the user
     * through the payment process before downgrading.
     */
    SHOULD_BILL_WHEN_DOWNGRADING: 'shouldBillWhenDowngrading',
    /** Billing receipt details */
    BILLING_RECEIPT_DETAILS: 'billingReceiptDetails',
    /** Set when user tries to connect VBBA but workspace currency is unsupported and is forced to change
     * This is later used to redirect user directly back to the VBBA flow */
    IS_FORCED_TO_CHANGE_CURRENCY: 'isForcedToChangeCurrency',
    /** Set this gets redirected from global reimbursements flow */
    IS_COMING_FROM_GLOBAL_REIMBURSEMENTS_FLOW: 'isComingFromGlobalReimbursementsFlow',
    /** Stores information for OpenUnreportedExpensesPage API call pagination */
    HAS_MORE_UNREPORTED_TRANSACTIONS_RESULTS: 'hasMoreUnreportedTransactionsResults',
    /** Is unreported transactions loading */
    IS_LOADING_UNREPORTED_TRANSACTIONS: 'isLoadingUnreportedTransactions',
    /** List of transaction thread IDs used when navigating to prev/next transaction when viewing it in RHP */
    TRANSACTION_THREAD_NAVIGATION_REPORT_IDS: 'transactionThreadNavigationReportIDs',
    /** Timestamp of the last login on iOS */
    NVP_LAST_ECASH_IOS_LOGIN: 'nvp_lastECashIOSLogin',
    NVP_LAST_IPHONE_LOGIN: 'nvp_lastiPhoneLogin',
    /** Timestamp of the last login on Android */
    NVP_LAST_ECASH_ANDROID_LOGIN: 'nvp_lastECashAndroidLogin',
    NVP_LAST_ANDROID_LOGIN: 'nvp_lastAndroidLogin',
    /** Collection Keys */
    COLLECTION: {
        DOWNLOAD: 'download_',
        POLICY: 'policy_',
        POLICY_DRAFTS: 'policyDrafts_',
        POLICY_JOIN_MEMBER: 'policyJoinMember_',
        POLICY_CATEGORIES: 'policyCategories_',
        POLICY_CATEGORIES_DRAFT: 'policyCategoriesDraft_',
        POLICY_RECENTLY_USED_CATEGORIES: 'policyRecentlyUsedCategories_',
        POLICY_TAGS: 'policyTags_',
        POLICY_RECENTLY_USED_TAGS: 'nvp_recentlyUsedTags_',
        POLICY_RECENTLY_USED_DESTINATIONS: 'nvp_recentlyUsedDestinations_',
        // Whether the policy's connection data was attempted to be fetched in
        // the current user session. As this state only exists client-side, it
        // should not be included as part of the policy object. The policy
        // object should mirror the data as it's stored in the database.
        POLICY_HAS_CONNECTIONS_DATA_BEEN_FETCHED: 'policyHasConnectionsDataBeenFetched_',
        OLD_POLICY_RECENTLY_USED_TAGS: 'policyRecentlyUsedTags_',
        POLICY_CONNECTION_SYNC_PROGRESS: 'policyConnectionSyncProgress_',
        WORKSPACE_INVITE_MEMBERS_DRAFT: 'workspaceInviteMembersDraft_',
        WORKSPACE_INVITE_MESSAGE_DRAFT: 'workspaceInviteMessageDraft_',
        WORKSPACE_INVITE_ROLE_DRAFT: 'workspaceInviteRoleDraft_',
        REPORT: 'report_',
        REPORT_NAME_VALUE_PAIRS: 'reportNameValuePairs_',
        REPORT_DRAFT: 'reportDraft_',
        // REPORT_METADATA is a perf optimization used to hold loading states (isLoadingInitialReportActions, isLoadingOlderReportActions, isLoadingNewerReportActions).
        // A lot of components are connected to the Report entity and do not care about the actions. Setting the loading state
        // directly on the report caused a lot of unnecessary re-renders
        REPORT_METADATA: 'reportMetadata_',
        REPORT_ACTIONS: 'reportActions_',
        REPORT_ACTIONS_DRAFTS: 'reportActionsDrafts_',
        REPORT_ACTIONS_PAGES: 'reportActionsPages_',
        REPORT_ACTIONS_REACTIONS: 'reportActionsReactions_',
        REPORT_DRAFT_COMMENT: 'reportDraftComment_',
        REPORT_IS_COMPOSER_FULL_SIZE: 'reportIsComposerFullSize_',
        REPORT_USER_IS_TYPING: 'reportUserIsTyping_',
        REPORT_USER_IS_LEAVING_ROOM: 'reportUserIsLeavingRoom_',
        REPORT_VIOLATIONS: 'reportViolations_',
        SECURITY_GROUP: 'securityGroup_',
        TRANSACTION: 'transactions_',
        TRANSACTION_VIOLATIONS: 'transactionViolations_',
        TRANSACTION_DRAFT: 'transactionsDraft_',
        SKIP_CONFIRMATION: 'skipConfirmation_',
        TRANSACTION_BACKUP: 'transactionsBackup_',
        SPLIT_TRANSACTION_DRAFT: 'splitTransactionDraft_',
        PRIVATE_NOTES_DRAFT: 'privateNotesDraft_',
        NEXT_STEP: 'reportNextStep_',
        // Manual expense tab selector
        SELECTED_TAB: 'selectedTab_',
        /** This is deprecated, but needed for a migration, so we still need to include it here so that it will be initialized in Onyx.init */
        DEPRECATED_POLICY_MEMBER_LIST: 'policyMemberList_',
        // Search Page related
        SNAPSHOT: 'snapshot_',
        // Shared NVPs
        /** Collection of objects where each object represents the owner of the workspace that is past due billing AND the user is a member of. */
        SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END: 'sharedNVP_private_billingGracePeriodEnd_',
        /** The collection of card feeds */
        SHARED_NVP_PRIVATE_DOMAIN_MEMBER: 'sharedNVP_private_domain_member_',
        /**
         * Stores the card list for a given fundID and feed in the format: cards_<fundID>_<bankName>
         * So for example: cards_12345_Expensify Card
         */
        WORKSPACE_CARDS_LIST: 'cards_',
        /** Expensify cards settings */
        PRIVATE_EXPENSIFY_CARD_SETTINGS: 'private_expensifyCardSettings_',
        /** Expensify cards bank account for a given workspace */
        EXPENSIFY_CARD_BANK_ACCOUNT_METADATA: 'expensifyCardBankAccountMetadata_',
        /** Expensify cards manual billing setting */
        PRIVATE_EXPENSIFY_CARD_MANUAL_BILLING: 'private_expensifyCardManualBilling_',
        /** Stores which connection is set up to use Continuous Reconciliation */
        EXPENSIFY_CARD_CONTINUOUS_RECONCILIATION_CONNECTION: 'expensifyCard_continuousReconciliationConnection_',
        /** The value that indicates whether Continuous Reconciliation should be used on the domain */
        EXPENSIFY_CARD_USE_CONTINUOUS_RECONCILIATION: 'expensifyCard_useContinuousReconciliation_',
        /** Currently displaying feed */
        LAST_SELECTED_FEED: 'lastSelectedFeed_',
        /** Currently displaying Expensify Card feed */
        LAST_SELECTED_EXPENSIFY_CARD_FEED: 'lastSelectedExpensifyCardFeed_',
        /**  Whether the bank account chosen for Expensify Card in on verification waitlist */
        NVP_EXPENSIFY_ON_CARD_WAITLIST: 'nvp_expensify_onCardWaitlist_',
        NVP_EXPENSIFY_REPORT_PDF_FILENAME: 'nvp_expensify_report_PDFFilename_',
        /** Stores the information about the state of issuing a new card */
        ISSUE_NEW_EXPENSIFY_CARD: 'issueNewExpensifyCard_',
    },
    /** List of Form ids */
    FORMS: {
        ADD_PAYMENT_CARD_FORM: 'addPaymentCardForm',
        ADD_PAYMENT_CARD_FORM_DRAFT: 'addPaymentCardFormDraft',
        WORKSPACE_SETTINGS_FORM: 'workspaceSettingsForm',
        WORKSPACE_CATEGORY_FORM: 'workspaceCategoryForm',
        WORKSPACE_CONFIRMATION_FORM: 'workspaceConfirmationForm',
        WORKSPACE_CONFIRMATION_FORM_DRAFT: 'workspaceConfirmationFormDraft',
        WORKSPACE_CATEGORY_FORM_DRAFT: 'workspaceCategoryFormDraft',
        WORKSPACE_CATEGORY_DESCRIPTION_HINT_FORM: 'workspaceCategoryDescriptionHintForm',
        WORKSPACE_CATEGORY_DESCRIPTION_HINT_FORM_DRAFT: 'workspaceCategoryDescriptionHintFormDraft',
        WORKSPACE_CATEGORY_FLAG_AMOUNTS_OVER_FORM: 'workspaceCategoryFlagAmountsOverForm',
        WORKSPACE_CATEGORY_FLAG_AMOUNTS_OVER_FORM_DRAFT: 'workspaceCategoryFlagAmountsOverFormDraft',
        WORKSPACE_TAG_FORM: 'workspaceTagForm',
        WORKSPACE_TAG_FORM_DRAFT: 'workspaceTagFormDraft',
        WORKSPACE_SETTINGS_FORM_DRAFT: 'workspaceSettingsFormDraft',
        WORKSPACE_DESCRIPTION_FORM: 'workspaceDescriptionForm',
        WORKSPACE_MEMBER_CUSTOM_FIELD_FORM: 'WorkspaceMemberCustomFieldForm',
        WORKSPACE_MEMBER_CUSTOM_FIELD_FORM_DRAFT: 'WorkspaceMemberCustomFieldFormDraft',
        WORKSPACE_DESCRIPTION_FORM_DRAFT: 'workspaceDescriptionFormDraft',
        WORKSPACE_TAX_CUSTOM_NAME: 'workspaceTaxCustomName',
        WORKSPACE_TAX_CUSTOM_NAME_DRAFT: 'workspaceTaxCustomNameDraft',
        WORKSPACE_COMPANY_CARD_FEED_NAME: 'workspaceCompanyCardFeedName',
        WORKSPACE_COMPANY_CARD_FEED_NAME_DRAFT: 'workspaceCompanyCardFeedNameDraft',
        EDIT_WORKSPACE_COMPANY_CARD_NAME_FORM: 'editCompanyCardName',
        EDIT_WORKSPACE_COMPANY_CARD_NAME_DRAFT_FORM: 'editCompanyCardNameDraft',
        WORKSPACE_REPORT_FIELDS_FORM: 'workspaceReportFieldForm',
        WORKSPACE_REPORT_FIELDS_FORM_DRAFT: 'workspaceReportFieldFormDraft',
        POLICY_CREATE_DISTANCE_RATE_FORM: 'policyCreateDistanceRateForm',
        POLICY_CREATE_DISTANCE_RATE_FORM_DRAFT: 'policyCreateDistanceRateFormDraft',
        POLICY_DISTANCE_RATE_EDIT_FORM: 'policyDistanceRateEditForm',
        POLICY_DISTANCE_RATE_TAX_RECLAIMABLE_ON_EDIT_FORM: 'policyDistanceRateTaxReclaimableOnEditForm',
        POLICY_DISTANCE_RATE_TAX_RECLAIMABLE_ON_EDIT_FORM_DRAFT: 'policyDistanceRateTaxReclaimableOnEditFormDraft',
        POLICY_DISTANCE_RATE_EDIT_FORM_DRAFT: 'policyDistanceRateEditFormDraft',
        CLOSE_ACCOUNT_FORM: 'closeAccount',
        CLOSE_ACCOUNT_FORM_DRAFT: 'closeAccountDraft',
        PROFILE_SETTINGS_FORM: 'profileSettingsForm',
        PROFILE_SETTINGS_FORM_DRAFT: 'profileSettingsFormDraft',
        DISPLAY_NAME_FORM: 'displayNameForm',
        DISPLAY_NAME_FORM_DRAFT: 'displayNameFormDraft',
        ONBOARDING_PERSONAL_DETAILS_FORM: 'onboardingPersonalDetailsForm',
        ONBOARDING_PERSONAL_DETAILS_FORM_DRAFT: 'onboardingPersonalDetailsFormDraft',
        ONBOARDING_WORKSPACE_DETAILS_FORM: 'onboardingWorkspaceDetailsForm',
        ONBOARDING_WORKSPACE_DETAILS_FORM_DRAFT: 'onboardingWorkspaceDetailsFormDraft',
        ROOM_NAME_FORM: 'roomNameForm',
        ROOM_NAME_FORM_DRAFT: 'roomNameFormDraft',
        REPORT_DESCRIPTION_FORM: 'reportDescriptionForm',
        REPORT_DESCRIPTION_FORM_DRAFT: 'reportDescriptionFormDraft',
        LEGAL_NAME_FORM: 'legalNameForm',
        LEGAL_NAME_FORM_DRAFT: 'legalNameFormDraft',
        WORKSPACE_INVITE_MESSAGE_FORM: 'workspaceInviteMessageForm',
        WORKSPACE_INVITE_MESSAGE_FORM_DRAFT: 'workspaceInviteMessageFormDraft',
        DATE_OF_BIRTH_FORM: 'dateOfBirthForm',
        DATE_OF_BIRTH_FORM_DRAFT: 'dateOfBirthFormDraft',
        HOME_ADDRESS_FORM: 'homeAddressForm',
        HOME_ADDRESS_FORM_DRAFT: 'homeAddressFormDraft',
        PERSONAL_DETAILS_FORM: 'personalDetailsForm',
        PERSONAL_DETAILS_FORM_DRAFT: 'personalDetailsFormDraft',
        INTERNATIONAL_BANK_ACCOUNT_FORM: 'internationalBankAccountForm',
        INTERNATIONAL_BANK_ACCOUNT_FORM_DRAFT: 'internationalBankAccountFormDraft',
        NEW_ROOM_FORM: 'newRoomForm',
        NEW_ROOM_FORM_DRAFT: 'newRoomFormDraft',
        ROOM_SETTINGS_FORM: 'roomSettingsForm',
        ROOM_SETTINGS_FORM_DRAFT: 'roomSettingsFormDraft',
        NEW_TASK_FORM: 'newTaskForm',
        NEW_TASK_FORM_DRAFT: 'newTaskFormDraft',
        EDIT_TASK_FORM: 'editTaskForm',
        EDIT_TASK_FORM_DRAFT: 'editTaskFormDraft',
        MONEY_REQUEST_DESCRIPTION_FORM: 'moneyRequestDescriptionForm',
        MONEY_REQUEST_DESCRIPTION_FORM_DRAFT: 'moneyRequestDescriptionFormDraft',
        MONEY_REQUEST_MERCHANT_FORM: 'moneyRequestMerchantForm',
        MONEY_REQUEST_MERCHANT_FORM_DRAFT: 'moneyRequestMerchantFormDraft',
        MONEY_REQUEST_AMOUNT_FORM: 'moneyRequestAmountForm',
        MONEY_REQUEST_AMOUNT_FORM_DRAFT: 'moneyRequestAmountFormDraft',
        MONEY_REQUEST_DATE_FORM: 'moneyRequestCreatedForm',
        MONEY_REQUEST_DATE_FORM_DRAFT: 'moneyRequestCreatedFormDraft',
        MONEY_REQUEST_HOLD_FORM: 'moneyHoldReasonForm',
        MONEY_REQUEST_HOLD_FORM_DRAFT: 'moneyHoldReasonFormDraft',
        MONEY_REQUEST_COMPANY_INFO_FORM: 'moneyRequestCompanyInfoForm',
        MONEY_REQUEST_COMPANY_INFO_FORM_DRAFT: 'moneyRequestCompanyInfoFormDraft',
        MONEY_REQUEST_TIME_FORM: 'moneyRequestTimeForm',
        MONEY_REQUEST_TIME_FORM_DRAFT: 'moneyRequestTimeFormDraft',
        MONEY_REQUEST_SUBRATE_FORM: 'moneyRequestSubrateForm',
        MONEY_REQUEST_SUBRATE_FORM_DRAFT: 'moneyRequestSubrateFormDraft',
        NEW_CONTACT_METHOD_FORM: 'newContactMethodForm',
        NEW_CONTACT_METHOD_FORM_DRAFT: 'newContactMethodFormDraft',
        WAYPOINT_FORM: 'waypointForm',
        WAYPOINT_FORM_DRAFT: 'waypointFormDraft',
        SETTINGS_STATUS_SET_FORM: 'settingsStatusSetForm',
        SETTINGS_STATUS_SET_FORM_DRAFT: 'settingsStatusSetFormDraft',
        SETTINGS_STATUS_SET_CLEAR_AFTER_FORM: 'settingsStatusSetClearAfterForm',
        SETTINGS_STATUS_SET_CLEAR_AFTER_FORM_DRAFT: 'settingsStatusSetClearAfterFormDraft',
        SETTINGS_STATUS_CLEAR_DATE_FORM: 'settingsStatusClearDateForm',
        SETTINGS_STATUS_CLEAR_DATE_FORM_DRAFT: 'settingsStatusClearDateFormDraft',
        CHANGE_BILLING_CURRENCY_FORM: 'billingCurrencyForm',
        CHANGE_BILLING_CURRENCY_FORM_DRAFT: 'billingCurrencyFormDraft',
        PRIVATE_NOTES_FORM: 'privateNotesForm',
        PRIVATE_NOTES_FORM_DRAFT: 'privateNotesFormDraft',
        I_KNOW_A_TEACHER_FORM: 'iKnowTeacherForm',
        I_KNOW_A_TEACHER_FORM_DRAFT: 'iKnowTeacherFormDraft',
        INTRO_SCHOOL_PRINCIPAL_FORM: 'introSchoolPrincipalForm',
        INTRO_SCHOOL_PRINCIPAL_FORM_DRAFT: 'introSchoolPrincipalFormDraft',
        REPORT_PHYSICAL_CARD_FORM: 'requestPhysicalCardForm',
        REPORT_PHYSICAL_CARD_FORM_DRAFT: 'requestPhysicalCardFormDraft',
        REPORT_VIRTUAL_CARD_FRAUD: 'reportVirtualCardFraudForm',
        REPORT_VIRTUAL_CARD_FRAUD_DRAFT: 'reportVirtualCardFraudFormDraft',
        REPORT_FIELDS_EDIT_FORM: 'reportFieldsEditForm',
        REPORT_FIELDS_EDIT_FORM_DRAFT: 'reportFieldsEditFormDraft',
        REIMBURSEMENT_ACCOUNT_FORM: 'reimbursementAccount',
        REIMBURSEMENT_ACCOUNT_FORM_DRAFT: 'reimbursementAccountDraft',
        PERSONAL_BANK_ACCOUNT_FORM: 'personalBankAccount',
        PERSONAL_BANK_ACCOUNT_FORM_DRAFT: 'personalBankAccountDraft',
        DISABLE_AUTO_RENEW_SURVEY_FORM: 'disableAutoRenewSurveyForm',
        DISABLE_AUTO_RENEW_SURVEY_FORM_DRAFT: 'disableAutoRenewSurveyFormDraft',
        REQUEST_EARLY_CANCELLATION_FORM: 'requestEarlyCancellationForm',
        REQUEST_EARLY_CANCELLATION_FORM_DRAFT: 'requestEarlyCancellationFormDraft',
        EXIT_SURVEY_REASON_FORM: 'exitSurveyReasonForm',
        EXIT_SURVEY_REASON_FORM_DRAFT: 'exitSurveyReasonFormDraft',
        EXIT_SURVEY_RESPONSE_FORM: 'exitSurveyResponseForm',
        EXIT_SURVEY_RESPONSE_FORM_DRAFT: 'exitSurveyResponseFormDraft',
        WALLET_ADDITIONAL_DETAILS: 'walletAdditionalDetails',
        WALLET_ADDITIONAL_DETAILS_DRAFT: 'walletAdditionalDetailsDraft',
        POLICY_TAG_NAME_FORM: 'policyTagNameForm',
        POLICY_TAG_NAME_FORM_DRAFT: 'policyTagNameFormDraft',
        WORKSPACE_NEW_TAX_FORM: 'workspaceNewTaxForm',
        WORKSPACE_NEW_TAX_FORM_DRAFT: 'workspaceNewTaxFormDraft',
        WORKSPACE_TAX_NAME_FORM: 'workspaceTaxNameForm',
        WORKSPACE_TAX_CODE_FORM: 'workspaceTaxCodeForm',
        WORKSPACE_TAX_CODE_FORM_DRAFT: 'workspaceTaxCodeFormDraft',
        WORKSPACE_TAX_NAME_FORM_DRAFT: 'workspaceTaxNameFormDraft',
        WORKSPACE_TAX_VALUE_FORM: 'workspaceTaxValueForm',
        WORKSPACE_TAX_VALUE_FORM_DRAFT: 'workspaceTaxValueFormDraft',
        WORKSPACE_INVOICES_COMPANY_NAME_FORM: 'workspaceInvoicesCompanyNameForm',
        WORKSPACE_INVOICES_COMPANY_NAME_FORM_DRAFT: 'workspaceInvoicesCompanyNameFormDraft',
        WORKSPACE_INVOICES_COMPANY_WEBSITE_FORM: 'workspaceInvoicesCompanyWebsiteForm',
        WORKSPACE_INVOICES_COMPANY_WEBSITE_FORM_DRAFT: 'workspaceInvoicesCompanyWebsiteFormDraft',
        NEW_CHAT_NAME_FORM: 'newChatNameForm',
        NEW_CHAT_NAME_FORM_DRAFT: 'newChatNameFormDraft',
        SUBSCRIPTION_SIZE_FORM: 'subscriptionSizeForm',
        SUBSCRIPTION_SIZE_FORM_DRAFT: 'subscriptionSizeFormDraft',
        ISSUE_NEW_EXPENSIFY_CARD_FORM: 'issueNewExpensifyCard',
        ISSUE_NEW_EXPENSIFY_CARD_FORM_DRAFT: 'issueNewExpensifyCardDraft',
        ADD_NEW_CARD_FEED_FORM: 'addNewCardFeed',
        ADD_NEW_CARD_FEED_FORM_DRAFT: 'addNewCardFeedDraft',
        ASSIGN_CARD_FORM: 'assignCard',
        ASSIGN_CARD_FORM_DRAFT: 'assignCardDraft',
        EDIT_EXPENSIFY_CARD_NAME_FORM: 'editExpensifyCardName',
        EDIT_EXPENSIFY_CARD_NAME_DRAFT_FORM: 'editExpensifyCardNameDraft',
        EDIT_EXPENSIFY_CARD_LIMIT_FORM: 'editExpensifyCardLimit',
        EDIT_EXPENSIFY_CARD_LIMIT_DRAFT_FORM: 'editExpensifyCardLimitDraft',
        SAGE_INTACCT_CREDENTIALS_FORM: 'sageIntacctCredentialsForm',
        SAGE_INTACCT_CREDENTIALS_FORM_DRAFT: 'sageIntacctCredentialsFormDraft',
        NETSUITE_CUSTOM_FIELD_FORM: 'netSuiteCustomFieldForm',
        NETSUITE_CUSTOM_FIELD_FORM_DRAFT: 'netSuiteCustomFieldFormDraft',
        NETSUITE_CUSTOM_SEGMENT_ADD_FORM: 'netSuiteCustomSegmentAddForm',
        NETSUITE_CUSTOM_SEGMENT_ADD_FORM_DRAFT: 'netSuiteCustomSegmentAddFormDraft',
        NETSUITE_CUSTOM_LIST_ADD_FORM: 'netSuiteCustomListAddForm',
        NETSUITE_CUSTOM_LIST_ADD_FORM_DRAFT: 'netSuiteCustomListAddFormDraft',
        NETSUITE_TOKEN_INPUT_FORM: 'netsuiteTokenInputForm',
        NETSUITE_TOKEN_INPUT_FORM_DRAFT: 'netsuiteTokenInputFormDraft',
        NETSUITE_CUSTOM_FORM_ID_FORM: 'netsuiteCustomFormIDForm',
        NETSUITE_CUSTOM_FORM_ID_FORM_DRAFT: 'netsuiteCustomFormIDFormDraft',
        SAGE_INTACCT_DIMENSION_TYPE_FORM: 'sageIntacctDimensionTypeForm',
        SAGE_INTACCT_DIMENSION_TYPE_FORM_DRAFT: 'sageIntacctDimensionTypeFormDraft',
        SEARCH_ADVANCED_FILTERS_FORM: 'searchAdvancedFiltersForm',
        SEARCH_ADVANCED_FILTERS_FORM_DRAFT: 'searchAdvancedFiltersFormDraft',
        SEARCH_SAVED_SEARCH_RENAME_FORM: 'searchSavedSearchRenameForm',
        SEARCH_SAVED_SEARCH_RENAME_FORM_DRAFT: 'searchSavedSearchRenameFormDraft',
        TEXT_PICKER_MODAL_FORM: 'textPickerModalForm',
        TEXT_PICKER_MODAL_FORM_DRAFT: 'textPickerModalFormDraft',
        RULES_CUSTOM_NAME_MODAL_FORM: 'rulesCustomNameModalForm',
        RULES_CUSTOM_NAME_MODAL_FORM_DRAFT: 'rulesCustomNameModalFormDraft',
        RULES_AUTO_APPROVE_REPORTS_UNDER_MODAL_FORM: 'rulesAutoApproveReportsUnderModalForm',
        RULES_AUTO_APPROVE_REPORTS_UNDER_MODAL_FORM_DRAFT: 'rulesAutoApproveReportsUnderModalFormDraft',
        RULES_RANDOM_REPORT_AUDIT_MODAL_FORM: 'rulesRandomReportAuditModalForm',
        RULES_RANDOM_REPORT_AUDIT_MODAL_FORM_DRAFT: 'rulesRandomReportAuditModalFormDraft',
        RULES_AUTO_PAY_REPORTS_UNDER_MODAL_FORM: 'rulesAutoPayReportsUnderModalForm',
        RULES_AUTO_PAY_REPORTS_UNDER_MODAL_FORM_DRAFT: 'rulesAutoPayReportsUnderModalFormDraft',
        RULES_REQUIRED_RECEIPT_AMOUNT_FORM: 'rulesRequiredReceiptAmountForm',
        RULES_REQUIRED_RECEIPT_AMOUNT_FORM_DRAFT: 'rulesRequiredReceiptAmountFormDraft',
        RULES_MAX_EXPENSE_AMOUNT_FORM: 'rulesMaxExpenseAmountForm',
        RULES_MAX_EXPENSE_AMOUNT_FORM_DRAFT: 'rulesMaxExpenseAmountFormDraft',
        RULES_MAX_EXPENSE_AGE_FORM: 'rulesMaxExpenseAgeForm',
        RULES_MAX_EXPENSE_AGE_FORM_DRAFT: 'rulesMaxExpenseAgeFormDraft',
        RULES_CUSTOM_FORM: 'rulesCustomForm',
        RULES_CUSTOM_FORM_DRAFT: 'rulesCustomFormDraft',
        DEBUG_DETAILS_FORM: 'debugDetailsForm',
        DEBUG_DETAILS_FORM_DRAFT: 'debugDetailsFormDraft',
        ONBOARDING_WORK_EMAIL_FORM: 'onboardingWorkEmailForm',
        ONBOARDING_WORK_EMAIL_FORM_DRAFT: 'onboardingWorkEmailFormDraft',
        MERGE_ACCOUNT_DETAILS_FORM: 'mergeAccountDetailsForm',
        MERGE_ACCOUNT_DETAILS_FORM_DRAFT: 'mergeAccountDetailsFormDraft',
        WORKSPACE_PER_DIEM_FORM: 'workspacePerDiemForm',
        WORKSPACE_PER_DIEM_FORM_DRAFT: 'workspacePerDiemFormDraft',
    },
    DERIVED: {
        REPORT_ATTRIBUTES: 'reportAttributes',
    },
};
exports.default = ONYXKEYS;
