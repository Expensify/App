import {Str} from 'expensify-common';
import type {ValueOf} from 'type-fest';
import ONYXKEYS from '@src/ONYXKEYS';
import type OnyxState from '@src/types/onyx/OnyxState';
import type {MaskOnyxState} from './types';

const MASKING_PATTERN = '***';

type ExportRule = {
    /** Fields to keep as-is. */
    allowList: string[];
    /** Fields to length-mask (random string of same length). */
    maskList: string[];
};

// ============================================================
// 1. KEYS TO REMOVE — never leave the device
// ============================================================
const onyxKeysToRemove = new Set<ValueOf<typeof ONYXKEYS> | ValueOf<typeof ONYXKEYS.DERIVED>>([
    ONYXKEYS.NVP_PRIVATE_PUSH_NOTIFICATION_ID,
    ONYXKEYS.NVP_PRIVATE_STRIPE_CUSTOMER_ID,
    ONYXKEYS.NVP_PRIVATE_BILLING_DISPUTE_PENDING,
    ONYXKEYS.NVP_PRIVATE_BILLING_STATUS,
    ONYXKEYS.RAM_ONLY_PLAID_LINK_TOKEN,
    ONYXKEYS.RAM_ONLY_MERGE_HR_LINK_TOKEN,
    ONYXKEYS.ONFIDO_TOKEN,
    ONYXKEYS.ONFIDO_APPLICANT_ID,
    ONYXKEYS.PRESERVED_USER_SESSION,
    ONYXKEYS.PRESERVED_ACCOUNT,
    ONYXKEYS.MAPBOX_ACCESS_TOKEN,
    ONYXKEYS.RAM_ONLY_WALLET_ONFIDO,
    ONYXKEYS.ONYX_UPDATES_FROM_SERVER,
    ONYXKEYS.QUEUE_FLUSHED_DATA,
    ...Object.values(ONYXKEYS.DERIVED),
]);

