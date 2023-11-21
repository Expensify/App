import {OnyxEntry} from 'react-native-onyx/lib/types';
import {ValueOf} from 'type-fest';
import CONST from './CONST';
import * as OnyxTypes from './types/onyx';
import DeepValueOf from './types/utils/DeepValueOf';

/**
 * This is a file containing constants for all the top level keys in our store
 */
const ONYXKEYS = {
    /** Holds information about the users account that is logging in */
    ACCOUNT: 'account',

    /** Holds the reportID for the report between the user and their account manager */
    ACCOUNT_MANAGER_REPORT_ID: 'accountManagerReportID',

    /** Boolean flag only true when first set */
    NVP_IS_FIRST_TIME_NEW_EXPENSIFY_USER: 'isFirstTimeNewExpensifyUser',

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

    /** Contains all the users settings for the Settings page and sub pages */
    USER: 'user',

    /** Contains metadata (partner, login, validation date) for all of the user's logins */
    LOGIN_LIST: 'loginList',

    /** Information about the current session (authToken, accountID, email, loading, error) */
    SESSION: 'session',
    BETAS: 'betas',

    /** NVP keys
    /** Contains the user preference for the LHN priority mode */
    NVP_PRIORITY_MODE: 'nvp_priorityMode',

    /** Contains the users's block expiration (if they have one) */
    NVP_BLOCKED_FROM_CONCIERGE: 'private_blockedFromConcierge',

    /** A unique identifier that each user has that's used to send notifications */
    NVP_PRIVATE_PUSH_NOTIFICATION_ID: 'private_pushNotificationID',

    /** The NVP with the last payment method used per policy */
    NVP_LAST_PAYMENT_METHOD: 'nvp_lastPaymentMethod',

    /** This NVP holds to most recent waypoints that a person has used when creating a distance request */
    NVP_RECENT_WAYPOINTS: 'expensify_recentWaypoints',

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

    /** Indicates which locale should be used */
    NVP_PREFERRED_LOCALE: 'preferredLocale',

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

    /** Stores information about the user's saved statements */
    WALLET_STATEMENT: 'walletStatement',

    /** Stores information about the active personal bank account being set up */
    PERSONAL_BANK_ACCOUNT: 'personalBankAccount',

    /** Stores information about the active reimbursement account being set up */
    REIMBURSEMENT_ACCOUNT: 'reimbursementAccount',

    /** Stores draft information about the active reimbursement account being set up */
    REIMBURSEMENT_ACCOUNT_DRAFT: 'reimbursementAccountDraft',

    /** Store preferred skintone for emoji */
    PREFERRED_EMOJI_SKIN_TONE: 'preferredEmojiSkinTone',

    /** Store frequently used emojis for this user */
    FREQUENTLY_USED_EMOJIS: 'frequentlyUsedEmojis',

    /** Stores Workspace ID that will be tied to reimbursement account during setup */
    REIMBURSEMENT_ACCOUNT_WORKSPACE_ID: 'reimbursementAccountWorkspaceID',

    /** Set when we are loading payment methods */
    IS_LOADING_PAYMENT_METHODS: 'isLoadingPaymentMethods',

    /** Is report data loading? */
    IS_LOADING_REPORT_DATA: 'isLoadingReportData',

    /** Is report data loading? */
    IS_LOADING_APP: 'isLoadingApp',

    /** Is the test tools modal open? */
    IS_TEST_TOOLS_MODAL_OPEN: 'isTestToolsModalOpen',

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

    // Experimental memory only Onyx mode flag
    IS_USING_MEMORY_ONLY_KEYS: 'isUsingMemoryOnlyKeys',

    // Information about the onyx updates IDs that were received from the server
    ONYX_UPDATES_FROM_SERVER: 'onyxUpdatesFromServer',

    // The last update ID that was applied to the client
    ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT: 'OnyxUpdatesLastUpdateIDAppliedToClient',

    // Receipt upload modal
    RECEIPT_MODAL: 'receiptModal',

    // The access token to be used with the Mapbox library
    MAPBOX_ACCESS_TOKEN: 'mapboxAccessToken',

    // Information on any active demos being run
    DEMO_INFO: 'demoInfo',

    // Max area supported for HTML <canvas> element
    MAX_CANVAS_AREA: 'maxCanvasArea',

    // Max height supported for HTML <canvas> element
    MAX_CANVAS_HEIGHT: 'maxCanvasHeight',

    // Max width supported for HTML <canvas> element
    MAX_CANVAS_WIDTH: 'maxCanvasWidth',

    /** Collection Keys */
    COLLECTION: {
        DOWNLOAD: 'download_',
        POLICY: 'policy_',
        POLICY_MEMBERS: 'policyMembers_',
        POLICY_DRAFTS: 'policyDrafts_',
        POLICY_MEMBERS_DRAFTS: 'policyMembersDrafts_',
        POLICY_CATEGORIES: 'policyCategories_',
        POLICY_RECENTLY_USED_CATEGORIES: 'policyRecentlyUsedCategories_',
        POLICY_TAGS: 'policyTags_',
        POLICY_RECENTLY_USED_TAGS: 'policyRecentlyUsedTags_',
        WORKSPACE_INVITE_MEMBERS_DRAFT: 'workspaceInviteMembersDraft_',
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
        SPLIT_TRANSACTION_DRAFT: 'splitTransactionDraft_',
        PRIVATE_NOTES_DRAFT: 'privateNotesDraft_',
        NEXT_STEP: 'reportNextStep_',

        // Manual request tab selector
        SELECTED_TAB: 'selectedTab_',

        /** This is deprecated, but needed for a migration, so we still need to include it here so that it will be initialized in Onyx.init */
        DEPRECATED_POLICY_MEMBER_LIST: 'policyMemberList_',
    },

    /** List of Form ids */
    FORMS: {
        ADD_DEBIT_CARD_FORM: 'addDebitCardForm',
        ADD_DEBIT_CARD_FORM_DRAFT: 'addDebitCardFormDraft',
        WORKSPACE_SETTINGS_FORM: 'workspaceSettingsForm',
        WORKSPACE_SETTINGS_FORM_DRAFT: 'workspaceSettingsFormDraft',
        WORKSPACE_RATE_AND_UNIT_FORM: 'workspaceRateAndUnitForm',
        WORKSPACE_RATE_AND_UNIT_FORM_DRAFT: 'workspaceRateAndUnitFormDraft',
        CLOSE_ACCOUNT_FORM: 'closeAccount',
        CLOSE_ACCOUNT_FORM_DRAFT: 'closeAccountDraft',
        PROFILE_SETTINGS_FORM: 'profileSettingsForm',
        PROFILE_SETTINGS_FORM_DRAFT: 'profileSettingsFormDraft',
        DISPLAY_NAME_FORM: 'displayNameForm',
        DISPLAY_NAME_FORM_DRAFT: 'displayNameFormDraft',
        ROOM_NAME_FORM: 'roomNameForm',
        ROOM_NAME_FORM_DRAFT: 'roomNameFormDraft',
        WELCOME_MESSAGE_FORM: 'welcomeMessageForm',
        WELCOME_MESSAGE_FORM_DRAFT: 'welcomeMessageFormDraft',
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
        NEW_CONTACT_METHOD_FORM: 'newContactMethodForm',
        NEW_CONTACT_METHOD_FORM_DRAFT: 'newContactMethodFormDraft',
        WAYPOINT_FORM: 'waypointForm',
        WAYPOINT_FORM_DRAFT: 'waypointFormDraft',
        SETTINGS_STATUS_SET_FORM: 'settingsStatusSetForm',
        SETTINGS_STATUS_SET_FORM_DRAFT: 'settingsStatusSetFormDraft',
        SETTINGS_STATUS_CLEAR_AFTER_FORM: 'settingsStatusClearAfterForm',
        SETTINGS_STATUS_CLEAR_AFTER_FORM_DRAFT: 'settingsStatusClearAfterFormDraft',
        SETTINGS_STATUS_SET_CLEAR_AFTER_FORM: 'settingsStatusSetClearAfterForm',
        SETTINGS_STATUS_SET_CLEAR_AFTER_FORM_DRAFT: 'settingsStatusSetClearAfterFormDraft',
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
    },
} as const;

