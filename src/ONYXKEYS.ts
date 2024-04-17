import type {ValueOf} from 'type-fest';
import type CONST from './CONST';
import type * as FormTypes from './types/form';
import type * as OnyxTypes from './types/onyx';
import type AssertTypesEqual from './types/utils/AssertTypesEqual';
import type DeepValueOf from './types/utils/DeepValueOf';

/**
 * This is a file containing constants for all the top level keys in our store
 */
const ONYXKEYS = {
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

    /** Stores current date */
    CURRENT_DATE: 'currentDate',

    /** Credentials to authenticate the user */
    CREDENTIALS: 'credentials',
    STASHED_CREDENTIALS: 'stashedCredentials',

    // Contains loading data for the IOU feature (MoneyRequestModal, IOUDetail, & MoneyRequestPreview Components)
    IOU: 'iou',

    /** Keeps track if there is modal currently visible or not */
    MODAL: 'modal',

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

    /**
     * Contains all the info for Workspace Rate and Unit while editing.
     *
     * Note: This is not under the COLLECTION key as we can edit rate and unit
     * for one workspace only at a time. And we don't need to store
     * rates and units for different workspaces at the same time. */
    WORKSPACE_RATE_AND_UNIT: 'workspaceRateAndUnit',

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

    /** Contains all the users settings for the Settings page and sub pages */
    USER: 'user',

    /** Contains latitude and longitude of user's last known location */
    USER_LOCATION: 'userLocation',

    /** Contains metadata (partner, login, validation date) for all of the user's logins */
    LOGIN_LIST: 'loginList',

    /** Information about the current session (authToken, accountID, email, loading, error) */
    SESSION: 'session',
    STASHED_SESSION: 'stashedSession',
    BETAS: 'betas',

    /** NVP keys */

    /** Boolean flag only true when first set */
    NVP_IS_FIRST_TIME_NEW_EXPENSIFY_USER: 'nvp_isFirstTimeNewExpensifyUser',

    /** Contains the user preference for the LHN priority mode */
    NVP_PRIORITY_MODE: 'nvp_priorityMode',

    /** Contains the users's block expiration (if they have one) */
    NVP_BLOCKED_FROM_CONCIERGE: 'nvp_private_blockedFromConcierge',

    /** A unique identifier that each user has that's used to send notifications */
    NVP_PRIVATE_PUSH_NOTIFICATION_ID: 'nvp_private_pushNotificationID',

    /** The NVP with the last payment method used per policy */
    NVP_LAST_PAYMENT_METHOD: 'nvp_private_lastPaymentMethod',

    /** This NVP holds to most recent waypoints that a person has used when creating a distance request */
    NVP_RECENT_WAYPOINTS: 'expensify_recentWaypoints',

    /** This NVP will be `true` if the user has ever dismissed the engagement modal on either OldDot or NewDot. If it becomes true it should stay true forever. */
    NVP_HAS_DISMISSED_IDLE_PANEL: 'nvp_hasDismissedIdlePanel',

    /** This NVP contains the choice that the user made on the engagement modal */
    NVP_INTRO_SELECTED: 'nvp_introSelected',

    /** This NVP contains the active policyID */
    NVP_ACTIVE_POLICY_ID: 'nvp_expensify_activePolicyID',

    /** This NVP contains the referral banners the user dismissed */
    NVP_DISMISSED_REFERRAL_BANNERS: 'nvp_dismissedReferralBanners',

    /** Indicates which locale should be used */
    NVP_PREFERRED_LOCALE: 'nvp_preferredLocale',

    /** Whether the user has tried focus mode yet */
    NVP_TRY_FOCUS_MODE: 'nvp_tryFocusMode',

    /** Whether the user has been shown the hold educational interstitial yet */
    NVP_HOLD_USE_EXPLAINED: 'holdUseExplained',

    /** Store preferred skintone for emoji */
    PREFERRED_EMOJI_SKIN_TONE: 'nvp_expensify_preferredEmojiSkinTone',

    /** Store frequently used emojis for this user */
    FREQUENTLY_USED_EMOJIS: 'nvp_expensify_frequentlyUsedEmojis',

    /** The NVP with the last distance rate used per policy */
    NVP_LAST_SELECTED_DISTANCE_RATES: 'nvp_expensify_lastSelectedDistanceRates',

    /** The NVP with the last action taken (for the Quick Action Button) */
    NVP_QUICK_ACTION_GLOBAL_CREATE: 'nvp_quickActionGlobalCreate',

    /** Does this user have push notifications enabled for this device? */
    PUSH_NOTIFICATIONS_ENABLED: 'pushNotificationsEnabled',

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

    /** Boolean flag used to display the focus mode notification */
    FOCUS_MODE_NOTIFICATION: 'focusModeNotification',

    /** Stores information about the user's saved statements */
    WALLET_STATEMENT: 'walletStatement',

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

    /** Is the user in the process of switching to OldDot? */
    IS_SWITCHING_TO_OLD_DOT: 'isSwitchingToOldDot',

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
    PREFERRED_THEME: 'preferredTheme',

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

    // Max width supported for HTML <canvas> element
    MAX_CANVAS_WIDTH: 'maxCanvasWidth',

    // Stores last visited path
    LAST_VISITED_PATH: 'lastVisitedPath',

    // Stores the recently used report fields
    RECENTLY_USED_REPORT_FIELDS: 'recentlyUsedReportFields',

    /** Indicates whether an forced upgrade is required */
    UPDATE_REQUIRED: 'updateRequired',

    /** Indicates whether an forced reset is required. Used in emergency situations where we must completely erase the Onyx data in the client because it is in a bad state. This will clear Oynx data without signing the user out. */
    RESET_REQUIRED: 'resetRequired',

    /** Stores the logs of the app for debugging purposes */
    LOGS: 'logs',

    /** Indicates whether we should store logs or not */
    SHOULD_STORE_LOGS: 'shouldStoreLogs',

    /** Stores new group chat draft */
    NEW_GROUP_CHAT_DRAFT: 'newGroupChatDraft',

    // Paths of PDF file that has been cached during one session
    CACHED_PDF_PATHS: 'cachedPDFPaths',

    /** Holds the checks used while transferring the ownership of the workspace */
    POLICY_OWNERSHIP_CHANGE_CHECKS: 'policyOwnershipChangeChecks',

    /** Collection Keys */
    COLLECTION: {
        DOWNLOAD: 'download_',
        POLICY: 'policy_',
        POLICY_DRAFTS: 'policyDrafts_',
        POLICY_JOIN_MEMBER: 'policyJoinMember_',
        POLICY_CATEGORIES: 'policyCategories_',
        POLICY_RECENTLY_USED_CATEGORIES: 'policyRecentlyUsedCategories_',
        POLICY_TAGS: 'policyTags_',
        POLICY_RECENTLY_USED_TAGS: 'nvp_recentlyUsedTags_',
        OLD_POLICY_RECENTLY_USED_TAGS: 'policyRecentlyUsedTags_',
        WORKSPACE_INVITE_MEMBERS_DRAFT: 'workspaceInviteMembersDraft_',
        WORKSPACE_INVITE_MESSAGE_DRAFT: 'workspaceInviteMessageDraft_',
        REPORT: 'report_',
        // REPORT_METADATA is a perf optimization used to hold loading states (isLoadingInitialReportActions, isLoadingOlderReportActions, isLoadingNewerReportActions).
        // A lot of components are connected to the Report entity and do not care about the actions. Setting the loading state
        // directly on the report caused a lot of unnecessary re-renders
        REPORT_METADATA: 'reportMetadata_',
        REPORT_ACTIONS: 'reportActions_',
        REPORT_ACTIONS_DRAFTS: 'reportActionsDrafts_',
        REPORT_ACTIONS_REACTIONS: 'reportActionsReactions_',
        REPORT_DRAFT_COMMENT: 'reportDraftComment_',
        REPORT_DRAFT_COMMENT_NUMBER_OF_LINES: 'reportDraftCommentNumberOfLines_',
        REPORT_IS_COMPOSER_FULL_SIZE: 'reportIsComposerFullSize_',
        REPORT_USER_IS_TYPING: 'reportUserIsTyping_',
        REPORT_USER_IS_LEAVING_ROOM: 'reportUserIsLeavingRoom_',
        SECURITY_GROUP: 'securityGroup_',
        TRANSACTION: 'transactions_',
        TRANSACTION_VIOLATIONS: 'transactionViolations_',
        TRANSACTION_DRAFT: 'transactionsDraft_',

        // Holds temporary transactions used during the creation and edit flow
        TRANSACTION_BACKUP: 'transactionsBackup_',
        SPLIT_TRANSACTION_DRAFT: 'splitTransactionDraft_',
        PRIVATE_NOTES_DRAFT: 'privateNotesDraft_',
        NEXT_STEP: 'reportNextStep_',

        // Manual request tab selector
        SELECTED_TAB: 'selectedTab_',

        /** This is deprecated, but needed for a migration, so we still need to include it here so that it will be initialized in Onyx.init */
        DEPRECATED_POLICY_MEMBER_LIST: 'policyMemberList_',

        POLICY_CONNECTION_SYNC_PROGRESS: 'policyConnectionSyncProgress_',
    },

    /** List of Form ids */
    FORMS: {
        ADD_DEBIT_CARD_FORM: 'addDebitCardForm',
        ADD_DEBIT_CARD_FORM_DRAFT: 'addDebitCardFormDraft',
        WORKSPACE_SETTINGS_FORM: 'workspaceSettingsForm',
        WORKSPACE_CATEGORY_FORM: 'workspaceCategoryForm',
        WORKSPACE_CATEGORY_FORM_DRAFT: 'workspaceCategoryFormDraft',
        WORKSPACE_TAG_FORM: 'workspaceTagForm',
        WORKSPACE_TAG_FORM_DRAFT: 'workspaceTagFormDraft',
        WORKSPACE_SETTINGS_FORM_DRAFT: 'workspaceSettingsFormDraft',
        WORKSPACE_DESCRIPTION_FORM: 'workspaceDescriptionForm',
        WORKSPACE_DESCRIPTION_FORM_DRAFT: 'workspaceDescriptionFormDraft',
        WORKSPACE_RATE_AND_UNIT_FORM: 'workspaceRateAndUnitForm',
        WORKSPACE_RATE_AND_UNIT_FORM_DRAFT: 'workspaceRateAndUnitFormDraft',
        WORKSPACE_TAX_CUSTOM_NAME: 'workspaceTaxCustomName',
        WORKSPACE_TAX_CUSTOM_NAME_DRAFT: 'workspaceTaxCustomNameDraft',
        POLICY_CREATE_DISTANCE_RATE_FORM: 'policyCreateDistanceRateForm',
        POLICY_CREATE_DISTANCE_RATE_FORM_DRAFT: 'policyCreateDistanceRateFormDraft',
        POLICY_DISTANCE_RATE_EDIT_FORM: 'policyDistanceRateEditForm',
        POLICY_DISTANCE_RATE_EDIT_FORM_DRAFT: 'policyDistanceRateEditFormDraft',
        CLOSE_ACCOUNT_FORM: 'closeAccount',
        CLOSE_ACCOUNT_FORM_DRAFT: 'closeAccountDraft',
        PROFILE_SETTINGS_FORM: 'profileSettingsForm',
        PROFILE_SETTINGS_FORM_DRAFT: 'profileSettingsFormDraft',
        DISPLAY_NAME_FORM: 'displayNameForm',
        DISPLAY_NAME_FORM_DRAFT: 'displayNameFormDraft',
        ONBOARDING_PERSONAL_DETAILS_FORM: 'onboardingPersonalDetailsForm',
        ONBOARDING_PERSONAL_DETAILS_FORM_DRAFT: 'onboardingPersonalDetailsFormDraft',
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
        GET_PHYSICAL_CARD_FORM: 'getPhysicalCardForm',
        GET_PHYSICAL_CARD_FORM_DRAFT: 'getPhysicalCardFormDraft',
        REPORT_FIELD_EDIT_FORM: 'reportFieldEditForm',
        REPORT_FIELD_EDIT_FORM_DRAFT: 'reportFieldEditFormDraft',
        REIMBURSEMENT_ACCOUNT_FORM: 'reimbursementAccount',
        REIMBURSEMENT_ACCOUNT_FORM_DRAFT: 'reimbursementAccountDraft',
        PERSONAL_BANK_ACCOUNT_FORM: 'personalBankAccount',
        PERSONAL_BANK_ACCOUNT_FORM_DRAFT: 'personalBankAccountDraft',
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
        WORKSPACE_TAX_NAME_FORM_DRAFT: 'workspaceTaxNameFormDraft',
        WORKSPACE_TAX_VALUE_FORM: 'workspaceTaxValueForm',
        WORKSPACE_TAX_VALUE_FORM_DRAFT: 'workspaceTaxValueFormDraft',
        NEW_CHAT_NAME_FORM: 'newChatNameForm',
        NEW_CHAT_NAME_FORM_DRAFT: 'newChatNameFormDraft',
    },
} as const;