// ============================================================
// 2. KEYS WITH SPECIFIC EXPORT RULES — allow/mask per field
// ============================================================
const ONYX_KEY_EXPORT_RULES: Record<string, ExportRule> = {
    // --- Authentication & credentials ---
    [ONYXKEYS.SESSION]: {
        allowList: ['email', 'accountID', 'loading', 'creationDate', 'errors'],
        maskList: [],
    },
    [ONYXKEYS.STASHED_SESSION]: {
        allowList: ['email', 'accountID', 'loading', 'creationDate', 'errors'],
        maskList: [],
    },
    [ONYXKEYS.CREDENTIALS]: {
        allowList: ['login', 'accountID'],
        maskList: [],
    },
    [ONYXKEYS.STASHED_CREDENTIALS]: {
        allowList: ['login', 'accountID'],
        maskList: [],
    },

    // --- User data ---
    [ONYXKEYS.ACCOUNT]: {
        allowList: ['validated', 'isFromPublicDomain', 'isUsingExpensifyCard'],
        maskList: ['primaryLogin'],
    },
    [ONYXKEYS.PERSONAL_DETAILS_LIST]: {
        allowList: ['accountID', 'timezone', 'status', 'pronouns'],
        maskList: ['firstName', 'lastName', 'displayName', 'avatar', 'login'],
    },
    [ONYXKEYS.PRIVATE_PERSONAL_DETAILS]: {
        allowList: ['timezone'],
        maskList: ['legalFirstName', 'legalLastName', 'phoneNumber', 'address', 'dob'],
    },
    [ONYXKEYS.LOGIN_LIST]: {
        allowList: ['partnerName', 'partnerUserID', 'validatedDate', 'errorFields', 'pendingFields'],
        maskList: ['login'],
    },
    [ONYXKEYS.LOGINS]: {
        allowList: ['partnerName', 'partnerUserID', 'validatedDate', 'errorFields', 'pendingFields'],
        maskList: ['login'],
    },
    [ONYXKEYS.USER_METADATA]: {
        allowList: ['accountID', 'isSubscriber', 'policyIDLastUsed'],
        maskList: [],
    },
    [ONYXKEYS.NVP_RECENT_ATTENDEES]: {
        allowList: ['accountID'],
        maskList: ['login', 'displayName', 'avatar'],
    },
    [ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE]: {
        allowList: ['delegateEmail'],
        maskList: ['delegateEmail'],
    },

    // --- Reports ---
    [ONYXKEYS.COLLECTION.REPORT]: {
        allowList: [
            'reportID',
            'type',
            'chatType',
            'lastActorAccountID',
            'participants',
            'pendingFields',
            'ownerAccountID',
            'stateNum',
            'statusNum',
            'isOwnPolicyExpenseChat',
            'participantAccountIDs',
            'created',
            'lastReadTime',
            'lastVisibleActionCreated',
            'lastMentionedTime',
            'isPinned',
            'hasOutstandingChildRequest',
            'hasOutstandingChildTask',
            'parentReportID',
            'parentReportActionID',
            'lastReadSequenceNumber',
            'lastVisibleActionLastModified',
            'chatReportID',
            'iouReportID',
            'currency',
            'managerID',
            'policyID',
            'visibility',
            'writeCapability',
            'invoiceReceiver',
        ],
        maskList: ['reportName', 'description', 'ownerAccountID', 'managerID', 'lastMessageText', 'lastMessageHtml'],
    },
    [ONYXKEYS.COLLECTION.REPORT_DRAFT]: {
        allowList: ['reportID', 'type', 'chatType', 'stateNum', 'statusNum', 'policyID', 'parentReportID', 'parentReportActionID'],
        maskList: ['reportName', 'description', 'lastMessageText', 'lastMessageHtml'],
    },
    [ONYXKEYS.COLLECTION.REPORT_ACTIONS]: {
        allowList: [
            'reportActionID',
            'actionName',
            'created',
            'actorAccountID',
            'accountID',
            'pendingAction',
            'errors',
            'error',
            'isLoading',
            'isOptimisticAction',
            'lastModified',
            'delegateAccountID',
            'reportID',
            'whisperedToAccountIDs',
            'childReportID',
            'childType',
            'childVisibleActionCount',
            'childCommenterCount',
            'childLastVisibleActionCreated',
            'childOldestFourAccountIDs',
            'childReportNotificationPreference',
        ],
        maskList: ['message', 'previousMessage', 'originalMessage', 'avatar', 'person', 'receipt', 'linkMetadata'],
    },
    [ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS]: {
        allowList: ['private_isArchived', 'origin', 'originalID', 'exportFailedTime', 'agentZeroProcessingRequestIndicator', 'parentReportID'],
        maskList: ['calendlyCalls', 'calendlySchedule', 'expensify_text_title'],
    },
    [ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS]: {
        allowList: [],
        maskList: ['message', 'text', 'html'],
    },
    [ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT]: {
        allowList: [],
        maskList: [],
    },
    [ONYXKEYS.COLLECTION.PRIVATE_NOTES_DRAFT]: {
        allowList: [],
        maskList: [],
    },

    // --- Transactions ---
    [ONYXKEYS.COLLECTION.TRANSACTION]: {
        allowList: ['transactionID', 'reportID', 'created', 'category', 'tag', 'billable'],
        maskList: ['merchant', 'description', 'comment'],
    },
    [ONYXKEYS.COLLECTION.TRANSACTION_DRAFT]: {
        allowList: ['transactionID', 'reportID', 'created', 'category', 'tag', 'billable'],
        maskList: ['merchant', 'description', 'comment'],
    },
    [ONYXKEYS.COLLECTION.TRANSACTION_BACKUP]: {
        allowList: ['transactionID', 'reportID', 'created', 'category', 'tag', 'billable'],
        maskList: ['merchant', 'description', 'comment'],
    },
    [ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT]: {
        allowList: ['transactionID', 'reportID', 'created', 'category', 'tag', 'billable'],
        maskList: ['merchant', 'description', 'comment'],
    },
    [ONYXKEYS.COLLECTION.MERGE_TRANSACTION]: {
        allowList: ['transactionID', 'reportID', 'created', 'category', 'tag', 'billable'],
        maskList: ['merchant', 'description', 'comment'],
    },
    [ONYXKEYS.COLLECTION.CODING_RULE_MATCHING_TRANSACTION]: {
        allowList: ['transactionID', 'reportID', 'created', 'category', 'tag', 'billable'],
        maskList: ['merchant', 'description', 'comment'],
    },

    // --- Workspace / Policy ---
    [ONYXKEYS.COLLECTION.POLICY]: {
        allowList: ['id', 'type', 'role', 'outputCurrency', 'isPolicyExpenseChatEnabled', 'areCategoriesEnabled', 'areTagsEnabled'],
        maskList: ['name', 'avatar'],
    },
    [ONYXKEYS.COLLECTION.POLICY_DRAFTS]: {
        allowList: ['id', 'type', 'role', 'outputCurrency', 'isPolicyExpenseChatEnabled', 'areCategoriesEnabled', 'areTagsEnabled'],
        maskList: ['name', 'avatar'],
    },
    [ONYXKEYS.COLLECTION.DEPRECATED_POLICY_MEMBER_LIST]: {
        allowList: ['role', 'errors', 'pendingAction'],
        maskList: ['email'],
    },

    // --- Financial ---
    [ONYXKEYS.USER_WALLET]: {
        allowList: ['currentBalance', 'availableBalance', 'tierName'],
        maskList: [],
    },
    [ONYXKEYS.BANK_ACCOUNT_LIST]: {
        allowList: ['accountType', 'currency'],
        maskList: ['accountNumber', 'routingNumber', 'addressName'],
    },
    [ONYXKEYS.CARD_LIST]: {
        allowList: ['accountID', 'bank', 'isVirtual', 'cardID'],
        maskList: ['lastFourPAN', 'nameOnCard'],
    },
    [ONYXKEYS.FUND_LIST]: {
        allowList: ['fundID', 'accountType', 'isDefault'],
        maskList: ['accountData', 'description', 'key'],
    },
    [ONYXKEYS.PERSONAL_BANK_ACCOUNT]: {
        allowList: ['isLoading', 'errors', 'plaidAccountID'],
        maskList: [],
    },
    [ONYXKEYS.REIMBURSEMENT_ACCOUNT]: {
        allowList: ['isLoading', 'errors', 'achData.state', 'achData.bankAccountID'],
        maskList: [],
    },
    [ONYXKEYS.SHARE_BANK_ACCOUNT]: {
        allowList: ['isLoading', 'errors'],
        maskList: [],
    },
    [ONYXKEYS.PLAID_DATA]: {
        allowList: ['isLoading', 'errors'],
        maskList: ['bankAccounts', 'accessToken'],
    },
    [ONYXKEYS.WALLET_ADDITIONAL_DETAILS]: {
        allowList: ['isLoading', 'errors', 'errorFields'],
        maskList: [],
    },
    [ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST]: {
        allowList: ['cardID', 'state', 'bank', 'fundID', 'isVirtual', 'lastUpdated'],
        maskList: ['lastFourPAN', 'nameOnCard', 'cardName'],
    },
    [ONYXKEYS.COLLECTION.BANK_ACCOUNT_SHARE_DETAILS]: {
        allowList: ['isLoading', 'errors'],
        maskList: ['login', 'email'],
    },

    // --- Domain & SAML ---
    [ONYXKEYS.COLLECTION.DOMAIN]: {
        allowList: ['domainName', 'expiration'],
        maskList: [],
    },
    [ONYXKEYS.COLLECTION.SAML_METADATA]: {
        allowList: ['isRequired', 'isConfigured'],
        maskList: [],
    },
    [ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER]: {
        allowList: ['settings', 'lastSelectedFeed', 'companyCardNicknames'],
        maskList: [],
    },

    // --- Workspace invites ---
    [ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT]: {
        allowList: [],
        maskList: [],
    },
    [ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MESSAGE_DRAFT]: {
        allowList: [],
        maskList: [],
    },

    // --- User-entered text / PII ---
    [ONYXKEYS.CUSTOM_STATUS_DRAFT]: {
        allowList: ['clearAfter'],
        maskList: ['text', 'emojiCode'],
    },
    [ONYXKEYS.NEW_GROUP_CHAT_DRAFT]: {
        allowList: ['reportID'],
        maskList: ['reportName', 'participants'],
    },
    [ONYXKEYS.SHARE_UNKNOWN_USER_DETAILS]: {
        allowList: [],
        maskList: ['email', 'displayName'],
    },
    [ONYXKEYS.NVP_RECENT_WAYPOINTS]: {
        allowList: [],
        maskList: ['address', 'name', 'lat', 'lng'],
    },
    [ONYXKEYS.GPS_DRAFT_DETAILS]: {
        allowList: [],
        maskList: ['lat', 'lng'],
    },
    [ONYXKEYS.USER_LOCATION]: {
        allowList: [],
        maskList: ['latitude', 'longitude'],
    },
    [ONYXKEYS.SCHEDULE_CALL_DRAFT]: {
        allowList: ['reportID'],
        maskList: [],
    },
    [ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT]: {
        allowList: ['accountID'],
        maskList: ['prompt', 'name'],
    },

    // --- Persisted requests (may contain any API payload) ---
    [ONYXKEYS.PERSISTED_REQUESTS]: {
        allowList: ['command', 'created'],
        maskList: ['data'],
    },
    [ONYXKEYS.PERSISTED_ONGOING_REQUESTS]: {
        allowList: ['command', 'created'],
        maskList: ['data'],
    },

    // --- Corpay / Banking ---
    [ONYXKEYS.CORPAY_FIELDS]: {
        allowList: ['isLoading', 'errors'],
        maskList: [],
    },
    [ONYXKEYS.CORPAY_ONBOARDING_FIELDS]: {
        allowList: ['isLoading', 'errors'],
        maskList: [],
    },

    // --- Imported spreadsheet ---
    [ONYXKEYS.IMPORTED_SPREADSHEET]: {
        allowList: ['isLoading', 'errors', 'containsHeader'],
        maskList: ['fileName'],
    },
    [ONYXKEYS.IMPORTED_SPREADSHEET_MEMBER_DATA]: {
        allowList: ['role'],
        maskList: ['email', 'login'],
    },
};