type OnyxKeysMap = typeof ONYXKEYS;
type OnyxCollectionKey = ValueOf<OnyxKeysMap['COLLECTION']>;
type OnyxKey = DeepValueOf<Omit<OnyxKeysMap, 'COLLECTION'>>;
type OnyxFormKey = ValueOf<OnyxKeysMap['FORMS']> | OnyxKeysMap['REIMBURSEMENT_ACCOUNT'] | OnyxKeysMap['REIMBURSEMENT_ACCOUNT_DRAFT'];

type OnyxValues = {
    [ONYXKEYS.ACCOUNT]: OnyxTypes.Account;
    [ONYXKEYS.ACCOUNT_MANAGER_REPORT_ID]: string;
    [ONYXKEYS.NVP_IS_FIRST_TIME_NEW_EXPENSIFY_USER]: boolean;
    [ONYXKEYS.ACTIVE_CLIENTS]: string[];
    [ONYXKEYS.DEVICE_ID]: string;
    [ONYXKEYS.IS_SIDEBAR_LOADED]: boolean;
    [ONYXKEYS.PERSISTED_REQUESTS]: OnyxTypes.Request[];
    [ONYXKEYS.CURRENT_DATE]: string;
    [ONYXKEYS.CREDENTIALS]: OnyxTypes.Credentials;
    [ONYXKEYS.IOU]: OnyxTypes.IOU;
    [ONYXKEYS.MODAL]: OnyxTypes.Modal;
    [ONYXKEYS.NETWORK]: OnyxTypes.Network;
    [ONYXKEYS.CUSTOM_STATUS_DRAFT]: OnyxTypes.CustomStatusDraft;
    [ONYXKEYS.INPUT_FOCUSED]: boolean;
    [ONYXKEYS.PERSONAL_DETAILS_LIST]: Record<string, OnyxTypes.PersonalDetails>;
    [ONYXKEYS.PRIVATE_PERSONAL_DETAILS]: OnyxTypes.PrivatePersonalDetails;
    [ONYXKEYS.TASK]: OnyxTypes.Task;
    [ONYXKEYS.CURRENCY_LIST]: Record<string, OnyxTypes.Currency>;
    [ONYXKEYS.UPDATE_AVAILABLE]: boolean;
    [ONYXKEYS.SCREEN_SHARE_REQUEST]: OnyxTypes.ScreenShareRequest;
    [ONYXKEYS.COUNTRY_CODE]: number;
    [ONYXKEYS.COUNTRY]: string;
    [ONYXKEYS.USER]: OnyxTypes.User;
    [ONYXKEYS.LOGIN_LIST]: Record<string, OnyxTypes.Login>;
    [ONYXKEYS.SESSION]: OnyxTypes.Session;
    [ONYXKEYS.BETAS]: OnyxTypes.Beta[];
    [ONYXKEYS.NVP_PRIORITY_MODE]: ValueOf<typeof CONST.PRIORITY_MODE>;
    [ONYXKEYS.NVP_BLOCKED_FROM_CONCIERGE]: OnyxTypes.BlockedFromConcierge;
    [ONYXKEYS.NVP_PRIVATE_PUSH_NOTIFICATION_ID]: string;
    [ONYXKEYS.NVP_LAST_PAYMENT_METHOD]: Record<string, string>;
    [ONYXKEYS.NVP_RECENT_WAYPOINTS]: OnyxTypes.RecentWaypoint[];
    [ONYXKEYS.PUSH_NOTIFICATIONS_ENABLED]: boolean;
    [ONYXKEYS.PLAID_DATA]: OnyxTypes.PlaidData;
    [ONYXKEYS.IS_PLAID_DISABLED]: boolean;
    [ONYXKEYS.PLAID_LINK_TOKEN]: string;
    [ONYXKEYS.ONFIDO_TOKEN]: string;
    [ONYXKEYS.NVP_PREFERRED_LOCALE]: ValueOf<typeof CONST.LOCALES>;
    [ONYXKEYS.USER_WALLET]: OnyxTypes.UserWallet;
    [ONYXKEYS.WALLET_ONFIDO]: OnyxTypes.WalletOnfido;
    [ONYXKEYS.WALLET_ADDITIONAL_DETAILS]: OnyxTypes.WalletAdditionalDetails;
    [ONYXKEYS.WALLET_TERMS]: OnyxTypes.WalletTerms;
    [ONYXKEYS.BANK_ACCOUNT_LIST]: Record<string, OnyxTypes.BankAccount>;
    [ONYXKEYS.FUND_LIST]: Record<string, OnyxTypes.Fund>;
    [ONYXKEYS.CARD_LIST]: Record<string, OnyxTypes.Card>;
    [ONYXKEYS.WALLET_STATEMENT]: OnyxTypes.WalletStatement;
    [ONYXKEYS.PERSONAL_BANK_ACCOUNT]: OnyxTypes.PersonalBankAccount;
    [ONYXKEYS.REIMBURSEMENT_ACCOUNT]: OnyxTypes.ReimbursementAccount;
    [ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT]: OnyxTypes.ReimbursementAccountDraft;
    [ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE]: string | number;
    [ONYXKEYS.FREQUENTLY_USED_EMOJIS]: OnyxTypes.FrequentlyUsedEmoji[];
    [ONYXKEYS.REIMBURSEMENT_ACCOUNT_WORKSPACE_ID]: string;
    [ONYXKEYS.IS_LOADING_PAYMENT_METHODS]: boolean;
    [ONYXKEYS.IS_LOADING_REPORT_DATA]: boolean;
    [ONYXKEYS.IS_TEST_TOOLS_MODAL_OPEN]: boolean;
    [ONYXKEYS.WALLET_TRANSFER]: OnyxTypes.WalletTransfer;
    [ONYXKEYS.LAST_ACCESSED_WORKSPACE_POLICY_ID]: string;
    [ONYXKEYS.SHOULD_SHOW_COMPOSE_INPUT]: boolean;
    [ONYXKEYS.IS_BETA]: boolean;
    [ONYXKEYS.IS_CHECKING_PUBLIC_ROOM]: boolean;
    [ONYXKEYS.MY_DOMAIN_SECURITY_GROUPS]: Record<string, string>;
    [ONYXKEYS.LAST_OPENED_PUBLIC_ROOM_ID]: string;
    [ONYXKEYS.PREFERRED_THEME]: ValueOf<typeof CONST.THEME>;
    [ONYXKEYS.IS_USING_MEMORY_ONLY_KEYS]: boolean;
    [ONYXKEYS.MAPBOX_ACCESS_TOKEN]: OnyxTypes.MapboxAccessToken;
    [ONYXKEYS.ONYX_UPDATES_FROM_SERVER]: OnyxTypes.OnyxUpdatesFromServer;
    [ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT]: number;
    [ONYXKEYS.MAX_CANVAS_AREA]: number;
    [ONYXKEYS.MAX_CANVAS_HEIGHT]: number;
    [ONYXKEYS.MAX_CANVAS_WIDTH]: number;

    // Collections
    [ONYXKEYS.COLLECTION.DOWNLOAD]: OnyxTypes.Download;
    [ONYXKEYS.COLLECTION.POLICY]: OnyxTypes.Policy;
    [ONYXKEYS.COLLECTION.POLICY_DRAFTS]: OnyxTypes.Policy;
    [ONYXKEYS.COLLECTION.POLICY_CATEGORIES]: OnyxTypes.PolicyCategory;
    [ONYXKEYS.COLLECTION.POLICY_TAGS]: OnyxTypes.PolicyTags;
    [ONYXKEYS.COLLECTION.POLICY_MEMBERS]: OnyxTypes.PolicyMember;
    [ONYXKEYS.COLLECTION.POLICY_MEMBERS_DRAFTS]: OnyxTypes.PolicyMember;
    [ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES]: OnyxTypes.RecentlyUsedCategories;
    [ONYXKEYS.COLLECTION.DEPRECATED_POLICY_MEMBER_LIST]: OnyxTypes.PolicyMembers;
    [ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT]: Record<string, number>;
    [ONYXKEYS.COLLECTION.REPORT]: OnyxTypes.Report;
    [ONYXKEYS.COLLECTION.REPORT_METADATA]: OnyxTypes.ReportMetadata;
    [ONYXKEYS.COLLECTION.REPORT_ACTIONS]: OnyxTypes.ReportActions;
    [ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS]: OnyxTypes.ReportActionsDrafts;
    [ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS]: OnyxTypes.ReportActionReactions;
    [ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT]: string;
    [ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT_NUMBER_OF_LINES]: number;
    [ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE]: boolean;
    [ONYXKEYS.COLLECTION.REPORT_USER_IS_TYPING]: boolean;
    [ONYXKEYS.COLLECTION.REPORT_USER_IS_LEAVING_ROOM]: boolean;
    [ONYXKEYS.COLLECTION.SECURITY_GROUP]: OnyxTypes.SecurityGroup;
    [ONYXKEYS.COLLECTION.TRANSACTION]: OnyxTypes.Transaction;
    [ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS]: OnyxTypes.RecentlyUsedTags;
    [ONYXKEYS.COLLECTION.SELECTED_TAB]: string;

    // Forms
    [ONYXKEYS.FORMS.ADD_DEBIT_CARD_FORM]: OnyxTypes.AddDebitCardForm;
    [ONYXKEYS.FORMS.ADD_DEBIT_CARD_FORM_DRAFT]: OnyxTypes.AddDebitCardForm;
    [ONYXKEYS.FORMS.WORKSPACE_SETTINGS_FORM]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.WORKSPACE_SETTINGS_FORM_DRAFT]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.WORKSPACE_RATE_AND_UNIT_FORM]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.WORKSPACE_RATE_AND_UNIT_FORM_DRAFT]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.CLOSE_ACCOUNT_FORM]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.CLOSE_ACCOUNT_FORM_DRAFT]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.PROFILE_SETTINGS_FORM]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.PROFILE_SETTINGS_FORM_DRAFT]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.DISPLAY_NAME_FORM]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.DISPLAY_NAME_FORM_DRAFT]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.ROOM_NAME_FORM]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.ROOM_NAME_FORM_DRAFT]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.WELCOME_MESSAGE_FORM]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.WELCOME_MESSAGE_FORM_DRAFT]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.LEGAL_NAME_FORM]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.LEGAL_NAME_FORM_DRAFT]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.WORKSPACE_INVITE_MESSAGE_FORM]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.WORKSPACE_INVITE_MESSAGE_FORM_DRAFT]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.DATE_OF_BIRTH_FORM]: OnyxTypes.DateOfBirthForm;
    [ONYXKEYS.FORMS.DATE_OF_BIRTH_FORM_DRAFT]: OnyxTypes.DateOfBirthForm;
    [ONYXKEYS.FORMS.HOME_ADDRESS_FORM]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.HOME_ADDRESS_FORM_DRAFT]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.NEW_ROOM_FORM]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.NEW_ROOM_FORM_DRAFT]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.ROOM_SETTINGS_FORM]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.ROOM_SETTINGS_FORM_DRAFT]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.NEW_TASK_FORM]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.NEW_TASK_FORM_DRAFT]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.EDIT_TASK_FORM]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.EDIT_TASK_FORM_DRAFT]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.MONEY_REQUEST_DESCRIPTION_FORM]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.MONEY_REQUEST_DESCRIPTION_FORM_DRAFT]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.MONEY_REQUEST_MERCHANT_FORM]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.MONEY_REQUEST_MERCHANT_FORM_DRAFT]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.MONEY_REQUEST_AMOUNT_FORM]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.MONEY_REQUEST_AMOUNT_FORM_DRAFT]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.MONEY_REQUEST_DATE_FORM]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.MONEY_REQUEST_DATE_FORM_DRAFT]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.NEW_CONTACT_METHOD_FORM]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.NEW_CONTACT_METHOD_FORM_DRAFT]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.WAYPOINT_FORM]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.WAYPOINT_FORM_DRAFT]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.SETTINGS_STATUS_SET_FORM]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.SETTINGS_STATUS_SET_FORM_DRAFT]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.SETTINGS_STATUS_CLEAR_AFTER_FORM]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.SETTINGS_STATUS_CLEAR_AFTER_FORM_DRAFT]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.SETTINGS_STATUS_SET_CLEAR_AFTER_FORM]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.SETTINGS_STATUS_SET_CLEAR_AFTER_FORM_DRAFT]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.PRIVATE_NOTES_FORM]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.PRIVATE_NOTES_FORM_DRAFT]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.I_KNOW_A_TEACHER_FORM]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.I_KNOW_A_TEACHER_FORM_DRAFT]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.INTRO_SCHOOL_PRINCIPAL_FORM]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.INTRO_SCHOOL_PRINCIPAL_FORM_DRAFT]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.REPORT_VIRTUAL_CARD_FRAUD]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.REPORT_VIRTUAL_CARD_FRAUD_DRAFT]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.REPORT_PHYSICAL_CARD_FORM]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.REPORT_PHYSICAL_CARD_FORM_DRAFT]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.GET_PHYSICAL_CARD_FORM]: OnyxTypes.Form;
    [ONYXKEYS.FORMS.GET_PHYSICAL_CARD_FORM_DRAFT]: OnyxTypes.Form | undefined;
};

type OnyxKeyValue<TOnyxKey extends (OnyxKey | OnyxCollectionKey) & keyof OnyxValues> = OnyxEntry<OnyxValues[TOnyxKey]>;

export default ONYXKEYS;
export type {OnyxKey, OnyxCollectionKey, OnyxValues, OnyxKeyValue, OnyxFormKey, OnyxKeysMap};