type AllOnyxKeys = DeepValueOf<typeof ONYXKEYS>;

type OnyxFormValuesMapping = {
    [ONYXKEYS.FORMS.ADD_DEBIT_CARD_FORM]: FormTypes.AddDebitCardForm;
    [ONYXKEYS.FORMS.WORKSPACE_SETTINGS_FORM]: FormTypes.WorkspaceSettingsForm;
    [ONYXKEYS.FORMS.WORKSPACE_CATEGORY_FORM]: FormTypes.WorkspaceCategoryForm;
    [ONYXKEYS.FORMS.WORKSPACE_TAG_FORM]: FormTypes.WorkspaceTagForm;
    [ONYXKEYS.FORMS.WORKSPACE_RATE_AND_UNIT_FORM]: FormTypes.WorkspaceRateAndUnitForm;
    [ONYXKEYS.FORMS.WORKSPACE_TAX_CUSTOM_NAME]: FormTypes.WorkspaceTaxCustomName;
    [ONYXKEYS.FORMS.CLOSE_ACCOUNT_FORM]: FormTypes.CloseAccountForm;
    [ONYXKEYS.FORMS.PROFILE_SETTINGS_FORM]: FormTypes.ProfileSettingsForm;
    [ONYXKEYS.FORMS.DISPLAY_NAME_FORM]: FormTypes.DisplayNameForm;
    [ONYXKEYS.FORMS.ONBOARDING_PERSONAL_DETAILS_FORM]: FormTypes.DisplayNameForm;
    [ONYXKEYS.FORMS.ROOM_NAME_FORM]: FormTypes.RoomNameForm;
    [ONYXKEYS.FORMS.REPORT_DESCRIPTION_FORM]: FormTypes.ReportDescriptionForm;
    [ONYXKEYS.FORMS.LEGAL_NAME_FORM]: FormTypes.LegalNameForm;
    [ONYXKEYS.FORMS.WORKSPACE_INVITE_MESSAGE_FORM]: FormTypes.WorkspaceInviteMessageForm;
    [ONYXKEYS.FORMS.DATE_OF_BIRTH_FORM]: FormTypes.DateOfBirthForm;
    [ONYXKEYS.FORMS.HOME_ADDRESS_FORM]: FormTypes.HomeAddressForm;
    [ONYXKEYS.FORMS.NEW_ROOM_FORM]: FormTypes.NewRoomForm;
    [ONYXKEYS.FORMS.ROOM_SETTINGS_FORM]: FormTypes.RoomSettingsForm;
    [ONYXKEYS.FORMS.NEW_TASK_FORM]: FormTypes.NewTaskForm;
    [ONYXKEYS.FORMS.EDIT_TASK_FORM]: FormTypes.EditTaskForm;
    [ONYXKEYS.FORMS.EXIT_SURVEY_REASON_FORM]: FormTypes.ExitSurveyReasonForm;
    [ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM]: FormTypes.ExitSurveyResponseForm;
    [ONYXKEYS.FORMS.MONEY_REQUEST_DESCRIPTION_FORM]: FormTypes.MoneyRequestDescriptionForm;
    [ONYXKEYS.FORMS.MONEY_REQUEST_MERCHANT_FORM]: FormTypes.MoneyRequestMerchantForm;
    [ONYXKEYS.FORMS.MONEY_REQUEST_AMOUNT_FORM]: FormTypes.MoneyRequestAmountForm;
    [ONYXKEYS.FORMS.MONEY_REQUEST_DATE_FORM]: FormTypes.MoneyRequestDateForm;
    [ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM]: FormTypes.MoneyRequestHoldReasonForm;
    [ONYXKEYS.FORMS.NEW_CONTACT_METHOD_FORM]: FormTypes.NewContactMethodForm;
    [ONYXKEYS.FORMS.WAYPOINT_FORM]: FormTypes.WaypointForm;
    [ONYXKEYS.FORMS.SETTINGS_STATUS_SET_FORM]: FormTypes.SettingsStatusSetForm;
    [ONYXKEYS.FORMS.SETTINGS_STATUS_CLEAR_DATE_FORM]: FormTypes.SettingsStatusClearDateForm;
    [ONYXKEYS.FORMS.SETTINGS_STATUS_SET_CLEAR_AFTER_FORM]: FormTypes.SettingsStatusSetClearAfterForm;
    [ONYXKEYS.FORMS.PRIVATE_NOTES_FORM]: FormTypes.PrivateNotesForm;
    [ONYXKEYS.FORMS.I_KNOW_A_TEACHER_FORM]: FormTypes.IKnowTeacherForm;
    [ONYXKEYS.FORMS.INTRO_SCHOOL_PRINCIPAL_FORM]: FormTypes.IntroSchoolPrincipalForm;
    [ONYXKEYS.FORMS.REPORT_VIRTUAL_CARD_FRAUD]: FormTypes.ReportVirtualCardFraudForm;
    [ONYXKEYS.FORMS.REPORT_PHYSICAL_CARD_FORM]: FormTypes.ReportPhysicalCardForm;
    [ONYXKEYS.FORMS.GET_PHYSICAL_CARD_FORM]: FormTypes.GetPhysicalCardForm;
    [ONYXKEYS.FORMS.REPORT_FIELD_EDIT_FORM]: FormTypes.ReportFieldEditForm;
    [ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM]: FormTypes.ReimbursementAccountForm;
    [ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM]: FormTypes.PersonalBankAccountForm;
    [ONYXKEYS.FORMS.WORKSPACE_DESCRIPTION_FORM]: FormTypes.WorkspaceDescriptionForm;
    [ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS]: FormTypes.AdditionalDetailStepForm;
    [ONYXKEYS.FORMS.POLICY_TAG_NAME_FORM]: FormTypes.PolicyTagNameForm;
    [ONYXKEYS.FORMS.WORKSPACE_NEW_TAX_FORM]: FormTypes.WorkspaceNewTaxForm;
    [ONYXKEYS.FORMS.POLICY_CREATE_DISTANCE_RATE_FORM]: FormTypes.PolicyCreateDistanceRateForm;
    [ONYXKEYS.FORMS.POLICY_DISTANCE_RATE_EDIT_FORM]: FormTypes.PolicyDistanceRateEditForm;
    [ONYXKEYS.FORMS.WORKSPACE_TAX_NAME_FORM]: FormTypes.WorkspaceTaxNameForm;
    [ONYXKEYS.FORMS.WORKSPACE_TAX_VALUE_FORM]: FormTypes.WorkspaceTaxValueForm;
    [ONYXKEYS.FORMS.NEW_CHAT_NAME_FORM]: FormTypes.NewChatNameForm;
};