// ============================================================
// 3. SAFE ONYX KEYS — export as-is, no masking needed
//    These are booleans, loading states, IDs, config, timestamps.
// ============================================================
const safeOnyxKeys = new Set<string>([
    // Simple IDs
    ONYXKEYS.ACCOUNT_MANAGER_REPORT_ID,
    ONYXKEYS.DEVICE_ID,
    ONYXKEYS.PERSONAL_POLICY_ID,
    ONYXKEYS.CONCIERGE_REPORT_ID,
    ONYXKEYS.SELF_DM_REPORT_ID,
    ONYXKEYS.LAST_ACCESSED_WORKSPACE_POLICY_ID,
    ONYXKEYS.REIMBURSEMENT_ACCOUNT_WORKSPACE_ID,
    ONYXKEYS.ONBOARDING_POLICY_ID,
    ONYXKEYS.ONBOARDING_ADMINS_CHAT_REPORT_ID,
    ONYXKEYS.DOMAIN_GROUP_CREATE_PREFERRED_POLICY_ID,
    ONYXKEYS.NVP_ACTIVE_POLICY_ID,
    ONYXKEYS.NVP_BILLING_FUND_ID,
    ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY,
    ONYXKEYS.VIEWING_PUBLIC_ROOM_REPORT_ID,
    ONYXKEYS.ROOM_ID_HIGHLIGHT_ON_ROOMS_PAGE,

    // Boolean flags
    ONYXKEYS.RAM_ONLY_IS_SIDEBAR_LOADED,
    ONYXKEYS.RAM_ONLY_IS_SEARCHING_FOR_REPORTS,
    ONYXKEYS.IS_OPEN_APP_FAILURE_MODAL_OPEN,
    ONYXKEYS.IS_GPS_IN_PROGRESS_MODAL_OPEN,
    ONYXKEYS.FULLSCREEN_VISIBILITY,
    ONYXKEYS.INPUT_FOCUSED,
    ONYXKEYS.IS_PLAID_DISABLED,
    ONYXKEYS.IS_LOADING_PAYMENT_METHODS,
    ONYXKEYS.IS_LOADING_REPORT_DATA,
    ONYXKEYS.IS_LOADING_SHARE_BANK_ACCOUNTS,
    ONYXKEYS.IS_LOADING_BULK_CHANGE_APPROVER_PAGE,
    ONYXKEYS.IS_LOADING_APP,
    ONYXKEYS.IS_LOADING_POLICY_CODING_RULES_PREVIEW,
    ONYXKEYS.IS_LOADING_SUBSCRIPTION_DATA,
    ONYXKEYS.IS_PENDING_UPDATE_PERSONAL_KARMA,
    ONYXKEYS.IS_SEARCH_FILTERS_CARD_DATA_LOADED,
    ONYXKEYS.IS_SEARCH_PAGE_DATA_LOADED,
    ONYXKEYS.HAS_LOADED_APP,
    ONYXKEYS.IS_TEST_TOOLS_MODAL_OPEN,
    ONYXKEYS.IS_BETA,
    ONYXKEYS.RAM_ONLY_IS_CHECKING_PUBLIC_ROOM,
    ONYXKEYS.RAM_ONLY_UPDATE_AVAILABLE,
    ONYXKEYS.RAM_ONLY_UPDATE_REQUIRED,
    ONYXKEYS.RAM_ONLY_ARE_TRANSLATIONS_LOADING,
    ONYXKEYS.RESET_REQUIRED,
    ONYXKEYS.SHOULD_MASK_ONYX_STATE,
    ONYXKEYS.SHOULD_USE_STAGING_SERVER,
    ONYXKEYS.IS_DEBUG_MODE_ENABLED,
    ONYXKEYS.SHOULD_SHOW_BRANCH_NAME_IN_TITLE,
    ONYXKEYS.IS_SENTRY_DEBUG_ENABLED,
    ONYXKEYS.IS_SENTRY_SEND_ENABLED,
    ONYXKEYS.IS_USING_IMPORTED_STATE,
    ONYXKEYS.IS_LOADING_BILL_WHEN_DOWNGRADE,
    ONYXKEYS.SHOULD_BILL_WHEN_DOWNGRADING,
    ONYXKEYS.IS_COMING_FROM_GLOBAL_REIMBURSEMENTS_FLOW,
    ONYXKEYS.HAS_MORE_UNREPORTED_TRANSACTIONS_RESULTS,
    ONYXKEYS.IS_LOADING_UNREPORTED_TRANSACTIONS,
    ONYXKEYS.HAS_DENIED_CONTACT_IMPORT_PROMPT,
    ONYXKEYS.HAS_NON_PERSONAL_POLICY,
    ONYXKEYS.CONCIERGE_THINKING_KICKOFF,
    ONYXKEYS.RAM_ONLY_MOBILE_SELECTION_MODE,
    ONYXKEYS.RAM_ONLY_IS_AUTHENTICATING_WITH_SHORT_LIVED_TOKEN,
    ONYXKEYS.SIGN_IN_HIGH_CONTRAST_INTENT,

    // Config / preferences / enums
    ONYXKEYS.NETWORK,
    ONYXKEYS.MODAL,
    ONYXKEYS.CURRENT_DATE,
    ONYXKEYS.COUNTRY_CODE,
    ONYXKEYS.COUNTRY,
    ONYXKEYS.CURRENCY_LIST,
    ONYXKEYS.PREFERRED_THEME,
    ONYXKEYS.NVP_PREFERRED_LOCALE,
    ONYXKEYS.NVP_PRIORITY_MODE,
    ONYXKEYS.NVP_MUTED_PLATFORMS,
    ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE,
    ONYXKEYS.FREQUENTLY_USED_EMOJIS,
    ONYXKEYS.NVP_INTRO_SELECTED,
    ONYXKEYS.NVP_TRY_FOCUS_MODE,
    ONYXKEYS.NVP_LAST_SELECTED_DISTANCE_RATES,
    ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE,
    ONYXKEYS.NVP_LAST_PAYMENT_METHOD,
    ONYXKEYS.NVP_LAST_DISTANCE_EXPENSE_TYPE,
    ONYXKEYS.NVP_REPORT_LAYOUT_GROUP_BY,
    ONYXKEYS.NVP_REPORT_DETAILS_COLUMNS,
    ONYXKEYS.NVP_SIDE_PANEL,
    ONYXKEYS.NVP_APP_REVIEW,
    ONYXKEYS.NVP_ONBOARDING_RHP_VARIANT,
    ONYXKEYS.SENTRY_DEBUG_HIGHLIGHTED_SPAN_OPS,

    // Dismissed / seen flags (boolean or simple objects)
    ONYXKEYS.NVP_DISMISSED_REFERRAL_BANNERS,
    ONYXKEYS.NVP_DISMISSED_ASAP_SUBMIT_EXPLANATION,
    ONYXKEYS.NVP_EMPTY_REPORTS_CONFIRMATION_DISMISSED,
    ONYXKEYS.NVP_HAS_SEEN_TRACK_TRAINING,
    ONYXKEYS.NVP_DISMISSED_HOLD_USE_EXPLANATION,
    ONYXKEYS.NVP_SEEN_NEW_USER_MODAL,
    ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING,
    ONYXKEYS.NVP_DISMISSED_REJECT_USE_EXPLANATION,

    // Billing / subscription (non-PII numbers and dates)
    ONYXKEYS.NVP_PRIVATE_TAX_EXEMPT,
    ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION,
    ONYXKEYS.NVP_PERSONAL_OFFSETS,
    ONYXKEYS.NVP_PRIVATE_PROMO_CODE,
    ONYXKEYS.NVP_PRIVATE_PROMO_DISCOUNT,
    ONYXKEYS.NVP_PRIVATE_PROMO_CODE_VALID_BILLING_CYCLES,
    ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL,
    ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL,
    ONYXKEYS.NVP_PRIVATE_FREEBIE_CREDITS,
    ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED,
    ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END,
    ONYXKEYS.NVP_PRIVATE_FIRST_POLICY_CREATED_DATE,
    ONYXKEYS.NVP_PRIVATE_MANUAL_TEAM_2025_PRICING,
    ONYXKEYS.NVP_PRIVATE_GRANDFATHERED_FREE,
    ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_FAILED,
    ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_SUCCESSFUL,
    ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_PENDING,
    ONYXKEYS.BILLING_RECEIPT_DETAILS,

    // Timestamps / dates
    ONYXKEYS.LAST_FULL_RECONNECT_TIME,
    ONYXKEYS.NVP_LAST_LOCATION_PERMISSION_PROMPT,
    ONYXKEYS.NVP_RECONNECT_APP_IF_FULL_RECONNECT_BEFORE,
    ONYXKEYS.NVP_LAST_ECASH_IOS_LOGIN,
    ONYXKEYS.NVP_LAST_IPHONE_LOGIN,
    ONYXKEYS.NVP_LAST_ECASH_ANDROID_LOGIN,
    ONYXKEYS.NVP_LAST_ANDROID_LOGIN,
    ONYXKEYS.STATUS_DRAFT_CUSTOM_CLEAR_AFTER_DATE,

    // Onboarding
    ONYXKEYS.NVP_ONBOARDING,
    ONYXKEYS.NVP_TRY_NEW_DOT,
    ONYXKEYS.ONBOARDING_PURPOSE_SELECTED,
    ONYXKEYS.ONBOARDING_CUSTOM_CHOICES,
    ONYXKEYS.ONBOARDING_ERROR_MESSAGE_TRANSLATION_KEY,
    ONYXKEYS.ONBOARDING_COMPANY_SIZE,
    ONYXKEYS.ONBOARDING_USER_REPORTED_INTEGRATION,
    ONYXKEYS.ONBOARDING_LAST_VISITED_PATH,

    // Client / UI state
    ONYXKEYS.ACTIVE_CLIENTS,
    ONYXKEYS.PERSONAL_DETAILS_METADATA,
    ONYXKEYS.BETAS,
    ONYXKEYS.BETA_CONFIGURATION,
    ONYXKEYS.SCREEN_SHARE_REQUEST,
    ONYXKEYS.PLAID_CURRENT_EVENT,
    ONYXKEYS.WALLET_TERMS,
    ONYXKEYS.WALLET_STATEMENT,
    ONYXKEYS.TRAVEL_INVOICE_STATEMENT,
    ONYXKEYS.PURCHASE_LIST,
    ONYXKEYS.WALLET_TRANSFER,
    ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT,
    ONYXKEYS.MAX_CANVAS_AREA,
    ONYXKEYS.MAX_CANVAS_HEIGHT,
    ONYXKEYS.MAX_CANVAS_WIDTH,
    ONYXKEYS.LAST_VISITED_PATH,
    ONYXKEYS.REPORT_LAST_VISIT_TIMES,
    ONYXKEYS.RECENTLY_USED_REPORT_FIELDS,
    ONYXKEYS.CACHED_PDF_PATHS,
    ONYXKEYS.LAST_ROUTE,
    ONYXKEYS.RECENTLY_USED_CURRENCIES,
    ONYXKEYS.SEARCH_CONTEXT,
    ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS,
    ONYXKEYS.TRANSACTION_IDS_HIGHLIGHT_ON_SEARCH_ROUTE,
    ONYXKEYS.HYBRID_APP,
    ONYXKEYS.SUPPORTAL_PERMISSION_DENIED,
    ONYXKEYS.REVIEW_DUPLICATES,
    ONYXKEYS.LAST_EXPORT_METHOD,
    ONYXKEYS.ROOM_MEMBERS_USER_SEARCH_PHRASE,
    ONYXKEYS.POLICY_OWNERSHIP_CHANGE_CHECKS,
    ONYXKEYS.NVP_SEARCH_SIDEBAR,

    // Tasks / NVPs
    ONYXKEYS.TASK,
    ONYXKEYS.NVP_BLOCKED_FROM_CONCIERGE,
    ONYXKEYS.NVP_BLOCKED_FROM_CHAT,
    ONYXKEYS.NVP_TRAVEL_SETTINGS,
    ONYXKEYS.NVP_DELETE_TRANSACTION_NAVIGATE_BACK_URL,
    ONYXKEYS.NVP_PRIVATE_LOCK_ACCOUNT_DETAILS,
    ONYXKEYS.NVP_INTEGRATION_SERVER_EXPORT_TEMPLATES,
    ONYXKEYS.NVP_CSV_EXPORT_LAYOUTS,
    ONYXKEYS.NVP_EXPENSE_RULES,
    ONYXKEYS.NVP_SAVED_CSV_COLUMN_LAYOUT_LIST,
    ONYXKEYS.NVP_PRIVATE_CANCELLATION_DETAILS,
    ONYXKEYS.NVP_EXPENSIFY_COMPANY_CARDS_CUSTOM_NAMES,
    ONYXKEYS.SAVED_SEARCHES,
    ONYXKEYS.RECENT_SEARCHES,
    ONYXKEYS.ODOMETER_DRAFT,
    ONYXKEYS.APPROVAL_WORKFLOW,
    ONYXKEYS.DEFERRED_AGENT_WORKFLOW_SAVES,
    ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING,
    ONYXKEYS.COPY_POLICY_SETTINGS,
    ONYXKEYS.NVP_BULK_POLICY_COPY_SETTINGS,
    ONYXKEYS.DUPLICATE_WORKSPACE,
    ONYXKEYS.ADD_NEW_COMPANY_CARD,
    ONYXKEYS.ADD_NEW_PERSONAL_CARD,
    ONYXKEYS.ASSIGN_CARD,
    ONYXKEYS.TRAVEL_PROVISIONING,

    // Contact / validation
    ONYXKEYS.PENDING_CONTACT_ACTION,
    ONYXKEYS.VALIDATE_ACTION_CODE,
    ONYXKEYS.VALIDATE_DOMAIN_TWO_FACTOR_CODE,
    ONYXKEYS.JOINABLE_POLICIES,
    ONYXKEYS.VALIDATE_USER_AND_GET_ACCESSIBLE_POLICIES,
    ONYXKEYS.UNSHARE_BANK_ACCOUNT,
    ONYXKEYS.REIMBURSEMENT_ACCOUNT_OPTION_PRESSED,
    ONYXKEYS.MY_DOMAIN_SECURITY_GROUPS,
    ONYXKEYS.RAM_ONLY_DOMAIN_MEMBERS_SELECTED_FOR_MOVE,

    // 3DS
    ONYXKEYS.VERIFY_3DS_SUBSCRIPTION,
    ONYXKEYS.TRANSACTIONS_PENDING_3DS_REVIEW,
    ONYXKEYS.LOCALLY_PROCESSED_3DS_TRANSACTION_REVIEWS,
    ONYXKEYS.INITIATING_BANK_ACCOUNT_UNLOCK,

    // Sharing
    ONYXKEYS.SHARE_TEMP_FILE,
    ONYXKEYS.VALIDATED_FILE_OBJECT,
    ONYXKEYS.IMPORTED_SPREADSHEET_MEMBER_ROLE,

    // Collection keys — safe structural/config data
    ONYXKEYS.COLLECTION.ATTACHMENT,
    ONYXKEYS.COLLECTION.DOWNLOAD,
    ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD,
    ONYXKEYS.COLLECTION.POLICY_HAS_CONNECTIONS_DATA_BEEN_FETCHED,
    ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS,
    ONYXKEYS.COLLECTION.POLICY_JOIN_MEMBER,
    ONYXKEYS.COLLECTION.POLICY_MERGE_HR_INITIAL_SYNC_MODAL_SHOWN,
    ONYXKEYS.COLLECTION.WORKSPACE_INVITE_ROLE_DRAFT,
    ONYXKEYS.COLLECTION.WORKSPACE_INVITE_APPROVER_DRAFT,
    ONYXKEYS.COLLECTION.REPORT_METADATA,
    ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE,
    ONYXKEYS.COLLECTION.REPORT_PAGINATION_STATE,
    ONYXKEYS.COLLECTION.REPORT_ACTIONS_PAGES,
    ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS,
    ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE,
    ONYXKEYS.COLLECTION.REPORT_USER_IS_TYPING,
    ONYXKEYS.COLLECTION.PENDING_CONCIERGE_RESPONSE,
    ONYXKEYS.COLLECTION.CONCIERGE_PENDING_FOLLOWUP_LIST,
    ONYXKEYS.COLLECTION.REPORT_USER_IS_LEAVING_ROOM,
    ONYXKEYS.COLLECTION.SECURITY_GROUP,
    ONYXKEYS.COLLECTION.SKIP_CONFIRMATION,
    ONYXKEYS.COLLECTION.NEXT_STEP,
    ONYXKEYS.COLLECTION.SELECTED_TAB,
    ONYXKEYS.COLLECTION.SELECTED_DISTANCE_REQUEST_TAB,
    ONYXKEYS.COLLECTION.SNAPSHOT,
    ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END,
    ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS,
    ONYXKEYS.COLLECTION.EXPENSIFY_CARD_BANK_ACCOUNT_METADATA,
    ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_MANUAL_BILLING,
    ONYXKEYS.COLLECTION.EXPENSIFY_CARD_CONTINUOUS_RECONCILIATION_CONNECTION,
    ONYXKEYS.COLLECTION.EXPENSIFY_CARD_USE_CONTINUOUS_RECONCILIATION,
    ONYXKEYS.COLLECTION.EXPENSIFY_CARD_USE_CONTINUOUS_RECONCILIATION_PENDING_ACTION,
    ONYXKEYS.COLLECTION.EXPENSIFY_CARD_RECONCILIATION_BANK_ACCOUNT_ID,
    ONYXKEYS.COLLECTION.TRAVEL_INVOICING_CONTINUOUS_RECONCILIATION_CONNECTION,
    ONYXKEYS.COLLECTION.TRAVEL_INVOICING_USE_CONTINUOUS_RECONCILIATION,
    ONYXKEYS.COLLECTION.TRAVEL_INVOICING_USE_CONTINUOUS_RECONCILIATION_PENDING_ACTION,
    ONYXKEYS.COLLECTION.TRAVEL_INVOICING_RECONCILIATION_BANK_ACCOUNT_ID,
    ONYXKEYS.COLLECTION.LAST_SELECTED_FEED,
    ONYXKEYS.COLLECTION.LAST_SELECTED_EXPENSIFY_CARD_FEED,
    ONYXKEYS.COLLECTION.NVP_EXPENSIFY_ON_CARD_WAITLIST,
    ONYXKEYS.COLLECTION.NVP_EXPENSIFY_REPORT_PDF_FILENAME,
    ONYXKEYS.COLLECTION.RAM_ONLY_ISSUE_NEW_EXPENSIFY_CARD,
    ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS,
    ONYXKEYS.COLLECTION.DOMAIN_ERRORS,
    ONYXKEYS.COLLECTION.PASSKEY_CREDENTIALS,
    ONYXKEYS.COLLECTION.DEVICE_BIOMETRICS,

    // Policy config collections — full pass-through, no PII
    ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS,
    ONYXKEYS.COLLECTION.POLICY_CATEGORIES,
    ONYXKEYS.COLLECTION.POLICY_CATEGORIES_DRAFT,
    ONYXKEYS.COLLECTION.POLICY_TAGS,
    ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES,
    ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS,
    ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_DESTINATIONS,
]);

