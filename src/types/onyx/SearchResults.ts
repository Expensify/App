import type {ValueOf} from 'type-fest';
import type {SearchStatus} from '@components/Search/types';
import type ChatListItem from '@components/SelectionList/ChatListItem';
import type ReportListItem from '@components/SelectionList/Search/ReportListItem';
import type TransactionListItem from '@components/SelectionList/Search/TransactionListItem';
import type {ReportActionListItemType, ReportListItemType, TransactionListItemType} from '@components/SelectionList/types';
import type CONST from '@src/CONST';
import type ONYXKEYS from '@src/ONYXKEYS';
import type {ACHAccount} from './Policy';
import type {InvoiceReceiver} from './Report';
import type ReportActionName from './ReportActionName';
import type ReportNameValuePairs from './ReportNameValuePairs';

/** Types of search data */
type SearchDataTypes = ValueOf<typeof CONST.SEARCH.DATA_TYPES>;

/** Model of search result list item */
type ListItemType<C extends SearchDataTypes, T extends SearchStatus> = C extends typeof CONST.SEARCH.DATA_TYPES.CHAT
    ? typeof ChatListItem
    : T extends typeof CONST.SEARCH.STATUS.EXPENSE.ALL
    ? typeof TransactionListItem
    : typeof ReportListItem;

/** Model of search list item data type */
type ListItemDataType<C extends SearchDataTypes, T extends SearchStatus> = C extends typeof CONST.SEARCH.DATA_TYPES.CHAT
    ? ReportActionListItemType[]
    : T extends typeof CONST.SEARCH.STATUS.EXPENSE.ALL
    ? TransactionListItemType[]
    : ReportListItemType[];

/** Model of columns to show for search results */
type ColumnsToShow = {
    /** Whether the category column should be shown */
    shouldShowCategoryColumn: boolean;

    /** Whether the tag column should be shown */
    shouldShowTagColumn: boolean;

    /** Whether the tax column should be shown */
    shouldShowTaxColumn: boolean;
};

/** Model of search result state */
type SearchResultsInfo = {
    /** Current search results offset/cursor */
    offset: number;

    /** Type of search */
    type: SearchDataTypes;

    /** The status filter for the current search */
    status: SearchStatus;

    /** Whether the user can fetch more search results */
    hasMoreResults: boolean;

    /** Whether the user has any valid data on the current search type, for instance,
     * whether they have created any invoice yet when the search type is invoice */
    hasResults: boolean;

    /** Whether the search results are currently loading */
    isLoading: boolean;

    /** The optional columns that should be shown according to policy settings */
    columnsToShow: ColumnsToShow;
};

/** Model of personal details search result */
type SearchPersonalDetails = {
    /** ID of user account */
    accountID: number;

    /** User's avatar URL */
    avatar: string;

    /** User's display name */
    displayName?: string;

    /** User's email */
    login?: string;
};

/** The action that can be performed for the transaction */
type SearchTransactionAction = ValueOf<typeof CONST.SEARCH.ACTION_TYPES>;

/** Model of report search result */
type SearchReport = {
    /** The ID of the report */
    reportID: string;

    /** ID of the chat report */
    chatReportID?: string;

    /** The name of the report */
    reportName?: string;

    /** The report total amount */
    total?: number;

    /** The report currency */
    currency?: string;

    /** The report type */
    type?: ValueOf<typeof CONST.REPORT.TYPE>;

    /** The accountID of the report manager */
    managerID?: number;

    /** The accountID of the user who created the report  */
    accountID?: number;

    /** The policyID of the report */
    policyID?: string;

    /** The date the report was created */
    created?: string;

    /** The action that can be performed for the report */
    action?: SearchTransactionAction;

    /** The type of chat if this is a chat report */
    chatType?: ValueOf<typeof CONST.REPORT.CHAT_TYPE>;

    /** Invoice room receiver data */
    invoiceReceiver?: InvoiceReceiver;

    /** Whether the report has a single transaction */
    isOneTransactionReport?: boolean;

    /** Whether the report is policyExpenseChat */
    isPolicyExpenseChat?: boolean;

    /** Whether the report is waiting on a bank account */
    isWaitingOnBankAccount?: boolean;

    /** If the report contains nonreimbursable expenses, send the nonreimbursable total */
    nonReimbursableTotal?: number;

    /** Account ID of the report owner */
    ownerAccountID?: number;

    /** The state that the report is currently in */
    stateNum?: ValueOf<typeof CONST.REPORT.STATE_NUM>;

    /** The status of the current report */
    statusNum?: ValueOf<typeof CONST.REPORT.STATUS_NUM>;

    /** For expense reports, this is the total amount requested */
    unheldTotal?: number;

    /** Whether the report is archived */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    private_isArchived?: string;

    /** Whether the action is loading */
    isActionLoading?: boolean;
};

/** Model of report action search result */
type SearchReportAction = {
    /** The report action sender ID */
    accountID: number;

    /** The name (or type) of the action */
    actionName: ReportActionName;

    /** The report action created date */
    created: string;

    /** report action message */
    message: Array<{
        /** The type of the action item fragment. Used to render a corresponding component */
        type: string;

        /** The text content of the fragment. */
        text: string;

        /** The html content of the fragment. */
        html: string;

        /** Collection of accountIDs of users mentioned in message */
        whisperedTo?: number[];
    }>;

    /** The ID of the report action */
    reportActionID: string;

    /** The ID of the report */
    reportID: string;
};