type OnyxFormDraftValuesMapping = {
    [K in keyof OnyxFormValuesMapping as `${K}Draft`]: OnyxFormValuesMapping[K];
};

type OnyxCollectionValuesMapping = {
    [ONYXKEYS.COLLECTION.DOWNLOAD]: OnyxTypes.Download;
    [ONYXKEYS.COLLECTION.POLICY]: OnyxTypes.Policy;
    [ONYXKEYS.COLLECTION.POLICY_DRAFTS]: OnyxTypes.Policy;
    [ONYXKEYS.COLLECTION.POLICY_CATEGORIES]: OnyxTypes.PolicyCategories;
    [ONYXKEYS.COLLECTION.POLICY_TAGS]: OnyxTypes.PolicyTagList;
    [ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES]: OnyxTypes.RecentlyUsedCategories;
    [ONYXKEYS.COLLECTION.DEPRECATED_POLICY_MEMBER_LIST]: OnyxTypes.PolicyEmployeeList;
    [ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT]: OnyxTypes.InvitedEmailsToAccountIDs;
    [ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MESSAGE_DRAFT]: string;
    [ONYXKEYS.COLLECTION.REPORT]: OnyxTypes.Report;
    [ONYXKEYS.COLLECTION.REPORT_METADATA]: OnyxTypes.ReportMetadata;
    [ONYXKEYS.COLLECTION.REPORT_ACTIONS]: OnyxTypes.ReportActions;
    [ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS]: OnyxTypes.ReportActionsDrafts;
    [ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS]: OnyxTypes.ReportActionReactions;
    [ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT]: string;
    [ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT_NUMBER_OF_LINES]: number;
    [ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE]: boolean;
    [ONYXKEYS.COLLECTION.REPORT_USER_IS_TYPING]: OnyxTypes.ReportUserIsTyping;
    [ONYXKEYS.COLLECTION.REPORT_USER_IS_LEAVING_ROOM]: boolean;
    [ONYXKEYS.COLLECTION.SECURITY_GROUP]: OnyxTypes.SecurityGroup;
    [ONYXKEYS.COLLECTION.TRANSACTION]: OnyxTypes.Transaction;
    [ONYXKEYS.COLLECTION.TRANSACTION_DRAFT]: OnyxTypes.Transaction;
    [ONYXKEYS.COLLECTION.TRANSACTION_BACKUP]: OnyxTypes.Transaction;
    [ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS]: OnyxTypes.TransactionViolations;
    [ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT]: OnyxTypes.Transaction;
    [ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS]: OnyxTypes.RecentlyUsedTags;
    [ONYXKEYS.COLLECTION.OLD_POLICY_RECENTLY_USED_TAGS]: OnyxTypes.RecentlyUsedTags;
    [ONYXKEYS.COLLECTION.SELECTED_TAB]: OnyxTypes.SelectedTabRequest;
    [ONYXKEYS.COLLECTION.PRIVATE_NOTES_DRAFT]: string;
    [ONYXKEYS.COLLECTION.NEXT_STEP]: OnyxTypes.ReportNextStep;
    [ONYXKEYS.COLLECTION.POLICY_JOIN_MEMBER]: OnyxTypes.PolicyJoinMember;
    [ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS]: OnyxTypes.PolicyConnectionSyncProgress;
};