// ============================================================
// Masking helpers
// ============================================================
const keysToMask = new Set([
    'addressCity',
    'addressName',
    'addressStreet',
    'addressZipCode',
    'avatar',
    'avatarURL',
    'bank',
    'cardName',
    'cardNumber',
    'childReportName',
    'city',
    'comment',
    'description',
    'displayName',
    'edits',
    'firstName',
    'lastMessageHtml',
    'lastMessageText',
    'lastName',
    'legalFirstName',
    'legalLastName',
    'merchant',
    'modifiedMerchant',
    'name',
    'oldPolicyName',
    'owner',
    'phoneNumber',
    'plaidAccessToken',
    'plaidAccountID',
    'plaidLinkToken',
    'policyAvatar',
    'policyName',
    'primaryLogin',
    'reportName',
    'routingNumber',
    'source',
    'state',
    'street',
    'title',
    'validateCode',
    'zip',
    'zipCode',
]);

const amountKeysToRandomize = new Set(['amount', 'modifiedAmount', 'originalAmount', 'total', 'unheldTotal', 'unheldNonReimbursableTotal', 'nonReimbursableTotal']);

const nodesToFullyMask = new Set(['reservationList']);

const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

const getRandomLetter = () => String.fromCharCode(97 + Math.floor(Math.random() * 26));

