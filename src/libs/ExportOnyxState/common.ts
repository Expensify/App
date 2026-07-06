import ONYXKEYS from '@src/ONYXKEYS';
import type OnyxState from '@src/types/onyx/OnyxState';

import type {ValueOf} from 'type-fest';

import {Str} from 'expensify-common';

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
    ...Object.values(ONYXKEYS.DERIVED),
]);

// ============================================================
// 2. KEYS WITH SPECIFIC EXPORT RULES — allow/mask per field
// ============================================================
const ONYX_KEY_EXPORT_RULES: Record<string, ExportRule> = {
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
    [ONYXKEYS.ACCOUNT]: {
        allowList: ['validated', 'isFromPublicDomain', 'isUsingExpensifyCard'],
        maskList: ['primaryLogin'],
    },
    [ONYXKEYS.PERSONAL_DETAILS_LIST]: {
        allowList: ['accountID', 'timezone', 'status', 'pronouns'],
        maskList: ['firstName', 'lastName', 'displayName', 'avatar', 'login'],
    },
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
    [ONYXKEYS.COLLECTION.TRANSACTION]: {
        allowList: ['transactionID', 'reportID', 'created', 'category', 'tag', 'billable'],
        maskList: ['merchant', 'description', 'comment'],
    },
    [ONYXKEYS.COLLECTION.POLICY]: {
        allowList: ['id', 'type', 'role', 'outputCurrency', 'isPolicyExpenseChatEnabled', 'areCategoriesEnabled', 'areTagsEnabled'],
        maskList: ['name', 'avatar'],
    },
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
};