type OnyxValuesMapping = {
    [ONYXKEYS.ACCOUNT]: OnyxTypes.Account;
    [ONYXKEYS.ACCOUNT_MANAGER_REPORT_ID]: string;
    [ONYXKEYS.NVP_IS_FIRST_TIME_NEW_EXPENSIFY_USER]: boolean;
    [ONYXKEYS.ACTIVE_CLIENTS]: string[];
    [ONYXKEYS.DEVICE_ID]: string;
    [ONYXKEYS.IS_SIDEBAR_LOADED]: boolean;
    [ONYXKEYS.PERSISTED_REQUESTS]: OnyxTypes.Request[];
    [ONYXKEYS.CURRENT_DATE]: string;
    [ONYXKEYS.CREDENTIALS]: OnyxTypes.Credentials;
    [ONYXKEYS.STASHED_CREDENTIALS]: OnyxTypes.Credentials;
    [ONYXKEYS.IOU]: OnyxTypes.IOU;
    [ONYXKEYS.MODAL]: OnyxTypes.Modal;
    [ONYXKEYS.NETWORK]: OnyxTypes.Network;
    [ONYXKEYS.NEW_GROUP_CHAT_DRAFT]: OnyxTypes.NewGroupChatDraft;
    [ONYXKEYS.CUSTOM_STATUS_DRAFT]: OnyxTypes.CustomStatusDraft;
    [ONYXKEYS.INPUT_FOCUSED]: boolean;
    [ONYXKEYS.PERSONAL_DETAILS_LIST]: OnyxTypes.PersonalDetailsList;
    [ONYXKEYS.PRIVATE_PERSONAL_DETAILS]: OnyxTypes.PrivatePersonalDetails;
    [ONYXKEYS.PERSONAL_DETAILS_METADATA]: Record<string, OnyxTypes.PersonalDetailsMetadata>;
    [ONYXKEYS.TASK]: OnyxTypes.Task;
    [ONYXKEYS.WORKSPACE_RATE_AND_UNIT]: OnyxTypes.WorkspaceRateAndUnit;
    [ONYXKEYS.CURRENCY_LIST]: OnyxTypes.CurrencyList;
    [ONYXKEYS.UPDATE_AVAILABLE]: boolean;
    [ONYXKEYS.SCREEN_SHARE_REQUEST]: OnyxTypes.ScreenShareRequest;
    [ONYXKEYS.COUNTRY_CODE]: number;
    [ONYXKEYS.COUNTRY]: string;
    [ONYXKEYS.USER]: OnyxTypes.User;
    [ONYXKEYS.USER_LOCATION]: OnyxTypes.UserLocation;
    [ONYXKEYS.LOGIN_LIST]: OnyxTypes.LoginList;
    [ONYXKEYS.SESSION]: OnyxTypes.Session;
    [ONYXKEYS.STASHED_SESSION]: OnyxTypes.Session;
    [ONYXKEYS.BETAS]: OnyxTypes.Beta[];
    [ONYXKEYS.NVP_PRIORITY_MODE]: ValueOf<typeof CONST.PRIORITY_MODE>;
    [ONYXKEYS.NVP_BLOCKED_FROM_CONCIERGE]: OnyxTypes.BlockedFromConcierge;
    [ONYXKEYS.NVP_PRIVATE_PUSH_NOTIFICATION_ID]: string;
    [ONYXKEYS.NVP_TRY_FOCUS_MODE]: boolean;
    [ONYXKEYS.NVP_HOLD_USE_EXPLAINED]: boolean;
    [ONYXKEYS.FOCUS_MODE_NOTIFICATION]: boolean;
    [ONYXKEYS.NVP_LAST_PAYMENT_METHOD]: OnyxTypes.LastPaymentMethod;
    [ONYXKEYS.NVP_RECENT_WAYPOINTS]: OnyxTypes.RecentWaypoint[];
    [ONYXKEYS.NVP_HAS_DISMISSED_IDLE_PANEL]: boolean;
    [ONYXKEYS.NVP_INTRO_SELECTED]: OnyxTypes.IntroSelected;
    [ONYXKEYS.NVP_LAST_SELECTED_DISTANCE_RATES]: OnyxTypes.LastSelectedDistanceRates;
    [ONYXKEYS.PUSH_NOTIFICATIONS_ENABLED]: boolean;
    [ONYXKEYS.PLAID_DATA]: OnyxTypes.PlaidData;
    [ONYXKEYS.IS_PLAID_DISABLED]: boolean;
    [ONYXKEYS.PLAID_LINK_TOKEN]: string;
    [ONYXKEYS.ONFIDO_TOKEN]: string;
    [ONYXKEYS.ONFIDO_APPLICANT_ID]: string;
    [ONYXKEYS.NVP_PREFERRED_LOCALE]: OnyxTypes.Locale;
    [ONYXKEYS.NVP_ACTIVE_POLICY_ID]: string;
    [ONYXKEYS.NVP_DISMISSED_REFERRAL_BANNERS]: OnyxTypes.DismissedReferralBanners;
    [ONYXKEYS.USER_WALLET]: OnyxTypes.UserWallet;
    [ONYXKEYS.WALLET_ONFIDO]: OnyxTypes.WalletOnfido;
    [ONYXKEYS.WALLET_ADDITIONAL_DETAILS]: OnyxTypes.WalletAdditionalDetails;
    [ONYXKEYS.WALLET_TERMS]: OnyxTypes.WalletTerms;
    [ONYXKEYS.BANK_ACCOUNT_LIST]: OnyxTypes.BankAccountList;
    [ONYXKEYS.FUND_LIST]: OnyxTypes.FundList;
    [ONYXKEYS.CARD_LIST]: OnyxTypes.CardList;
    [ONYXKEYS.WALLET_STATEMENT]: OnyxTypes.WalletStatement;
    [ONYXKEYS.PERSONAL_BANK_ACCOUNT]: OnyxTypes.PersonalBankAccount;
    [ONYXKEYS.REIMBURSEMENT_ACCOUNT]: OnyxTypes.ReimbursementAccount;
    [ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE]: string | number;
    [ONYXKEYS.FREQUENTLY_USED_EMOJIS]: OnyxTypes.FrequentlyUsedEmoji[];
    [ONYXKEYS.REIMBURSEMENT_ACCOUNT_WORKSPACE_ID]: string;
    [ONYXKEYS.IS_LOADING_PAYMENT_METHODS]: boolean;
    [ONYXKEYS.IS_LOADING_REPORT_DATA]: boolean;
    [ONYXKEYS.IS_TEST_TOOLS_MODAL_OPEN]: boolean;
    [ONYXKEYS.APP_PROFILING_IN_PROGRESS]: boolean;
    [ONYXKEYS.IS_LOADING_APP]: boolean;
    [ONYXKEYS.IS_SWITCHING_TO_OLD_DOT]: boolean;
    [ONYXKEYS.WALLET_TRANSFER]: OnyxTypes.WalletTransfer;
    [ONYXKEYS.LAST_ACCESSED_WORKSPACE_POLICY_ID]: string;
    [ONYXKEYS.SHOULD_SHOW_COMPOSE_INPUT]: boolean;
    [ONYXKEYS.IS_BETA]: boolean;
    [ONYXKEYS.IS_CHECKING_PUBLIC_ROOM]: boolean;
    [ONYXKEYS.MY_DOMAIN_SECURITY_GROUPS]: Record<string, string>;
    [ONYXKEYS.LAST_OPENED_PUBLIC_ROOM_ID]: string;
    [ONYXKEYS.PREFERRED_THEME]: ValueOf<typeof CONST.THEME>;
    [ONYXKEYS.MAPBOX_ACCESS_TOKEN]: OnyxTypes.MapboxAccessToken;
    [ONYXKEYS.ONYX_UPDATES_FROM_SERVER]: OnyxTypes.OnyxUpdatesFromServer;
    [ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT]: number;
    [ONYXKEYS.MAX_CANVAS_AREA]: number;
    [ONYXKEYS.MAX_CANVAS_HEIGHT]: number;
    [ONYXKEYS.MAX_CANVAS_WIDTH]: number;
    [ONYXKEYS.ONBOARDING_PURPOSE_SELECTED]: string;
    [ONYXKEYS.IS_SEARCHING_FOR_REPORTS]: boolean;
    [ONYXKEYS.LAST_VISITED_PATH]: string | undefined;
    [ONYXKEYS.RECENTLY_USED_REPORT_FIELDS]: OnyxTypes.RecentlyUsedReportFields;
    [ONYXKEYS.UPDATE_REQUIRED]: boolean;
    [ONYXKEYS.RESET_REQUIRED]: boolean;
    [ONYXKEYS.PLAID_CURRENT_EVENT]: string;
    [ONYXKEYS.LOGS]: OnyxTypes.CapturedLogs;
    [ONYXKEYS.SHOULD_STORE_LOGS]: boolean;
    [ONYXKEYS.CACHED_PDF_PATHS]: Record<string, string>;
    [ONYXKEYS.POLICY_OWNERSHIP_CHANGE_CHECKS]: Record<string, OnyxTypes.PolicyOwnershipChangeChecks>;
    [ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE]: OnyxTypes.QuickAction;
};

type OnyxValues = OnyxValuesMapping & OnyxCollectionValuesMapping & OnyxFormValuesMapping & OnyxFormDraftValuesMapping;

type OnyxCollectionKey = keyof OnyxCollectionValuesMapping;
type OnyxFormKey = keyof OnyxFormValuesMapping;
type OnyxFormDraftKey = keyof OnyxFormDraftValuesMapping;
type OnyxValueKey = keyof OnyxValuesMapping;

type OnyxKey = OnyxValueKey | OnyxCollectionKey | OnyxFormKey | OnyxFormDraftKey;

type MissingOnyxKeysError = `Error: Types don't match, OnyxKey type is missing: ${Exclude<AllOnyxKeys, OnyxKey>}`;
/** If this type errors, it means that the `OnyxKey` type is missing some keys. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type AssertOnyxKeys = AssertTypesEqual<AllOnyxKeys, OnyxKey, MissingOnyxKeysError>;

export default ONYXKEYS;
export type {OnyxCollectionKey, OnyxCollectionValuesMapping, OnyxFormDraftKey, OnyxFormKey, OnyxFormValuesMapping, OnyxKey, OnyxValueKey, OnyxValues};