function getRandomString(length: number): string {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += getRandomLetter();
    }
    return result;
}

function maskValuePreservingLength(value: unknown) {
    if (typeof value !== 'string') {
        return MASKING_PATTERN;
    }

    return getRandomString(value.length);
}

function randomizeAmount(amount: number): number {
    if (!Number.isFinite(amount)) {
        return 0;
    }
    const randomizedValue = Math.floor(Math.random() * 999999) + 1;
    return amount < 0 ? -randomizedValue : randomizedValue;
}

function stringContainsEmail(text: string) {
    return emailRegex.test(text);
}

function extractEmail(text: string) {
    const match = text.match(emailRegex);
    return match ? match[0] : null; // Return the email if found, otherwise null
}

const randomizeEmail = (email: string): string => {
    const [localPart, domain] = email.split('@');
    const [domainName, tld] = domain.split('.');

    const randomizePart = (part: string) => [...part].map((c) => (/[a-zA-Z0-9]/.test(c) ? getRandomLetter() : c)).join('');
    const randomLocal = randomizePart(localPart);
    const randomDomain = randomizePart(domainName);

    return `${randomLocal}@${randomDomain}.${tld}`;
};

function replaceEmailInString(text: string, emailReplacement: string) {
    return text.replace(emailRegex, emailReplacement);
}

