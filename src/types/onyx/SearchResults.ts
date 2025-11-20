import type {ValueOf} from 'type-fest';
import type {SearchStatus} from '@components/Search/types';
import type ChatListItem from '@components/SelectionListWithSections/ChatListItem';
import type TransactionGroupListItem from '@components/SelectionListWithSections/Search/TransactionGroupListItem';
import type TransactionListItem from '@components/SelectionListWithSections/Search/TransactionListItem';
import type {ReportActionListItemType, TaskListItemType, TransactionGroupListItemType, TransactionListItemType} from '@components/SelectionListWithSections/types';
import type {IOURequestType} from '@libs/actions/IOU';
import type CONST from '@src/CONST';
import type ONYXKEYS from '@src/ONYXKEYS';
import type {BankName} from './Bank';
import type * as OnyxCommon from './OnyxCommon';
import type PersonalDetails from './PersonalDetails';
import type Policy from './Policy';
import type {InvoiceReceiver, Participants} from './Report';
import type ReportAction from './ReportAction';
import type ReportNameValuePairs from './ReportNameValuePairs';
import type {TransactionViolation} from './TransactionViolation';

/** Types of search data */
type SearchDataTypes = ValueOf<typeof CONST.SEARCH.DATA_TYPES>;

/** Model of search result list item */
type ListItemType<C extends SearchDataTypes, T extends SearchStatus> = C extends typeof CONST.SEARCH.DATA_TYPES.CHAT
    ? typeof ChatListItem
    : T extends typeof CONST.SEARCH.STATUS.EXPENSE.ALL
      ? typeof TransactionListItem
      : typeof TransactionGroupListItem;

/** Model of search list item data type */
type ListItemDataType<C extends SearchDataTypes, T extends SearchStatus> = C extends typeof CONST.SEARCH.DATA_TYPES.CHAT
    ? ReportActionListItemType[]
    : C extends typeof CONST.SEARCH.DATA_TYPES.TASK
      ? TaskListItemType[]
      : T extends typeof CONST.SEARCH.STATUS.EXPENSE.ALL
        ? TransactionListItemType[]
        : TransactionGroupListItemType[];

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

    /** The number of results */
    count?: number;

    /** The total spend */
    total?: number;

    /** The currency of the total spend */
    currency?: string;
};

/** The action that can be performed for the transaction */
type SearchTransactionAction = ValueOf<typeof CONST.SEARCH.ACTION_TYPES>;

/** Model of report search result
 *
 * @deprecated - Use Report instead
 */
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

    /** The policyID of the report */
    policyID?: string;

    /** The date the report was created */
    created?: string;

    /** The type of chat if this is a chat report */
    chatType?: ValueOf<typeof CONST.REPORT.CHAT_TYPE>;

    /** Invoice room receiver data */
    invoiceReceiver?: InvoiceReceiver;

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

    /** Whether the report has violations or errors */
    errors?: OnyxCommon.Errors;

    /** Collection of report participants, indexed by their accountID */
    participants?: Participants;

    /** ID of the parent report of the current report, if it exists */
    parentReportID?: string;

    /** ID of the parent report action of the current report, if it exists */
    parentReportActionID?: string;

    /** Whether the report has a child that is an outstanding expense that is awaiting action from the current user */
    hasOutstandingChildRequest?: boolean;

    /** Whether the user is not an admin of policyExpenseChat chat */
    isOwnPolicyExpenseChat?: boolean;

    /** The policy name to use for an archived report */
    oldPolicyName?: string;

    /** Pending fields for the report */
    pendingFields?: {
        /** Pending action for the preview */
        preview?: OnyxCommon.PendingAction;
    };

    /** Pending action for the report */
    pendingAction?: OnyxCommon.PendingAction;
};