// ============================================================
// 3. SAFE ONYX KEYS — export as-is, no masking needed
//    Add keys here to opt them out of maskFragileData once they are confirmed PII-free.
// ============================================================
const safeOnyxKeys = new Set<string>([
    ONYXKEYS.ACCOUNT_MANAGER_REPORT_ID,
    ONYXKEYS.ACTIVE_CLIENTS,
    ONYXKEYS.BETAS,
    ONYXKEYS.BETA_CONFIGURATION,
    ONYXKEYS.CACHED_PDF_PATHS,
    ONYXKEYS.COLLECTION.CONCIERGE_PENDING_FOLLOWUP_LIST,
    ONYXKEYS.COLLECTION.DEVICE_BIOMETRICS,
    ONYXKEYS.COLLECTION.DOWNLOAD,
    ONYXKEYS.COLLECTION.EXPENSIFY_CARD_BANK_ACCOUNT_METADATA,
    ONYXKEYS.COLLECTION.EXPENSIFY_CARD_CONTINUOUS_RECONCILIATION_CONNECTION,
    ONYXKEYS.COLLECTION.EXPENSIFY_CARD_RECONCILIATION_BANK_ACCOUNT_ID,
    ONYXKEYS.COLLECTION.EXPENSIFY_CARD_USE_CONTINUOUS_RECONCILIATION,
    ONYXKEYS.COLLECTION.EXPENSIFY_CARD_USE_CONTINUOUS_RECONCILIATION_PENDING_ACTION,
    ONYXKEYS.COLLECTION.LAST_SELECTED_EXPENSIFY_CARD_FEED,
    ONYXKEYS.COLLECTION.LAST_SELECTED_FEED,
    ONYXKEYS.COLLECTION.NVP_EXPENSIFY_REPORT_PDF_FILENAME,
    ONYXKEYS.COLLECTION.POLICY_HAS_CONNECTIONS_DATA_BEEN_FETCHED,
    ONYXKEYS.COLLECTION.POLICY_MERGE_HR_INITIAL_SYNC_MODAL_SHOWN,
    ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_MANUAL_BILLING,
    ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE,
    ONYXKEYS.COLLECTION.REPORT_ACTIONS_PAGES,
    ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE,
    ONYXKEYS.COLLECTION.REPORT_METADATA,
    ONYXKEYS.COLLECTION.REPORT_PAGINATION_STATE,
    ONYXKEYS.COLLECTION.REPORT_USER_IS_LEAVING_ROOM,
    ONYXKEYS.COLLECTION.SELECTED_DISTANCE_REQUEST_TAB,
    ONYXKEYS.COLLECTION.SELECTED_TAB,
    ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END,
    ONYXKEYS.COLLECTION.SKIP_CONFIRMATION,
    ONYXKEYS.COLLECTION.TRAVEL_INVOICING_CONTINUOUS_RECONCILIATION_CONNECTION,
    ONYXKEYS.COLLECTION.TRAVEL_INVOICING_RECONCILIATION_BANK_ACCOUNT_ID,
    ONYXKEYS.COLLECTION.TRAVEL_INVOICING_USE_CONTINUOUS_RECONCILIATION,
    ONYXKEYS.COLLECTION.TRAVEL_INVOICING_USE_CONTINUOUS_RECONCILIATION_PENDING_ACTION,
    ONYXKEYS.CONCIERGE_REPORT_ID,
    ONYXKEYS.CONCIERGE_THINKING_KICKOFF,
    ONYXKEYS.COPY_POLICY_SETTINGS,
    ONYXKEYS.CURRENCY_LIST,
    ONYXKEYS.CURRENT_DATE,
    ONYXKEYS.DOMAIN_GROUP_CREATE_PREFERRED_POLICY_ID,
    ONYXKEYS.FULLSCREEN_VISIBILITY,
    ONYXKEYS.HAS_DENIED_CONTACT_IMPORT_PROMPT,
    ONYXKEYS.HAS_LOADED_APP,
    ONYXKEYS.HAS_MORE_UNREPORTED_TRANSACTIONS_RESULTS,
    ONYXKEYS.HAS_NON_PERSONAL_POLICY,
    ONYXKEYS.IMPORTED_SPREADSHEET_MEMBER_ROLE,
    ONYXKEYS.INPUT_FOCUSED,
    ONYXKEYS.IS_BETA,
    ONYXKEYS.IS_COMING_FROM_GLOBAL_REIMBURSEMENTS_FLOW,
    ONYXKEYS.IS_DEBUG_MODE_ENABLED,
    ONYXKEYS.IS_GPS_IN_PROGRESS_MODAL_OPEN,
    ONYXKEYS.IS_LOADING_APP,
    ONYXKEYS.IS_LOADING_BILL_WHEN_DOWNGRADE,
    ONYXKEYS.IS_LOADING_BULK_CHANGE_APPROVER_PAGE,
    ONYXKEYS.IS_LOADING_PAYMENT_METHODS,
    ONYXKEYS.IS_LOADING_POLICY_CODING_RULES_PREVIEW,
    ONYXKEYS.IS_LOADING_REPORT_DATA,
    ONYXKEYS.IS_LOADING_SHARE_BANK_ACCOUNTS,
    ONYXKEYS.IS_LOADING_SUBSCRIPTION_DATA,
    ONYXKEYS.IS_LOADING_UNREPORTED_TRANSACTIONS,
    ONYXKEYS.IS_OPEN_APP_FAILURE_MODAL_OPEN,
    ONYXKEYS.IS_PENDING_UPDATE_PERSONAL_KARMA,
    ONYXKEYS.IS_PLAID_DISABLED,
    ONYXKEYS.IS_SEARCH_FILTERS_CARD_DATA_LOADED,
    ONYXKEYS.IS_SEARCH_PAGE_DATA_LOADED,
    ONYXKEYS.IS_SENTRY_DEBUG_ENABLED,
    ONYXKEYS.IS_SENTRY_SEND_ENABLED,
    ONYXKEYS.IS_TEST_TOOLS_MODAL_OPEN,
    ONYXKEYS.IS_USING_IMPORTED_STATE,
    ONYXKEYS.LAST_ACCESSED_WORKSPACE_POLICY_ID,
    ONYXKEYS.LAST_EXPORT_METHOD,
    ONYXKEYS.LAST_FULL_RECONNECT_TIME,
    ONYXKEYS.LAST_ROUTE,
    ONYXKEYS.LAST_VISITED_PATH,
    ONYXKEYS.LOCALLY_PROCESSED_3DS_TRANSACTION_REVIEWS,
    ONYXKEYS.MAX_CANVAS_AREA,
    ONYXKEYS.MAX_CANVAS_HEIGHT,
    ONYXKEYS.MAX_CANVAS_WIDTH,
    ONYXKEYS.MODAL,
    ONYXKEYS.NETWORK,
    ONYXKEYS.NVP_ACTIVE_POLICY_ID,
    ONYXKEYS.NVP_APP_REVIEW,
    ONYXKEYS.NVP_BLOCKED_FROM_CHAT,
    ONYXKEYS.NVP_BLOCKED_FROM_CONCIERGE,
    ONYXKEYS.NVP_BULK_POLICY_COPY_SETTINGS,
    ONYXKEYS.NVP_DELETE_TRANSACTION_NAVIGATE_BACK_URL,
    ONYXKEYS.NVP_DISMISSED_ASAP_SUBMIT_EXPLANATION,
    ONYXKEYS.NVP_DISMISSED_HOLD_USE_EXPLANATION,
    ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING,
    ONYXKEYS.NVP_DISMISSED_REFERRAL_BANNERS,
    ONYXKEYS.NVP_DISMISSED_REJECT_USE_EXPLANATION,
    ONYXKEYS.NVP_EMPTY_REPORTS_CONFIRMATION_DISMISSED,
    ONYXKEYS.NVP_HAS_SEEN_TRACK_TRAINING,
    ONYXKEYS.NVP_LAST_ANDROID_LOGIN,
    ONYXKEYS.NVP_LAST_DISTANCE_EXPENSE_TYPE,
    ONYXKEYS.NVP_LAST_ECASH_ANDROID_LOGIN,
    ONYXKEYS.NVP_LAST_ECASH_IOS_LOGIN,
    ONYXKEYS.NVP_LAST_IPHONE_LOGIN,
    ONYXKEYS.NVP_LAST_LOCATION_PERMISSION_PROMPT,
    ONYXKEYS.NVP_MUTED_PLATFORMS,
    ONYXKEYS.NVP_ONBOARDING,
    ONYXKEYS.NVP_ONBOARDING_RHP_VARIANT,
    ONYXKEYS.NVP_PERSONAL_OFFSETS,
    ONYXKEYS.NVP_PREFERRED_LOCALE,
    ONYXKEYS.NVP_PRIORITY_MODE,
    ONYXKEYS.NVP_PRIVATE_GRANDFATHERED_FREE,
    ONYXKEYS.NVP_PRIVATE_LOCK_ACCOUNT_DETAILS,
    ONYXKEYS.NVP_PRIVATE_MANUAL_TEAM_2025_PRICING,
    ONYXKEYS.NVP_PRIVATE_TAX_EXEMPT,
    ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE,
    ONYXKEYS.NVP_RECONNECT_APP_IF_FULL_RECONNECT_BEFORE,
    ONYXKEYS.NVP_REPORT_DETAILS_COLUMNS,
    ONYXKEYS.NVP_REPORT_LAYOUT_GROUP_BY,
    ONYXKEYS.NVP_SEARCH_SIDEBAR,
    ONYXKEYS.NVP_SEEN_NEW_USER_MODAL,
    ONYXKEYS.NVP_SIDE_PANEL,
    ONYXKEYS.NVP_TRY_FOCUS_MODE,
    ONYXKEYS.NVP_TRY_NEW_DOT,
    ONYXKEYS.ONBOARDING_ADMINS_CHAT_REPORT_ID,
    ONYXKEYS.ONBOARDING_COMPANY_SIZE,
    ONYXKEYS.ONBOARDING_CUSTOM_CHOICES,
    ONYXKEYS.ONBOARDING_ERROR_MESSAGE_TRANSLATION_KEY,
    ONYXKEYS.ONBOARDING_LAST_VISITED_PATH,
    ONYXKEYS.ONBOARDING_POLICY_ID,
    ONYXKEYS.ONBOARDING_PURPOSE_SELECTED,
    ONYXKEYS.ONBOARDING_USER_REPORTED_INTEGRATION,
    ONYXKEYS.PERSONAL_POLICY_ID,
    ONYXKEYS.PLAID_CURRENT_EVENT,
    ONYXKEYS.POLICY_OWNERSHIP_CHANGE_CHECKS,
    ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE,
    ONYXKEYS.PREFERRED_THEME,
    ONYXKEYS.RAM_ONLY_ARE_TRANSLATIONS_LOADING,
    ONYXKEYS.RAM_ONLY_IS_AUTHENTICATING_WITH_SHORT_LIVED_TOKEN,
    ONYXKEYS.RAM_ONLY_IS_CHECKING_PUBLIC_ROOM,
    ONYXKEYS.RAM_ONLY_IS_SEARCHING_FOR_REPORTS,
    ONYXKEYS.RAM_ONLY_IS_SIDEBAR_LOADED,
    ONYXKEYS.RAM_ONLY_MOBILE_SELECTION_MODE,
    ONYXKEYS.RAM_ONLY_UPDATE_AVAILABLE,
    ONYXKEYS.RAM_ONLY_UPDATE_REQUIRED,
    ONYXKEYS.REIMBURSEMENT_ACCOUNT_OPTION_PRESSED,
    ONYXKEYS.REIMBURSEMENT_ACCOUNT_WORKSPACE_ID,
    ONYXKEYS.REPORT_LAST_VISIT_TIMES,
    ONYXKEYS.RESET_REQUIRED,
    ONYXKEYS.ROOM_ID_HIGHLIGHT_ON_ROOMS_PAGE,
    ONYXKEYS.SEARCH_CONTEXT,
    ONYXKEYS.SELF_DM_REPORT_ID,
    ONYXKEYS.SENTRY_DEBUG_HIGHLIGHTED_SPAN_OPS,
    ONYXKEYS.SHOULD_BILL_WHEN_DOWNGRADING,
    ONYXKEYS.SHOULD_MASK_ONYX_STATE,
    ONYXKEYS.SHOULD_SHOW_BRANCH_NAME_IN_TITLE,
    ONYXKEYS.SHOULD_USE_STAGING_SERVER,
    ONYXKEYS.SIGN_IN_HIGH_CONTRAST_INTENT,
    ONYXKEYS.STATUS_DRAFT_CUSTOM_CLEAR_AFTER_DATE,
    ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_FAILED,
    ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_PENDING,
    ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_SUCCESSFUL,
    ONYXKEYS.TRANSACTION_IDS_HIGHLIGHT_ON_SEARCH_ROUTE,
    ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS,
    ONYXKEYS.TRAVEL_INVOICE_STATEMENT,
    ONYXKEYS.VALIDATE_DOMAIN_TWO_FACTOR_CODE,
    ONYXKEYS.VALIDATE_USER_AND_GET_ACCESSIBLE_POLICIES,
    ONYXKEYS.VIEWING_PUBLIC_ROOM_REPORT_ID,
]);