const isDateValue = (value: unknown): boolean => {
    if (typeof value !== 'string') {
        return false;
    }

    const datePatterns = [
        /^\d{4}-\d{2}-\d{2}/, // ISO date
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, // ISO datetime
    ];
    return datePatterns.some((pattern) => pattern.test(value));
};

const getCurrentDate = (): string => {
    return new Date().toISOString();
};

const processOnyxKeyWithRule = (key: string, data: unknown, rule: ExportRule): unknown => {
    if (data === null || data === undefined) {
        return data;
    }

    if (Array.isArray(data)) {
        return data.map((item: unknown) => (typeof item === 'object' ? processOnyxKeyWithRule(key, item, rule) : item));
    }

    if (typeof data === 'object') {
        const processedData: Record<string, unknown> = {};

        for (const fieldKey of Object.keys(data as Record<string, unknown>)) {
            const fieldValue = (data as Record<string, unknown>)[fieldKey];

            if (rule.maskList.includes(fieldKey)) {
                processedData[fieldKey] = maskValuePreservingLength(fieldValue);
            } else if (rule.allowList.includes(fieldKey)) {
                processedData[fieldKey] = fieldValue;
            } else if (typeof fieldValue === 'object' && fieldValue !== null) {
                // If it's an object and not in allowList/maskList, recursively process it
                processedData[fieldKey] = processOnyxKeyWithRule(key, fieldValue, rule);
            } else if (typeof fieldValue === 'number') {
                processedData[fieldKey] = randomizeAmount(fieldValue);
            } else if (typeof fieldValue === 'string' && isDateValue(fieldValue)) {
                processedData[fieldKey] = getCurrentDate();
            } else if (typeof fieldValue === 'string') {
                processedData[fieldKey] = maskValuePreservingLength(fieldValue);
            } else {
                // Default: redact to '***' for anything else
                processedData[fieldKey] = MASKING_PATTERN;
            }
        }

        return processedData;
    }

    return data;
};