/** Model of transaction search result
 *
 * @deprecated - Use Transaction instead
 */
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

        /** The name of the file of the receipt */
        filename?: string;
    };

    /** The transaction tag */
    tag: string;

    /** The transaction description */
    comment?: {
        /** Content of the transaction description */
        comment?: string;

        /** The HOLD report action ID if the transaction is on hold */
        hold?: string;
    };

    /** The transaction category */
    category: string;

    /** The ID of the parent of the transaction */
    parentTransactionID?: string;

    /** If the transaction has an Ereceipt */
    hasEReceipt?: boolean;

    /** Used during the creation flow before the transaction is saved to the server */
    iouRequestType?: IOURequestType;

    /** The transaction tax amount */
    taxAmount?: number;

    /** The ID of the report the transaction is associated with */
    reportID: string;

    /** The name of the file used for a receipt */
    filename?: string;

    /** The report ID of the transaction thread associated with the transaction */
    transactionThreadReportID: string;

    /** The MCC Group associated with the transaction */
    mccGroup?: ValueOf<typeof CONST.MCC_GROUPS>;

    /** The modified MCC Group associated with the transaction */
    modifiedMCCGroup?: ValueOf<typeof CONST.MCC_GROUPS>;

    /** The ID of the money request reportAction associated with the transaction */
    moneyRequestReportActionID?: string;

    /** Whether the transaction report has only a single transaction */
    isFromOneTransactionReport?: boolean;

    /** Whether the transaction has violations or errors */
    errors?: OnyxCommon.Errors;

    /** The type of action that's pending  */
    pendingAction?: OnyxCommon.PendingAction;

    /** The CC for this transaction */
    cardID?: number;

    /** The display name of the purchaser card, if any */
    cardName?: string;

    /** The converted amount of the transaction, defaults to the active policies currency, or the converted currency if a currency conversion is used */
    convertedAmount: number;

    /** The currency that the converted amount is in */
    convertedCurrency: string;
};

/** Model of tasks search result */
type SearchTask = {
    /** The type of the response */
    type: ValueOf<typeof CONST.SEARCH.DATA_TYPES>;

    /** The account ID of the user who created the task */
    accountID: number;

    /** When the task was created */
    created: string;

    /** The description of the task that needs to be done */
    description: string;

    /** The person the task was assigned to */
    managerID: number;

    /** The chat report that the task was created in */
    parentReportID: string;

    /** The ID of the report that the task is associated with */
    reportID: string;

    /** The title of the task */
    reportName: string;

    /** The state of the task */
    stateNum: ValueOf<typeof CONST.REPORT.STATE_NUM>;

    /** The status of the task */
    statusNum: ValueOf<typeof CONST.REPORT.STATUS_NUM>;
};

/** Model of member grouped search result */
type SearchMemberGroup = {
    /** Account ID */
    accountID: number;

    /** Number of transactions */
    count: number;

    /** Total value of transactions */
    total: number;

    /** Currency of total value */
    currency: string;
};

/** Model of card grouped search result */
type SearchCardGroup = {
    /** Cardholder account ID */
    accountID: number;

    /** Number of transactions */
    count: number;

    /** Total value of transactions */
    total: number;

    /** Currency of total value */
    currency: string;

    /** Bank name */
    bank: string;

    /** Card name */
    cardName: string;

    /** Card ID */
    cardID: number;

    /** Last four Primary Account Number digits */
    lastFourPAN: string;
};

/** Model of withdrawal ID grouped search result */
type SearchWithdrawalIDGroup = {
    /** Withdrawal ID */
    entryID: number;

    /** Number of transactions */
    count: number;

    /** Total value of transactions */
    total: number;

    /** Currency of total value */
    currency: string;

    /** Masked account number */
    accountNumber: string;

    /** Bank name */
    bankName: BankName;

    /** When the withdrawal completed */
    debitPosted: string;
};

/**
 * A utility type that creates a record where all keys are strings that start with a specified prefix.
 */
type PrefixedRecord<Prefix extends string, ValueType> = Record<`${Prefix}${string}`, ValueType>;

/** Model of search results */
type SearchResults = {
    /** Current search results state */
    search: SearchResultsInfo;

    /** Search results data */
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    data: PrefixedRecord<typeof ONYXKEYS.COLLECTION.TRANSACTION, SearchTransaction> &
        Record<typeof ONYXKEYS.PERSONAL_DETAILS_LIST, Record<string, PersonalDetails>> &
        PrefixedRecord<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS, Record<string, ReportAction>> &
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        PrefixedRecord<typeof ONYXKEYS.COLLECTION.REPORT, SearchReport> &
        PrefixedRecord<typeof ONYXKEYS.COLLECTION.POLICY, Policy> &
        PrefixedRecord<typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, TransactionViolation[]> &
        PrefixedRecord<typeof ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, ReportNameValuePairs> &
        PrefixedRecord<typeof CONST.SEARCH.GROUP_PREFIX, SearchMemberGroup | SearchCardGroup | SearchWithdrawalIDGroup>;

    /** Whether search data is being fetched from server */
    isLoading?: boolean;

    /** Whether search data fetch has failed */
    errors?: OnyxCommon.Errors;
};

export default SearchResults;

export type {
    ListItemType,
    ListItemDataType,
    SearchTask,
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    SearchTransaction,
    SearchTransactionAction,
    SearchDataTypes,
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    SearchReport,
    SearchResultsInfo,
    SearchMemberGroup,
    SearchCardGroup,
    SearchWithdrawalIDGroup,
};