// ============================================================
// 4. KEYS TO MASK FRAGILE DATA — fallback bucket
//    Every key listed here is processed by maskFragileData, the default
//    treatment for keys without an explicit rule. This list is
//    intentionally hardcoded (not derived from ONYXKEYS) so that whenever a new
//    Onyx key is added it lands in none of the four buckets and the coverage
//    test in ExportOnyxStateTest fails — forcing it to be categorized on purpose.
// ============================================================
const onyxKeysToMaskFragileData = new Set<string>([
    ONYXKEYS.ADD_NEW_COMPANY_CARD,
    ONYXKEYS.ADD_NEW_PERSONAL_CARD,
    ONYXKEYS.APPROVAL_WORKFLOW,
    ONYXKEYS.ASSIGN_CARD,
    ONYXKEYS.BILLING_RECEIPT_DETAILS,
    ONYXKEYS.COLLECTION.ATTACHMENT,
    ONYXKEYS.COLLECTION.BANK_ACCOUNT_SHARE_DETAILS,
    ONYXKEYS.COLLECTION.CODING_RULE_MATCHING_TRANSACTION,
    ONYXKEYS.COLLECTION.DEPRECATED_POLICY_MEMBER_LIST,
    ONYXKEYS.COLLECTION.DOMAIN,
    ONYXKEYS.COLLECTION.DOMAIN_ERRORS,
    ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS,
    ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD,
    ONYXKEYS.COLLECTION.MERGE_TRANSACTION,
    ONYXKEYS.COLLECTION.NEXT_STEP,
    ONYXKEYS.COLLECTION.NVP_EXPENSIFY_ON_CARD_WAITLIST,
    ONYXKEYS.COLLECTION.PASSKEY_CREDENTIALS,
    ONYXKEYS.COLLECTION.PENDING_CONCIERGE_RESPONSE,
    ONYXKEYS.COLLECTION.POLICY_CATEGORIES,
    ONYXKEYS.COLLECTION.POLICY_CATEGORIES_DRAFT,
    ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS,
    ONYXKEYS.COLLECTION.POLICY_DRAFTS,
    ONYXKEYS.COLLECTION.POLICY_JOIN_MEMBER,
    ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES,
    ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_DESTINATIONS,
    ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS,
    ONYXKEYS.COLLECTION.POLICY_TAGS,
    ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS,
    ONYXKEYS.COLLECTION.PRIVATE_NOTES_DRAFT,
    ONYXKEYS.COLLECTION.RAM_ONLY_ISSUE_NEW_EXPENSIFY_CARD,
    ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS,
    ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS,
    ONYXKEYS.COLLECTION.REPORT_DRAFT,
    ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT,
    ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS,
    ONYXKEYS.COLLECTION.REPORT_USER_IS_TYPING,
    ONYXKEYS.COLLECTION.SAML_METADATA,
    ONYXKEYS.COLLECTION.SECURITY_GROUP,
    ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT,
    ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER,
    ONYXKEYS.COLLECTION.SNAPSHOT,
    ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT,
    ONYXKEYS.COLLECTION.TRANSACTION_BACKUP,
    ONYXKEYS.COLLECTION.TRANSACTION_DRAFT,
    ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS,
    ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST,
    ONYXKEYS.COLLECTION.WORKSPACE_INVITE_APPROVER_DRAFT,
    ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT,
    ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MESSAGE_DRAFT,
    ONYXKEYS.COLLECTION.WORKSPACE_INVITE_ROLE_DRAFT,
    ONYXKEYS.CORPAY_FIELDS,
    ONYXKEYS.CORPAY_ONBOARDING_FIELDS,
    ONYXKEYS.COUNTRY,
    ONYXKEYS.COUNTRY_CODE,
    ONYXKEYS.CUSTOM_STATUS_DRAFT,
    ONYXKEYS.DEFAULT_P2P_MILEAGE_RATE,
    ONYXKEYS.DEVICE_ID,
    ONYXKEYS.DUPLICATE_WORKSPACE,
    ONYXKEYS.FREQUENTLY_USED_EMOJIS,
    ONYXKEYS.FUND_LIST,
    ONYXKEYS.GPS_DRAFT_DETAILS,
    ONYXKEYS.HYBRID_APP,
    ONYXKEYS.IMPORTED_SPREADSHEET,
    ONYXKEYS.IMPORTED_SPREADSHEET_MEMBER_DATA,
    ONYXKEYS.INITIATING_BANK_ACCOUNT_UNLOCK,
    ONYXKEYS.JOINABLE_POLICIES,
    ONYXKEYS.LOGINS,
    ONYXKEYS.MAPBOX_ACCESS_TOKEN,
    ONYXKEYS.MY_DOMAIN_SECURITY_GROUPS,
    ONYXKEYS.NEW_GROUP_CHAT_DRAFT,
    ONYXKEYS.NVP_BILLING_FUND_ID,
    ONYXKEYS.NVP_CSV_EXPORT_LAYOUTS,
    ONYXKEYS.NVP_EXPENSE_RULES,
    ONYXKEYS.NVP_EXPENSIFY_COMPANY_CARDS_CUSTOM_NAMES,
    ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL,
    ONYXKEYS.NVP_INBOX_TAB,
    ONYXKEYS.NVP_INTEGRATION_SERVER_EXPORT_TEMPLATES,
    ONYXKEYS.NVP_INTRO_SELECTED,
    ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL,
    ONYXKEYS.NVP_LAST_PAYMENT_METHOD,
    ONYXKEYS.NVP_LAST_SELECTED_DISTANCE_RATES,
    ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED,
    ONYXKEYS.NVP_PRIVATE_CANCELLATION_DETAILS,
    ONYXKEYS.NVP_PRIVATE_FIRST_POLICY_CREATED_DATE,
    ONYXKEYS.NVP_PRIVATE_FREEBIE_CREDITS,
    ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END,
    ONYXKEYS.NVP_PRIVATE_PROMO_CODE,
    ONYXKEYS.NVP_PRIVATE_PROMO_CODE_VALID_BILLING_CYCLES,
    ONYXKEYS.NVP_PRIVATE_PROMO_DISCOUNT,
    ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION,
    ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE,
    ONYXKEYS.NVP_RECENT_ATTENDEES,
    ONYXKEYS.NVP_RECENT_WAYPOINTS,
    ONYXKEYS.NVP_REPORT_LAYOUT_OPTION,
    ONYXKEYS.NVP_SAVED_CSV_COLUMN_LAYOUT_LIST,
    ONYXKEYS.NVP_TRAVEL_SETTINGS,
    ONYXKEYS.ODOMETER_DRAFT,
    ONYXKEYS.ONBOARDING_PERSONAL_TRACK_GOAL,
    ONYXKEYS.ONYX_UPDATES_FROM_SERVER,
    ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT,
    ONYXKEYS.PENDING_CONTACT_ACTION,
    ONYXKEYS.PERSISTED_ONGOING_REQUESTS,
    ONYXKEYS.PERSISTED_REQUESTS,
    ONYXKEYS.PERSONAL_BANK_ACCOUNT,
    ONYXKEYS.PERSONAL_DETAILS_METADATA,
    ONYXKEYS.PLAID_DATA,
    ONYXKEYS.PRESERVED_ACCOUNT,
    ONYXKEYS.PRESERVED_USER_SESSION,
    ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
    ONYXKEYS.PURCHASE_LIST,
    ONYXKEYS.QUEUE_FLUSHED_DATA,
    ONYXKEYS.RAM_ONLY_DOMAIN_MEMBERS_SELECTED_FOR_MOVE,
    ONYXKEYS.RAM_ONLY_HAS_DISMISSED_CONCIERGE_NOTIFICATION_BANNER,
    ONYXKEYS.RAM_ONLY_HAS_FRESH_WALLET_DATA,
    ONYXKEYS.RAM_ONLY_WALLET_ONFIDO,
    ONYXKEYS.RECENTLY_USED_CURRENCIES,
    ONYXKEYS.RECENTLY_USED_REPORT_FIELDS,
    ONYXKEYS.RECENT_SEARCHES,
    ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY,
    ONYXKEYS.REVIEW_DUPLICATES,
    ONYXKEYS.ROOM_MEMBERS_USER_SEARCH_PHRASE,
    ONYXKEYS.SAVED_SEARCHES,
    ONYXKEYS.SCHEDULE_CALL_DRAFT,
    ONYXKEYS.SCREEN_SHARE_REQUEST,
    ONYXKEYS.SHARE_BANK_ACCOUNT,
    ONYXKEYS.SHARE_TEMP_FILE,
    ONYXKEYS.SHARE_UNKNOWN_USER_DETAILS,
    ONYXKEYS.SUPPORTAL_PERMISSION_DENIED,
    ONYXKEYS.TASK,
    ONYXKEYS.TRANSACTIONS_PENDING_3DS_REVIEW,
    ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_THREAD_REPORT_IDS,
    ONYXKEYS.TRAVEL_PROVISIONING,
    ONYXKEYS.UNSHARE_BANK_ACCOUNT,
    ONYXKEYS.USER_LOCATION,
    ONYXKEYS.USER_METADATA,
    ONYXKEYS.VALIDATE_ACTION_CODE,
    ONYXKEYS.VALIDATED_FILE_OBJECT,
    ONYXKEYS.VERIFY_3DS_SUBSCRIPTION,
    ONYXKEYS.WALLET_ADDITIONAL_DETAILS,
    ONYXKEYS.WALLET_STATEMENT,
    ONYXKEYS.WALLET_TERMS,
    ONYXKEYS.WALLET_TRANSFER,
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

export {maskOnyxState, emailRegex, ONYX_KEY_EXPORT_RULES, onyxKeysToRemove, safeOnyxKeys, onyxKeysToMaskFragileData};