const maskEmail = (email: string, emailMap: Map<string, string>) => {
    let maskedEmail = '';
    if (!emailMap.has(email)) {
        maskedEmail = randomizeEmail(email);
        emailMap.set(email, maskedEmail);
    } else {
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        maskedEmail = emailMap.get(email) as string;
    }
    return maskedEmail;
};

const maskFragileData = (data: OnyxState | unknown[] | null, emailMap: Map<string, string>, parentKey?: string): OnyxState | unknown[] | null => {
    if (data === null) {
        return data;
    }

    if (Array.isArray(data)) {
        return data.map((item): unknown => {
            if (typeof item === 'string' && Str.isValidEmail(item)) {
                return maskEmail(item, emailMap);
            }
            return typeof item === 'object' ? maskFragileData(item as OnyxState, emailMap, parentKey) : item;
        });
    }

    const maskedData: OnyxState = {};

    for (const sourceKey of Object.keys(data)) {
        if (!Object.prototype.hasOwnProperty.call(data, sourceKey)) {
            continue;
        }

        // Read value from source using the original key
        const value = (data as Record<string, unknown>)[sourceKey];

        // Determine the destination key - mask it if it's an email
        // (e.g., in loginList where email addresses are used as object keys)
        const destinationKey = Str.isValidEmail(sourceKey) ? maskEmail(sourceKey, emailMap) : sourceKey;

        // Skip values that are already masked as MASKING_PATTERN
        if (value === MASKING_PATTERN) {
            maskedData[destinationKey] = value;
            continue;
        }

        // Handle collection nodes (reportActions, reports, transactions)
        if (sourceKey.startsWith(ONYXKEYS.COLLECTION.REPORT_ACTIONS) && typeof value === 'object') {
            maskedData[destinationKey] = maskFragileData(value as OnyxState, emailMap, sourceKey);
        } else if (sourceKey.startsWith(ONYXKEYS.COLLECTION.REPORT) && typeof value === 'object') {
            maskedData[destinationKey] = maskFragileData(value as OnyxState, emailMap, sourceKey);
        } else if (sourceKey.startsWith(ONYXKEYS.COLLECTION.TRANSACTION) && typeof value === 'object') {
            maskedData[destinationKey] = maskFragileData(value as OnyxState, emailMap, sourceKey);
        } else if (amountKeysToRandomize.has(sourceKey) && typeof value === 'number') {
            maskedData[destinationKey] = randomizeAmount(value);
            // Handle expensify_text_title masking
        } else if (parentKey === 'expensify_text_title' && sourceKey === 'value' && typeof value === 'string') {
            maskedData[destinationKey] = maskValuePreservingLength(value);
        } else if (sourceKey === 'expensify_text_title' && typeof value === 'object') {
            maskedData[destinationKey] = maskFragileData(value as OnyxState, emailMap, 'expensify_text_title');
            // Handle nodes that need full masking
        } else if (nodesToFullyMask.has(sourceKey) && typeof value === 'object') {
            maskedData[destinationKey] = maskFragileData(value as OnyxState, emailMap, sourceKey);
        } else if (parentKey && nodesToFullyMask.has(parentKey) && typeof value === 'string' && isDateValue(value)) {
            maskedData[destinationKey] = getCurrentDate();
        } else if (parentKey && nodesToFullyMask.has(parentKey) && typeof value === 'string') {
            maskedData[destinationKey] = maskValuePreservingLength(value);
        } else if (parentKey && nodesToFullyMask.has(parentKey) && typeof value === 'object') {
            maskedData[destinationKey] = maskFragileData(value as OnyxState, emailMap, parentKey);
        } else if (keysToMask.has(sourceKey)) {
            if (Array.isArray(value)) {
                maskedData[destinationKey] = value.map(() => MASKING_PATTERN);
            } else if (typeof value === 'object') {
                // If the value is an object, don't mask it as a string - recursively process it
                maskedData[destinationKey] = maskFragileData(value as OnyxState, emailMap, sourceKey);
            } else {
                maskedData[destinationKey] = maskValuePreservingLength(value);
            }
        } else if (typeof value === 'string' && Str.isValidEmail(value)) {
            maskedData[destinationKey] = maskEmail(value, emailMap);
        } else if (typeof value === 'string' && stringContainsEmail(value)) {
            maskedData[destinationKey] = replaceEmailInString(value, maskEmail(extractEmail(value) ?? '', emailMap));
        } else if (parentKey && parentKey.includes(ONYXKEYS.COLLECTION.REPORT_ACTIONS) && (destinationKey === 'text' || destinationKey === 'html')) {
            maskedData[destinationKey] = MASKING_PATTERN;
        } else if (typeof value === 'object') {
            maskedData[destinationKey] = maskFragileData(value as OnyxState, emailMap, destinationKey.includes(ONYXKEYS.COLLECTION.REPORT_ACTIONS) ? destinationKey : parentKey);
        } else {
            maskedData[destinationKey] = value;
        }
    }

    return maskedData;
};

