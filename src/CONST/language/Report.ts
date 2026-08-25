import {REPORT_ACTION_TYPES} from '@src/CONST/REPORT_ACTION_TYPES';

const REPORT = {
    MAX_TRANSACTIONS: 500,
    ACTIONS: {
        TYPE: REPORT_ACTION_TYPES,
    },
    ARCHIVE_REASON: {
        DEFAULT: 'default',
        ACCOUNT_CLOSED: 'accountClosed',
        ACCOUNT_MERGED: 'accountMerged',
        REMOVED_FROM_POLICY: 'removedFromPolicy',
        POLICY_DELETED: 'policyDeleted',
        INVOICE_RECEIVER_POLICY_DELETED: 'invoiceReceiverPolicyDeleted',
        BOOKING_END_DATE_HAS_PASSED: 'bookingEndDateHasPassed',
    },
    WORKSPACE_CHAT_ROOMS: {
        ADMINS: '#admins',
    },
    EXPORT_OPTION_LABELS: {
        REPORT_LEVEL_EXPORT: 'All Data - Report Level Export',
        EXPENSE_LEVEL_EXPORT: 'All Data - Expense Level Export',
        MULTIPLE_TAX_EXPORT: 'Canadian Multiple Tax Export',
        DEFAULT_CSV: 'Default CSV',
    },
} as const;

const IOU = {
    TYPE: {
        CREATE: 'create',
    },
    SPLITS_LIMIT: 30,
} as const;

const NEXT_STEP = {
    MESSAGE_KEY: {
        WAITING_TO_ADD_TRANSACTIONS: 'waitingToAddTransactions',
        WAITING_TO_SUBMIT: 'waitingToSubmit',
        WAITING_TO_MARK_AS_DONE: 'waitingToMarkAsDone',
        NO_FURTHER_ACTION: 'noFurtherAction',
        WAITING_FOR_SUBMITTER_ACCOUNT: 'waitingForSubmitterAccount',
        WAITING_FOR_AUTOMATIC_SUBMIT: 'waitingForAutomaticSubmit',
        WAITING_TO_FIX_ISSUES: 'waitingToFixIssues',
        WAITING_TO_APPROVE: 'waitingToApprove',
        WAITING_TO_PAY: 'waitingToPay',
        WAITING_FOR_PAYMENT: 'waitingForPayment',
        WAITING_TO_EXPORT: 'waitingToExport',
        SUBMITTING_TO_SELF: 'submittingToSelf',
        REJECTED_REPORT: 'rejectedReport',
    },
    ICONS: {
        HOURGLASS: 'hourglass',
        CHECKMARK: 'checkmark',
        STOPWATCH: 'stopwatch',
    },
    ETA_KEY: {
        SHORTLY: 'shortly',
        TODAY: 'today',
        END_OF_WEEK: 'endOfWeek',
        SEMI_MONTHLY: 'semiMonthly',
        LAST_BUSINESS_DAY_OF_MONTH: 'lastBusinessDayOfMonth',
        LAST_DAY_OF_MONTH: 'lastDayOfMonth',
        END_OF_TRIP: 'endOfTrip',
    },
    ACTOR_TYPE: {
        CURRENT_USER: 'currentUser',
        OTHER_USER: 'otherUser',
        UNSPECIFIED_ADMIN: 'unspecifiedAdmin',
    },
    ETA_TYPE: {
        KEY: 'key',
        DATE_TIME: 'dateTime',
    },
} as const;

export {IOU, NEXT_STEP, REPORT};