/** Model of policy search result */
type SearchPolicy = {
    /** The policy type */
    type: ValueOf<typeof CONST.POLICY.TYPE>;

    /** Whether the auto reporting is enabled */
    autoReporting?: boolean;

    /**
     * The scheduled submit frequency set up on this policy.
     * Note that manual does not exist in the DB and thus should not exist in Onyx, only as a param for the API.
     * "manual" really means "immediate" (aka "daily") && harvesting.enabled === false
     */
    autoReportingFrequency?: Exclude<ValueOf<typeof CONST.POLICY.AUTO_REPORTING_FREQUENCIES>, typeof CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL>;

    /** The approval mode set up on this policy */
    approvalMode?: ValueOf<typeof CONST.POLICY.APPROVAL_MODE>;

    /** The reimbursement choice for policy */
    reimbursementChoice?: ValueOf<typeof CONST.POLICY.REIMBURSEMENT_CHOICES>;

    /** The maximum report total allowed to trigger auto reimbursement */
    autoReimbursementLimit?: number;

    /** The verified bank account linked to the policy */
    achAccount?: ACHAccount;

    /** The current user's role in the policy */
    role: ValueOf<typeof CONST.POLICY.ROLE>;

    /** The employee list of the policy */
    employeeList?: Record<string, Record<string, string>>;

    /** Detailed settings for the autoReimbursement */
    autoReimbursement?: {
        /** The auto reimbursement limit */
        limit: number;
    };

    /** Whether the self approval or submitting is enabled */
    preventSelfApproval?: boolean;
};

/** Model of transaction search result */
type SearchTransaction = {
    /** The ID of the transaction */
    transactionID: string;

    /** The transaction created date */
    created: string;

    /** The edited transaction created date */
    modifiedCreated: string;

    /** The transaction amount */
    amount: number;

    /** If the transaction can be deleted */
    canDelete: boolean;

    /** If the transaction can be put on hold */
    canHold: boolean;

    /** If the transaction can be removed from hold */
    canUnhold: boolean;

    /** The edited transaction amount */
    modifiedAmount: number;

    /** The transaction currency */
    currency: string;

    /** The edited transaction currency */
    modifiedCurrency: string;

    /** The transaction merchant */
    merchant: string;

    /** The edited transaction merchant */
    modifiedMerchant: string;

    /** The receipt object */
    receipt?: {
        /** Source of the receipt */
        source?: string;

        /** State of the receipt */
        state?: ValueOf<typeof CONST.IOU.RECEIPT_STATE>;
    };

    /** The transaction tag */
    tag: string;

    /** The transaction description */
    comment?: {
        /** Content of the transaction description */
        comment?: string;
    };

    /** The transaction category */
    category: string;

    /** The type of request */
    transactionType: ValueOf<typeof CONST.SEARCH.TRANSACTION_TYPE>;

    /** The type of report the transaction is associated with */
    reportType: string;

    /** The ID of the policy the transaction is associated with */
    policyID: string;

    /** The ID of the parent of the transaction */
    parentTransactionID?: string;

    /** If the transaction has an Ereceipt */
    hasEReceipt?: boolean;

    /** The transaction description */
    description?: string;

    /** The transaction sender ID */
    accountID: number;

    /** The transaction recipient ID */
    managerID: number;

    /** If the transaction has violations */
    hasViolation?: boolean;

    /** The transaction tax amount */
    taxAmount?: number;

    /** The ID of the report the transaction is associated with */
    reportID: string;

    /** The report ID of the transaction thread associated with the transaction */
    transactionThreadReportID: string;

    /** The action that can be performed for the transaction */
    action: SearchTransactionAction;

    /** The MCC Group associated with the transaction */
    mccGroup?: ValueOf<typeof CONST.MCC_GROUPS>;

    /** The modified MCC Group associated with the transaction */
    modifiedMCCGroup?: ValueOf<typeof CONST.MCC_GROUPS>;

    /** The ID of the money request reportAction associated with the transaction */
    moneyRequestReportActionID?: string;

    /** Whether the transaction report has only a single transaction */
    isFromOneTransactionReport?: boolean;

    /** Whether the action is loading */
    isActionLoading?: boolean;
};

/** Types of searchable transactions */
type SearchTransactionType = ValueOf<typeof CONST.SEARCH.TRANSACTION_TYPE>;

/**
 * A utility type that creates a record where all keys are strings that start with a specified prefix.
 */
type PrefixedRecord<Prefix extends string, ValueType> = {
    [Key in `${Prefix}${string}`]: ValueType;
};

/** Model of search results */
type SearchResults = {
    /** Current search results state */
    search: SearchResultsInfo;

    /** Search results data */
    data: PrefixedRecord<typeof ONYXKEYS.COLLECTION.TRANSACTION, SearchTransaction> &
        Record<typeof ONYXKEYS.PERSONAL_DETAILS_LIST, Record<string, SearchPersonalDetails>> &
        PrefixedRecord<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS, Record<string, SearchReportAction>> &
        PrefixedRecord<typeof ONYXKEYS.COLLECTION.REPORT, SearchReport> &
        PrefixedRecord<typeof ONYXKEYS.COLLECTION.POLICY, SearchPolicy> &
        PrefixedRecord<typeof ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, ReportNameValuePairs>;

    /** Whether search data is being fetched from server */
    isLoading?: boolean;
};

export default SearchResults;

export type {
    ListItemType,
    ListItemDataType,
    SearchTransaction,
    SearchTransactionType,
    SearchTransactionAction,
    SearchPersonalDetails,
    SearchDataTypes,
    SearchReport,
    SearchReportAction,
    SearchPolicy,
};