const removePrivateOnyxKeys = (onyxState: OnyxState): OnyxState => {
    const newState: OnyxState = {};

    for (const key of Object.keys(onyxState)) {
        if (onyxKeysToRemove.has(key as ValueOf<typeof ONYXKEYS> | ValueOf<typeof ONYXKEYS.DERIVED>)) {
            continue;
        }
        newState[key] = onyxState[key];
    }

    return newState;
};

const maskOnyxState: MaskOnyxState = (data, isMaskingFragileDataEnabled) => {
    const emailMap = new Map<string, string>();

    try {
        let onyxState = {...data};

        onyxState = removePrivateOnyxKeys(onyxState);

        const keysWithRules = new Set<string>();

        for (const key of Object.keys(onyxState)) {
            let ruleKey = key;
            const collectionKey = Object.values(ONYXKEYS.COLLECTION).find((cKey) => key.startsWith(cKey));
            if (collectionKey) {
                ruleKey = collectionKey;
            }

            const rule = ONYX_KEY_EXPORT_RULES[ruleKey];

            if (rule) {
                onyxState[key] = processOnyxKeyWithRule(key, onyxState[key], rule);
                keysWithRules.add(key);
            } else if (safeOnyxKeys.has(ruleKey)) {
                // Safe keys pass through without any masking
                keysWithRules.add(key);
            }
        }

        if (isMaskingFragileDataEnabled) {
            // Only apply maskFragileData to keys that don't have export rules or safe designation
            const maskedState: OnyxState = {};
            for (const key of Object.keys(onyxState)) {
                if (keysWithRules.has(key)) {
                    maskedState[key] = onyxState[key];
                } else {
                    const masked = maskFragileData({[key]: onyxState[key]}, emailMap) as OnyxState;
                    maskedState[key] = masked[key];
                }
            }
            onyxState = maskedState;
        }

        return onyxState;
    } finally {
        // Always clear the email map, even if an error occurred
        emailMap.clear();
    }
};

export {maskOnyxState, emailRegex, ONYX_KEY_EXPORT_RULES, onyxKeysToRemove, safeOnyxKeys};
