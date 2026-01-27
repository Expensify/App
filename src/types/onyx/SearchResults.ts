import type {ValueOf} from 'type-fest';
import type {SearchStatus} from '@components/Search/types';
import type ChatListItem from '@components/SelectionListWithSections/ChatListItem';
import type TransactionGroupListItem from '@components/SelectionListWithSections/Search/TransactionGroupListItem';
import type TransactionListItem from '@components/SelectionListWithSections/Search/TransactionListItem';
import type {ReportActionListItemType, TaskListItemType, TransactionGroupListItemType, TransactionListItemType} from '@components/SelectionListWithSections/types';
import type CONST from '@src/CONST';
import type ONYXKEYS from '@src/ONYXKEYS';
import type PrefixedRecord from '@src/types/utils/PrefixedRecord';
import type {BankName} from './Bank';
import type * as OnyxCommon from './OnyxCommon';
import type PersonalDetails from './PersonalDetails';
import type Policy from './Policy';
import type Report from './Report';
import type ReportAction from './ReportAction';
import type ReportNameValuePairs from './ReportNameValuePairs';
import type Transaction from './Transaction';
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

    /** Settlement state (5/6/7=failed, 8=cleared, others=pending) */
    state: number;
};

/** Model of category grouped search result */
type SearchCategoryGroup = {
    /** Category name */
    category: string;

    /** Number of transactions */
    count: number;

    /** Total value of transactions */
    total: number;

    /** Currency of total value */
    currency: string;
};

/** Model of month grouped search result */
type SearchMonthGroup = {
    /** Year */
    year: number;

    /** Month (1-12) */
    month: number;

    /** Number of transactions */
    count: number;

    /** Total value of transactions */
    total: number;

    /** Currency of total value */
    currency: string;
};

/** Model of search results */
type SearchResults = {
    /** Current search results state */
    search: SearchResultsInfo;

    /** Search results data */
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    data: PrefixedRecord<typeof ONYXKEYS.COLLECTION.TRANSACTION, Transaction> &
        Record<typeof ONYXKEYS.PERSONAL_DETAILS_LIST, Record<string, PersonalDetails> | undefined> &
        PrefixedRecord<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS, Record<string, ReportAction>> &
        PrefixedRecord<typeof ONYXKEYS.COLLECTION.REPORT, Report> &
        PrefixedRecord<typeof ONYXKEYS.COLLECTION.POLICY, Policy> &
        PrefixedRecord<typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, TransactionViolation[]> &
        PrefixedRecord<typeof ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, ReportNameValuePairs> &
        PrefixedRecord<typeof CONST.SEARCH.GROUP_PREFIX, SearchMemberGroup | SearchCardGroup | SearchWithdrawalIDGroup | SearchCategoryGroup | SearchMonthGroup>;

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
   
    SearchTransactionAction,
   
    SearchDataTypes,
   
    SearchResultsInfo,
   
    SearchMemberGroup,
   
    SearchCardGroup,
   
    SearchWithdrawalIDGroup,
    
    SearchCategoryGroup,

    SearchMonthGroup,
};
