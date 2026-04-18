/* eslint-disable max-lines */
// TODO: Remove this disable once SearchUIUtils is refactored (see dedicated refactor issue)
import {addDays, endOfMonth, format, parse, startOfMonth, startOfYear, subDays, subMonths} from 'date-fns';
import type {TextStyle, ViewStyle} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {CurrencyListActionsContextType} from '@components/CurrencyListContextProvider';
import type {ExpensifyIconName} from '@components/Icon/ExpensifyIconLoader';
import type {LocaleContextProps, LocalizedTranslate} from '@components/LocaleContextProvider';
import type {MenuItemWithLink} from '@components/MenuItemList';
import type {MultiSelectItem} from '@components/Search/FilterDropdowns/MultiSelectPopup';
import type {SingleSelectItem} from '@components/Search/FilterDropdowns/SingleSelectPopup';
import ChatListItem from '@components/Search/SearchList/ListItem/ChatListItem';
import ExpenseReportListItem from '@components/Search/SearchList/ListItem/ExpenseReportListItem';
import TaskListItem from '@components/Search/SearchList/ListItem/TaskListItem';
import TransactionGroupListItem from '@components/Search/SearchList/ListItem/TransactionGroupListItem';
import TransactionListItem from '@components/Search/SearchList/ListItem/TransactionListItem';
import type {
    ExpenseReportListItemType,
    ReportActionListItemType,
    SearchListItem,
    TaskListItemType,
    TransactionCardGroupListItemType,
    TransactionCategoryGroupListItemType,
    TransactionGroupListItemType,
    TransactionListItemType,
    TransactionMemberGroupListItemType,
    TransactionMerchantGroupListItemType,
    TransactionMonthGroupListItemType,
    TransactionQuarterGroupListItemType,
    TransactionReportGroupListItemType,
    TransactionTagGroupListItemType,
    TransactionWeekGroupListItemType,
    TransactionWithdrawalIDGroupListItemType,
    TransactionYearGroupListItemType,
} from '@components/Search/SearchList/ListItem/types';
import type {
    GroupedItem,
    QueryFilters,
    SearchAction,
    SearchAmountFilterKeys,
    SearchColumnType,
    SearchCustomColumnIds,
    SearchDateFilterKeys,
    SearchDatePreset,
    SearchFilterKey,
    SearchGroupBy,
    SearchQueryJSON,
    SearchStatus,
    SearchView,
    SearchWithdrawalType,
    SelectedReports,
    SelectedTransactionInfo,
    SelectedTransactions,
    SingularSearchStatus,
    SortOrder,
} from '@components/Search/types';
import type {ListItem} from '@components/SelectionList/types';
import type {FeedKeysWithAssignedCards} from '@hooks/useFeedKeysWithAssignedCards';
import type {ThemeColors} from '@styles/theme/types';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import FILTER_KEYS from '@src/types/form/SearchAdvancedFiltersForm';
import type {HasFilterValues, SearchAdvancedFiltersKey} from '@src/types/form/SearchAdvancedFiltersForm';
import type * as OnyxTypes from '@src/types/onyx';
import type {ConnectionName} from '@src/types/onyx/Policy';
import type {SaveSearchItem} from '@src/types/onyx/SaveSearch';
import type SearchResults from '@src/types/onyx/SearchResults';
import type {
    ListItemDataType,
    ListItemType,
    SearchCardGroup,
    SearchCategoryGroup,
    SearchDataTypes,
    SearchMemberGroup,
    SearchMerchantGroup,
    SearchMonthGroup,
    SearchQuarterGroup,
    SearchTagGroup,
    SearchTask,
    SearchTransactionAction,
    SearchWeekGroup,
    SearchWithdrawalIDGroup,
    SearchYearGroup,
} from '@src/types/onyx/SearchResults';
import type IconAsset from '@src/types/utils/IconAsset';
import arraysEqual from '@src/utils/arraysEqual';
import {hasSynchronizationErrorMessage} from './actions/connections';
import {startMoneyRequest} from './actions/IOU';
import {canApproveIOU, canIOUBePaid, canSubmitReport} from './actions/IOU/ReportWorkflow';
import {setIsOpenConfirmNavigateExpensifyClassicModalOpen} from './actions/isOpenConfirmNavigateExpensifyClassicModal';
import {createTransactionThreadReport} from './actions/Report';
import type {TransactionPreviewData} from './actions/Search';
import {setOptimisticDataForTransactionThreadPreview} from './actions/Search';
import type {CardFeedForDisplay} from './CardFeedUtils';
import {getCardFeedsForDisplay} from './CardFeedUtils';
import {getCardDescriptionForSearchTable, getFeedNameForDisplay} from './CardUtils';
import {getDecodedCategoryName} from './CategoryUtils';
import {convertToDisplayString, convertToDisplayStringWithoutCurrency} from './CurrencyUtils';
import DateUtils from './DateUtils';
import interceptAnonymousUser from './interceptAnonymousUser';
import isSearchTopmostFullScreenRoute from './Navigation/helpers/isSearchTopmostFullScreenRoute';
import Navigation from './Navigation/Navigation';
import Parser from './Parser';
import {getDisplayNameOrDefault} from './PersonalDetailsUtils';
import {
    arePaymentsEnabled,
    canSendInvoice,
    getCleanedTagName,
    getCommaSeparatedTagNameWithSanitizedColons,
    getSubmitToAccountID,
    isPaidGroupPolicy,
    isPolicyAdmin,
    isPolicyApprover,
    isPolicyPayer,
} from './PolicyUtils';
import {
    getIOUActionForReportID,
    getOriginalMessage,
    isCreatedAction,
    isDeletedAction,
    isHoldAction,
    isMoneyRequestAction,
    isReportActionVisible,
    isResolvedActionableWhisper,
    isWhisperActionTargetedToOthers,
} from './ReportActionsUtils';
import {isExportAction} from './ReportPrimaryActionUtils';
import {
    canDeleteMoneyRequestReport,
    canUserPerformWriteAction,
    findSelfDMReportID,
    generateReportID,
    getIcons,
    getMoneyRequestSpendBreakdown,
    getPersonalDetailsForAccountID,
    getPolicyName,
    getReportName,
    getReportOrDraftReport,
    getReportStatusTranslation,
    getSearchReportName,
    hasHeldExpenses,
    hasInvoiceReports,
    isAllowedToApproveExpenseReport as isAllowedToApproveExpenseReportUtils,
    isArchivedReport,
    isClosedReport,
    isExpenseReport as isExpenseReportUtil,
    isInvoiceReport,
    isIOUReport as isIOUReportReportUtil,
    isMoneyRequestReport,
    isMoneyRequestReportPendingDeletion,
    isOneTransactionReport,
    isOpenExpenseReport,
    isOpenReport,
    isProcessingReport,
    isSettled,
    shouldReportShowSubscript,
} from './ReportUtils';
import {
    buildCannedSearchQuery,
    buildQueryStringFromFilterFormValues,
    buildSearchQueryJSON,
    buildSearchQueryString,
    getCurrentSearchQueryJSON,
    getDateRangeDisplayValueFromFormValue,
    isAmountFilterKey,
    isFilterSupported,
    isSearchDatePreset,
    sortOptionsWithEmptyValue,
} from './SearchQueryUtils';
import StringUtils from './StringUtils';
import {getIOUPayerAndReceiver} from './TransactionPreviewUtils';
import {
    getAmount,
    getAttendees,
    getCategory,
    getDescription,
    getExchangeRate,
    getExpenseTypeTranslationKey,
    getOriginalAmountForDisplay,
    getTag,
    getTaxAmount,
    getTaxName,
    getAmount as getTransactionAmount,
    getCreated as getTransactionCreatedDate,
    getMerchant as getTransactionMerchant,
    isDeletedTransaction,
    isPending,
    isScanning,
    isViolationDismissed,
    shouldShowAttendees as shouldShowAttendeesUtils,
    shouldShowViolation,
} from './TransactionUtils';
import {isInvalidMerchantValue} from './ValidationUtils';

type ColumnSortMapping<T> = Partial<Record<SearchColumnType, keyof T | null>>;
type ColumnVisibility = Partial<Record<SearchColumnType, boolean>>;
type GroupBySection = {
    sectionIndex: number;
    options: Array<SingleSelectItem<SearchGroupBy>>;
};

// List Item sorting
type TransactionSorting = ColumnSortMapping<TransactionListItemType>;
type TaskSorting = ColumnSortMapping<TaskListItemType>;
type ExpenseReportSorting = ColumnSortMapping<ExpenseReportListItemType>;

// Transaction Group sorting
type TransactionMemberGroupSorting = ColumnSortMapping<TransactionMemberGroupListItemType>;
type TransactionCardGroupSorting = ColumnSortMapping<TransactionCardGroupListItemType>;
type TransactionWithdrawalIDGroupSorting = ColumnSortMapping<TransactionWithdrawalIDGroupListItemType>;
type TransactionCategoryGroupSorting = ColumnSortMapping<TransactionCategoryGroupListItemType>;
type TransactionMerchantGroupSorting = ColumnSortMapping<TransactionMerchantGroupListItemType>;
type TransactionTagGroupSorting = ColumnSortMapping<TransactionTagGroupListItemType>;
type TransactionMonthGroupSorting = ColumnSortMapping<TransactionMonthGroupListItemType>;
type TransactionWeekGroupSorting = ColumnSortMapping<TransactionWeekGroupListItemType>;
type TransactionYearGroupSorting = ColumnSortMapping<TransactionYearGroupListItemType>;
type TransactionQuarterGroupSorting = ColumnSortMapping<TransactionQuarterGroupListItemType>;

type GetReportSectionsParams = {
    data: OnyxTypes.SearchResults['data'];
    policies: OnyxCollection<OnyxTypes.Policy>;
    currentSearch: SearchKey;
    currentAccountID: number;
    currentUserEmail: string;
    translate: LocalizedTranslate;
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'];
    isActionLoadingSet: ReadonlySet<string> | undefined;
    isOffline: boolean | undefined;
    allTransactionViolations: OnyxCollection<OnyxTypes.TransactionViolation[]>;
    bankAccountList: OnyxEntry<OnyxTypes.BankAccountList>;
    reportActions?: Record<string, OnyxTypes.ReportAction[]>;
    allReportMetadata: OnyxCollection<OnyxTypes.ReportMetadata>;
    queryJSON?: SearchQueryJSON;
    onyxPersonalDetailsList?: OnyxTypes.PersonalDetailsList;
};

type GetTransactionSectionsParams = {
    data: OnyxTypes.SearchResults['data'];
    currentSearch: SearchKey;
    currentAccountID: number;
    currentUserEmail: string;
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'];
    isActionLoadingSet: ReadonlySet<string> | undefined;
    bankAccountList: OnyxEntry<OnyxTypes.BankAccountList>;
    allReportMetadata: OnyxCollection<OnyxTypes.ReportMetadata>;
    reportActions?: Record<string, OnyxTypes.ReportAction[]>;
    queryJSON?: SearchQueryJSON;
    policyForMovingExpenses?: OnyxTypes.Policy;
};

const transactionColumnNamesToSortingProperty: TransactionSorting = {
    [CONST.SEARCH.TABLE_COLUMNS.TO]: 'formattedTo' as const,
    [CONST.SEARCH.TABLE_COLUMNS.FROM]: 'formattedFrom' as const,
    [CONST.SEARCH.TABLE_COLUMNS.DATE]: 'date' as const,
    [CONST.SEARCH.TABLE_COLUMNS.SUBMITTED]: 'submitted' as const,
    [CONST.SEARCH.TABLE_COLUMNS.APPROVED]: 'approved' as const,
    [CONST.SEARCH.TABLE_COLUMNS.POSTED]: 'posted' as const,
    [CONST.SEARCH.TABLE_COLUMNS.EXPORTED]: 'exported' as const,
    [CONST.SEARCH.TABLE_COLUMNS.TAG]: 'tag' as const,
    [CONST.SEARCH.TABLE_COLUMNS.MERCHANT]: 'formattedMerchant' as const,
    [CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT]: 'formattedTotal' as const,
    [CONST.SEARCH.TABLE_COLUMNS.CATEGORY]: 'category' as const,
    [CONST.SEARCH.TABLE_COLUMNS.ORIGINAL_AMOUNT]: 'originalAmount' as const,
    [CONST.SEARCH.TABLE_COLUMNS.REIMBURSABLE]: 'reimbursable' as const,
    [CONST.SEARCH.TABLE_COLUMNS.BILLABLE]: 'billable' as const,
    [CONST.SEARCH.TABLE_COLUMNS.TYPE]: null,
    [CONST.SEARCH.TABLE_COLUMNS.ACTION]: 'action' as const,
    [CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION]: 'comment' as const,
    [CONST.SEARCH.TABLE_COLUMNS.TAX_AMOUNT]: 'taxAmount' as const,
    [CONST.SEARCH.TABLE_COLUMNS.RECEIPT]: null,
};

const taskColumnNamesToSortingProperty: TaskSorting = {
    [CONST.SEARCH.TABLE_COLUMNS.DATE]: 'created' as const,
    [CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION]: 'description' as const,
    [CONST.SEARCH.TABLE_COLUMNS.TITLE]: 'reportName' as const,
    [CONST.SEARCH.TABLE_COLUMNS.FROM]: 'formattedCreatedBy' as const,
    [CONST.SEARCH.TABLE_COLUMNS.ASSIGNEE]: 'formattedAssignee' as const,
    [CONST.SEARCH.TABLE_COLUMNS.IN]: 'parentReportID' as const,
};

const expenseReportColumnNamesToSortingProperty: ExpenseReportSorting = {
    [CONST.SEARCH.TABLE_COLUMNS.AVATAR]: null,
    [CONST.SEARCH.TABLE_COLUMNS.DATE]: 'created' as const,
    [CONST.SEARCH.TABLE_COLUMNS.SUBMITTED]: 'submitted' as const,
    [CONST.SEARCH.TABLE_COLUMNS.APPROVED]: 'approved' as const,
    [CONST.SEARCH.TABLE_COLUMNS.EXPORTED]: 'exported' as const,
    [CONST.SEARCH.TABLE_COLUMNS.STATUS]: 'formattedStatus' as const,
    [CONST.SEARCH.TABLE_COLUMNS.TITLE]: 'reportName' as const,
    [CONST.SEARCH.TABLE_COLUMNS.FROM]: 'formattedFrom' as const,
    [CONST.SEARCH.TABLE_COLUMNS.TO]: 'formattedTo' as const,
    [CONST.SEARCH.TABLE_COLUMNS.TOTAL]: 'total' as const,
    [CONST.SEARCH.TABLE_COLUMNS.ACTION]: 'action' as const,
};

// Base sorting properties common to all transaction group types
const transactionGroupBaseSortingProperties = {
    [CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES]: 'count' as const,
    [CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL]: 'total' as const,
};

const transactionMemberGroupColumnNamesToSortingProperty: TransactionMemberGroupSorting = {
    [CONST.SEARCH.TABLE_COLUMNS.AVATAR]: null,
    [CONST.SEARCH.TABLE_COLUMNS.GROUP_FROM]: 'formattedFrom' as const,
    [CONST.SEARCH.TABLE_COLUMNS.FROM]: 'formattedFrom' as const,
    ...transactionGroupBaseSortingProperties,
};

const transactionCardGroupColumnNamesToSortingProperty: TransactionCardGroupSorting = {
    [CONST.SEARCH.TABLE_COLUMNS.AVATAR]: null,
    [CONST.SEARCH.TABLE_COLUMNS.GROUP_CARD]: 'formattedCardName' as const,
    [CONST.SEARCH.TABLE_COLUMNS.CARD]: 'formattedCardName' as const,
    [CONST.SEARCH.TABLE_COLUMNS.GROUP_FEED]: 'formattedFeedName' as const,
    ...transactionGroupBaseSortingProperties,
};

const transactionWithdrawalIDGroupColumnNamesToSortingProperty: TransactionWithdrawalIDGroupSorting = {
    [CONST.SEARCH.TABLE_COLUMNS.AVATAR]: null,
    [CONST.SEARCH.TABLE_COLUMNS.GROUP_BANK_ACCOUNT]: 'bankName' as const,
    [CONST.SEARCH.TABLE_COLUMNS.GROUP_WITHDRAWN]: 'debitPosted' as const,
    [CONST.SEARCH.TABLE_COLUMNS.WITHDRAWN]: 'debitPosted' as const,
    [CONST.SEARCH.TABLE_COLUMNS.GROUP_WITHDRAWAL_STATUS]: 'state' as const,
    [CONST.SEARCH.TABLE_COLUMNS.GROUP_WITHDRAWAL_ID]: 'formattedWithdrawalID' as const,
    ...transactionGroupBaseSortingProperties,
};

const transactionCategoryGroupColumnNamesToSortingProperty: TransactionCategoryGroupSorting = {
    [CONST.SEARCH.TABLE_COLUMNS.GROUP_CATEGORY]: 'formattedCategory' as const,
    [CONST.SEARCH.TABLE_COLUMNS.CATEGORY]: 'formattedCategory' as const,
    ...transactionGroupBaseSortingProperties,
};

const transactionTagGroupColumnNamesToSortingProperty: TransactionTagGroupSorting = {
    [CONST.SEARCH.TABLE_COLUMNS.GROUP_TAG]: 'formattedTag' as const,
    [CONST.SEARCH.TABLE_COLUMNS.TAG]: 'formattedTag' as const,
    ...transactionGroupBaseSortingProperties,
};

const transactionMerchantGroupColumnNamesToSortingProperty: TransactionMerchantGroupSorting = {
    [CONST.SEARCH.TABLE_COLUMNS.GROUP_MERCHANT]: 'formattedMerchant' as const,
    [CONST.SEARCH.TABLE_COLUMNS.MERCHANT]: 'formattedMerchant' as const,
    ...transactionGroupBaseSortingProperties,
};

const transactionMonthGroupColumnNamesToSortingProperty: TransactionMonthGroupSorting = {
    [CONST.SEARCH.TABLE_COLUMNS.GROUP_MONTH]: 'sortKey' as const,
    ...transactionGroupBaseSortingProperties,
};

const transactionWeekGroupColumnNamesToSortingProperty: TransactionWeekGroupSorting = {
    [CONST.SEARCH.TABLE_COLUMNS.GROUP_WEEK]: 'week' as const,
    ...transactionGroupBaseSortingProperties,
};

const transactionYearGroupColumnNamesToSortingProperty: TransactionYearGroupSorting = {
    [CONST.SEARCH.TABLE_COLUMNS.GROUP_YEAR]: 'sortKey' as const,
    ...transactionGroupBaseSortingProperties,
};

const transactionQuarterGroupColumnNamesToSortingProperty: TransactionQuarterGroupSorting = {
    [CONST.SEARCH.TABLE_COLUMNS.GROUP_QUARTER]: 'sortKey' as const,
    ...transactionGroupBaseSortingProperties,
};

type ExpenseStatusPredicate = (expenseReport?: OnyxTypes.Report, transactionReportID?: string) => boolean;

const expenseStatusActionMapping: Record<string, ExpenseStatusPredicate> = {
    [CONST.SEARCH.STATUS.EXPENSE.DRAFTS]: (expenseReport) => expenseReport?.stateNum === CONST.REPORT.STATE_NUM.OPEN && expenseReport.statusNum === CONST.REPORT.STATUS_NUM.OPEN,
    [CONST.SEARCH.STATUS.EXPENSE.OUTSTANDING]: (expenseReport) =>
        expenseReport?.stateNum === CONST.REPORT.STATE_NUM.SUBMITTED && expenseReport.statusNum === CONST.REPORT.STATUS_NUM.SUBMITTED,
    [CONST.SEARCH.STATUS.EXPENSE.APPROVED]: (expenseReport) => expenseReport?.stateNum === CONST.REPORT.STATE_NUM.APPROVED && expenseReport.statusNum === CONST.REPORT.STATUS_NUM.APPROVED,
    [CONST.SEARCH.STATUS.EXPENSE.PAID]: (expenseReport) =>
        (expenseReport?.stateNum ?? 0) >= CONST.REPORT.STATE_NUM.APPROVED && expenseReport?.statusNum === CONST.REPORT.STATUS_NUM.REIMBURSED,
    [CONST.SEARCH.STATUS.EXPENSE.DONE]: (expenseReport) => expenseReport?.stateNum === CONST.REPORT.STATE_NUM.APPROVED && expenseReport.statusNum === CONST.REPORT.STATUS_NUM.CLOSED,
    [CONST.SEARCH.STATUS.EXPENSE.UNREPORTED]: (expenseReport, transactionReportID) => !expenseReport && transactionReportID !== CONST.REPORT.TRASH_REPORT_ID,
    [CONST.SEARCH.STATUS.EXPENSE.DELETED]: (_expenseReport, transactionReportID) => transactionReportID === CONST.REPORT.TRASH_REPORT_ID,
    [CONST.SEARCH.STATUS.EXPENSE.ALL]: () => true,
};

const nonSortableColumns = new Set<SearchColumnType>([
    CONST.SEARCH.TABLE_COLUMNS.RECEIPT,
    CONST.SEARCH.TABLE_COLUMNS.TYPE,
    CONST.SEARCH.TABLE_COLUMNS.EXPORTED_TO,
    CONST.SEARCH.TABLE_COLUMNS.ACTION,
    CONST.SEARCH.TABLE_COLUMNS.IN,
    CONST.SEARCH.TABLE_COLUMNS.AVATAR,
]);

function isValidExpenseStatus(status: unknown): status is ValueOf<typeof CONST.SEARCH.STATUS.EXPENSE> {
    return typeof status === 'string' && status in expenseStatusActionMapping;
}

function formatBadgeText(count: number): string {
    if (count === 0) {
        return '';
    }
    return count > CONST.SEARCH.TODO_BADGE_MAX_COUNT ? `${CONST.SEARCH.TODO_BADGE_MAX_COUNT}+` : count.toString();
}

function getItemBadgeText(itemKey: string, reportCounts: Record<string, number>): string | undefined {
    if (itemKey in reportCounts) {
        return formatBadgeText(reportCounts[itemKey]);
    }
    return undefined;
}

function getExpenseStatusOptions(translate: LocalizedTranslate): Array<MultiSelectItem<SingularSearchStatus>> {
    return [
        {text: translate('common.unreported'), value: CONST.SEARCH.STATUS.EXPENSE.UNREPORTED},
        {text: translate('common.draft'), value: CONST.SEARCH.STATUS.EXPENSE.DRAFTS},
        {text: translate('common.outstanding'), value: CONST.SEARCH.STATUS.EXPENSE.OUTSTANDING},
        {text: translate('iou.approved'), value: CONST.SEARCH.STATUS.EXPENSE.APPROVED},
        {text: translate('iou.settledExpensify'), value: CONST.SEARCH.STATUS.EXPENSE.PAID},
        {text: translate('iou.done'), value: CONST.SEARCH.STATUS.EXPENSE.DONE},
        {text: translate('iou.deleted'), value: CONST.SEARCH.STATUS.EXPENSE.DELETED},
    ];
}

function getExpenseReportedStatusOptions(translate: LocalizedTranslate): Array<MultiSelectItem<SingularSearchStatus>> {
    return [
        {text: translate('common.draft'), value: CONST.SEARCH.STATUS.EXPENSE.DRAFTS},
        {text: translate('common.outstanding'), value: CONST.SEARCH.STATUS.EXPENSE.OUTSTANDING},
        {text: translate('iou.approved'), value: CONST.SEARCH.STATUS.EXPENSE.APPROVED},
        {text: translate('iou.settledExpensify'), value: CONST.SEARCH.STATUS.EXPENSE.PAID},
        {text: translate('iou.done'), value: CONST.SEARCH.STATUS.EXPENSE.DONE},
    ];
}

function getInvoiceStatusOptions(translate: LocalizedTranslate): Array<MultiSelectItem<SingularSearchStatus>> {
    return [
        {text: translate('common.outstanding'), value: CONST.SEARCH.STATUS.INVOICE.OUTSTANDING},
        {text: translate('iou.settledExpensify'), value: CONST.SEARCH.STATUS.INVOICE.PAID},
    ];
}

function getTripStatusOptions(translate: LocalizedTranslate): Array<MultiSelectItem<SingularSearchStatus>> {
    return [
        {text: translate('search.filters.current'), value: CONST.SEARCH.STATUS.TRIP.CURRENT},
        {text: translate('search.filters.past'), value: CONST.SEARCH.STATUS.TRIP.PAST},
    ];
}

function getTaskStatusOptions(translate: LocalizedTranslate): Array<MultiSelectItem<SingularSearchStatus>> {
    return [
        {text: translate('common.outstanding'), value: CONST.SEARCH.STATUS.TASK.OUTSTANDING},
        {text: translate('search.filters.completed'), value: CONST.SEARCH.STATUS.TASK.COMPLETED},
    ];
}

const emptyPersonalDetails = {
    accountID: CONST.REPORT.OWNER_ACCOUNT_ID_FAKE,
    avatar: '',
    displayName: undefined,
    login: undefined,
};

type ReportKey = `${typeof ONYXKEYS.COLLECTION.REPORT}${string}`;

type TransactionKey = `${typeof ONYXKEYS.COLLECTION.TRANSACTION}${string}`;

type ReportActionKey = `${typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS}${string}`;

type ViolationKey = `${typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${string}`;

type SearchGroupKey = `${typeof CONST.SEARCH.GROUP_PREFIX}${string}`;

type SearchKey = ValueOf<typeof CONST.SEARCH.SEARCH_KEYS>;

type SavedSearchMenuItem = MenuItemWithLink & {
    key: string;
    hash: string;
    query: string;
    styles?: Array<ViewStyle | TextStyle>;
};

type SearchTypeMenuSection = {
    translationPath: TranslationPaths;
    menuItems: SearchTypeMenuItem[];
};

type SearchTypeMenuItem = {
    key: SearchKey;
    translationPath: TranslationPaths;
    type: SearchDataTypes;
    icon: Extract<
        ExpensifyIconName,
        | 'Receipt'
        | 'ChatBubbles'
        | 'MoneyBag'
        | 'CreditCard'
        | 'MoneyHourglass'
        | 'CreditCardHourglass'
        | 'Bank'
        | 'User'
        | 'Folder'
        | 'Basket'
        | 'CalendarSolid'
        | 'ExpensifyCard'
        | 'Document'
        | 'Send'
        | 'ThumbsUp'
        | 'CheckCircle'
    >;
    searchQuery: string;
    searchQueryJSON: SearchQueryJSON | undefined;
    hash: number;
    similarSearchHash: number;
    recentSearchHash: number;
    badgeText?: string;
    emptyState?: {
        title: TranslationPaths;
        subtitle: TranslationPaths;
        buttons?: Array<{
            buttonText: TranslationPaths;
            buttonAction: () => void;
            success?: boolean;
            icon?: IconAsset;
            isDisabled?: boolean;
        }>;
    };
};

type SearchDateModifier = ValueOf<typeof CONST.SEARCH.DATE_MODIFIERS>;

type SearchDateModifierLower = Lowercase<SearchDateModifier>;

type ArchivedReportsIDSet = ReadonlySet<string>;

/** Return shape of `getSections`: row array, total row count, and whether any transaction is deleted (wide action column). */
type GetSectionsResult = [
    (
        | ReportActionListItemType[]
        | TaskListItemType[]
        | TransactionListItemType[]
        | TransactionGroupListItemType[]
        | TransactionMemberGroupListItemType[]
        | TransactionCardGroupListItemType[]
        | TransactionWithdrawalIDGroupListItemType[]
        | TransactionCategoryGroupListItemType[]
        | TransactionMerchantGroupListItemType[]
        | TransactionTagGroupListItemType[]
        | TransactionMonthGroupListItemType[]
        | TransactionWeekGroupListItemType[]
        | TransactionYearGroupListItemType[]
        | TransactionQuarterGroupListItemType[]
    ),
    number,
    boolean,
];

type GetSectionsParams = {
    type: SearchDataTypes;
    data: OnyxTypes.SearchResults['data'];
    policies?: OnyxCollection<OnyxTypes.Policy>;
    currentAccountID: number;
    currentUserEmail: string;
    translate: LocalizedTranslate;
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'];
    bankAccountList: OnyxEntry<OnyxTypes.BankAccountList>;
    groupBy?: SearchGroupBy;
    reportActions?: Record<string, OnyxTypes.ReportAction[]>;
    currentSearch?: SearchKey;
    archivedReportsIDList?: ArchivedReportsIDSet;
    queryJSON?: SearchQueryJSON;
    isActionLoadingSet?: ReadonlySet<string>;
    isOffline?: boolean;
    cardFeeds?: OnyxCollection<OnyxTypes.CardFeeds>;
    customCardNames?: Record<number, string>;
    allTransactionViolations?: OnyxCollection<OnyxTypes.TransactionViolation[]>;
    visibleReportActionsData?: OnyxTypes.VisibleReportActionsDerivedValue;
    allReportMetadata: OnyxCollection<OnyxTypes.ReportMetadata>;
    conciergeReportID: string | undefined;
    onyxPersonalDetailsList?: OnyxTypes.PersonalDetailsList;
    policyForMovingExpenses?: OnyxTypes.Policy;
};

/**
 * Search keys whose menu items stay selected even when the user manually
 * changes the sort order.  Every other search key requires the current
 * sortBy/sortOrder to match the menu item's defaults for it to be active.
 */
const GENERIC_SEARCH_KEYS: ReadonlySet<SearchKey> = new Set([CONST.SEARCH.SEARCH_KEYS.EXPENSES, CONST.SEARCH.SEARCH_KEYS.REPORTS, CONST.SEARCH.SEARCH_KEYS.CHATS]);

function doesSearchItemMatchSort(key: SearchKey, itemSortBy: string | undefined, itemSortOrder: string | undefined, currentSortBy: string | undefined, currentSortOrder: string | undefined) {
    return GENERIC_SEARCH_KEYS.has(key) || (itemSortBy === currentSortBy && itemSortOrder === currentSortOrder);
}

/**
 * Creates a top search menu item with common structure for TOP_SPENDERS, TOP_CATEGORIES, and TOP_MERCHANTS
 */
function createTopSearchMenuItem(
    key: SearchKey,
    translationPath: TranslationPaths,
    icon: Extract<
        ExpensifyIconName,
        'Receipt' | 'ChatBubbles' | 'MoneyBag' | 'CreditCard' | 'MoneyHourglass' | 'CreditCardHourglass' | 'Bank' | 'User' | 'Folder' | 'Basket' | 'ExpensifyCard'
    >,
    groupBy: ValueOf<typeof CONST.SEARCH.GROUP_BY>,
    limit?: number,
    view?: ValueOf<typeof CONST.SEARCH.VIEW>,
): SearchTypeMenuItem {
    const defaultSortBy = CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL;
    const defaultSortOrder = CONST.SEARCH.SORT_ORDER.DESC;

    const searchQuery = buildQueryStringFromFilterFormValues(
        {
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            groupBy,
            dateOn: CONST.SEARCH.DATE_PRESETS.LAST_MONTH,
            ...(view && {view}),
        },
        {
            sortBy: defaultSortBy,
            sortOrder: defaultSortOrder,
            ...(limit && {limit}),
        },
    );

    return {
        key,
        translationPath,
        type: CONST.SEARCH.DATA_TYPES.EXPENSE,
        icon,
        searchQuery,
        get searchQueryJSON() {
            return buildSearchQueryJSON(this.searchQuery);
        },
        get hash() {
            return this.searchQueryJSON?.hash ?? CONST.DEFAULT_NUMBER_ID;
        },
        get similarSearchHash() {
            return this.searchQueryJSON?.similarSearchHash ?? CONST.DEFAULT_NUMBER_ID;
        },
        get recentSearchHash() {
            return this.searchQueryJSON?.recentSearchHash ?? CONST.DEFAULT_NUMBER_ID;
        },
    };
}

/**
 * Returns a list of all possible searches in the LHN, along with their query & hash.
 * *NOTE* When rendering the LHN, you should use the "createTypeMenuSections" method, which
 * contains the conditionals for rendering each of these.
 *
 * Keep all suggested search declarations in this object.
 * If you are updating this function, do not add more params unless absolutely necessary for the searches. The amount of data needed to
 * get the list of searches should be as minimal as possible.
 *
 * These searches should be as static as possible, and should not contain conditionals, or any other logic.
 *
 * If you are trying to access data about a specific search, you do NOT need to subscribe to the data (such as feeds) if it does not
 * affect the specific query you are looking for
 */
function getSuggestedSearches(accountID: number = CONST.DEFAULT_NUMBER_ID, defaultFeedID?: string): Record<ValueOf<typeof CONST.SEARCH.SEARCH_KEYS>, SearchTypeMenuItem> {
    return {
        [CONST.SEARCH.SEARCH_KEYS.EXPENSES]: {
            key: CONST.SEARCH.SEARCH_KEYS.EXPENSES,
            translationPath: 'common.expenses',
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            icon: 'Receipt',
            searchQuery: buildCannedSearchQuery(),
            get searchQueryJSON() {
                return buildSearchQueryJSON(this.searchQuery);
            },
            get hash() {
                return this.searchQueryJSON?.hash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get similarSearchHash() {
                return this.searchQueryJSON?.similarSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get recentSearchHash() {
                return this.searchQueryJSON?.recentSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
        },
        [CONST.SEARCH.SEARCH_KEYS.REPORTS]: {
            key: CONST.SEARCH.SEARCH_KEYS.REPORTS,
            translationPath: 'common.reports',
            type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
            icon: 'Document',
            searchQuery: buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT}),
            get searchQueryJSON() {
                return buildSearchQueryJSON(this.searchQuery);
            },
            get hash() {
                return this.searchQueryJSON?.hash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get similarSearchHash() {
                return this.searchQueryJSON?.similarSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get recentSearchHash() {
                return this.searchQueryJSON?.recentSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
        },
        [CONST.SEARCH.SEARCH_KEYS.CHATS]: {
            key: CONST.SEARCH.SEARCH_KEYS.CHATS,
            translationPath: 'common.chats',
            type: CONST.SEARCH.DATA_TYPES.CHAT,
            icon: 'ChatBubbles',
            searchQuery: buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.CHAT}),
            get searchQueryJSON() {
                return buildSearchQueryJSON(this.searchQuery);
            },
            get hash() {
                return this.searchQueryJSON?.hash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get similarSearchHash() {
                return this.searchQueryJSON?.similarSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get recentSearchHash() {
                return this.searchQueryJSON?.recentSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
        },
        [CONST.SEARCH.SEARCH_KEYS.SUBMIT]: {
            key: CONST.SEARCH.SEARCH_KEYS.SUBMIT,
            translationPath: 'common.submit',
            type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
            icon: 'Send',
            searchQuery: buildQueryStringFromFilterFormValues({
                type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
                action: CONST.SEARCH.ACTION_FILTERS.SUBMIT,
                from: [`${accountID}`],
            }),
            get searchQueryJSON() {
                return buildSearchQueryJSON(this.searchQuery);
            },
            get hash() {
                return this.searchQueryJSON?.hash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get similarSearchHash() {
                return this.searchQueryJSON?.similarSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get recentSearchHash() {
                return this.searchQueryJSON?.recentSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
        },
        [CONST.SEARCH.SEARCH_KEYS.APPROVE]: {
            key: CONST.SEARCH.SEARCH_KEYS.APPROVE,
            translationPath: 'search.bulkActions.approve',
            type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
            icon: 'ThumbsUp',
            searchQuery: buildQueryStringFromFilterFormValues({
                type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
                action: CONST.SEARCH.ACTION_FILTERS.APPROVE,
                to: [`${accountID}`],
            }),
            get searchQueryJSON() {
                return buildSearchQueryJSON(this.searchQuery);
            },
            get hash() {
                return this.searchQueryJSON?.hash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get similarSearchHash() {
                return this.searchQueryJSON?.similarSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get recentSearchHash() {
                return this.searchQueryJSON?.recentSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
        },
        [CONST.SEARCH.SEARCH_KEYS.PAY]: {
            key: CONST.SEARCH.SEARCH_KEYS.PAY,
            translationPath: 'search.bulkActions.pay',
            type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
            icon: 'MoneyBag',
            searchQuery: buildQueryStringFromFilterFormValues({
                type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
                action: CONST.SEARCH.ACTION_FILTERS.PAY,
                reimbursable: CONST.SEARCH.BOOLEAN.YES,
                payer: accountID?.toString(),
            }),
            get searchQueryJSON() {
                return buildSearchQueryJSON(this.searchQuery);
            },
            get hash() {
                return this.searchQueryJSON?.hash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get similarSearchHash() {
                return this.searchQueryJSON?.similarSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get recentSearchHash() {
                return this.searchQueryJSON?.recentSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
        },
        [CONST.SEARCH.SEARCH_KEYS.EXPORT]: {
            key: CONST.SEARCH.SEARCH_KEYS.EXPORT,
            translationPath: 'common.export',
            type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
            icon: 'CheckCircle',
            searchQuery: buildQueryStringFromFilterFormValues({
                type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
                action: CONST.SEARCH.ACTION_FILTERS.EXPORT,
                exporter: [`${accountID}`],
                exportedOn: CONST.SEARCH.DATE_PRESETS.NEVER,
            }),
            get searchQueryJSON() {
                return buildSearchQueryJSON(this.searchQuery);
            },
            get hash() {
                return this.searchQueryJSON?.hash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get similarSearchHash() {
                return this.searchQueryJSON?.similarSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get recentSearchHash() {
                return this.searchQueryJSON?.recentSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
        },
        [CONST.SEARCH.SEARCH_KEYS.STATEMENTS]: {
            key: CONST.SEARCH.SEARCH_KEYS.STATEMENTS,
            translationPath: 'search.cardStatements',
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            icon: 'CreditCard',
            searchQuery: buildQueryStringFromFilterFormValues({
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                feed: defaultFeedID ? [defaultFeedID] : [''],
                groupBy: CONST.SEARCH.GROUP_BY.CARD,
                postedOn: CONST.SEARCH.DATE_PRESETS.LAST_STATEMENT,
            }),
            get searchQueryJSON() {
                return buildSearchQueryJSON(this.searchQuery);
            },
            get hash() {
                return this.searchQueryJSON?.hash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get similarSearchHash() {
                return this.searchQueryJSON?.similarSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get recentSearchHash() {
                return this.searchQueryJSON?.recentSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
        },
        [CONST.SEARCH.SEARCH_KEYS.UNAPPROVED_CASH]: {
            key: CONST.SEARCH.SEARCH_KEYS.UNAPPROVED_CASH,
            translationPath: 'search.unapprovedCash',
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            icon: 'MoneyHourglass',
            searchQuery: buildQueryStringFromFilterFormValues({
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                status: [CONST.SEARCH.STATUS.EXPENSE.DRAFTS, CONST.SEARCH.STATUS.EXPENSE.OUTSTANDING],
                groupBy: CONST.SEARCH.GROUP_BY.FROM,
                reimbursable: CONST.SEARCH.BOOLEAN.YES,
            }),
            get searchQueryJSON() {
                return buildSearchQueryJSON(this.searchQuery);
            },
            get hash() {
                return this.searchQueryJSON?.hash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get similarSearchHash() {
                return this.searchQueryJSON?.similarSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get recentSearchHash() {
                return this.searchQueryJSON?.recentSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
        },
        [CONST.SEARCH.SEARCH_KEYS.UNAPPROVED_CARD]: {
            key: CONST.SEARCH.SEARCH_KEYS.UNAPPROVED_CARD,
            translationPath: 'search.unapprovedCard',
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            icon: 'CreditCardHourglass',
            searchQuery: buildQueryStringFromFilterFormValues({
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                feed: defaultFeedID ? [defaultFeedID] : [''],
                groupBy: CONST.SEARCH.GROUP_BY.CARD,
                status: [CONST.SEARCH.STATUS.EXPENSE.UNREPORTED, CONST.SEARCH.STATUS.EXPENSE.DRAFTS, CONST.SEARCH.STATUS.EXPENSE.OUTSTANDING],
            }),
            get searchQueryJSON() {
                return buildSearchQueryJSON(this.searchQuery);
            },
            get hash() {
                return this.searchQueryJSON?.hash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get similarSearchHash() {
                return this.searchQueryJSON?.similarSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get recentSearchHash() {
                return this.searchQueryJSON?.recentSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
        },
        [CONST.SEARCH.SEARCH_KEYS.EXPENSIFY_CARD]: {
            key: CONST.SEARCH.SEARCH_KEYS.EXPENSIFY_CARD,
            translationPath: 'workspace.common.expensifyCard',
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            icon: 'ExpensifyCard',
            searchQuery: buildQueryStringFromFilterFormValues(
                {
                    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                    withdrawalType: CONST.SEARCH.WITHDRAWAL_TYPE.EXPENSIFY_CARD,
                    withdrawnOn: CONST.SEARCH.DATE_PRESETS.LAST_MONTH,
                    groupBy: CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID,
                    view: CONST.SEARCH.VIEW.TABLE,
                },
                {
                    sortBy: CONST.SEARCH.TABLE_COLUMNS.GROUP_WITHDRAWN,
                    sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
                },
            ),
            get searchQueryJSON() {
                return buildSearchQueryJSON(this.searchQuery);
            },
            get hash() {
                return this.searchQueryJSON?.hash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get similarSearchHash() {
                return this.searchQueryJSON?.similarSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get recentSearchHash() {
                return this.searchQueryJSON?.recentSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
        },
        [CONST.SEARCH.SEARCH_KEYS.RECONCILIATION]: {
            key: CONST.SEARCH.SEARCH_KEYS.RECONCILIATION,
            translationPath: 'workspace.common.reimburse',
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            icon: 'Bank',
            searchQuery: buildQueryStringFromFilterFormValues(
                {
                    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                    withdrawalType: CONST.SEARCH.WITHDRAWAL_TYPE.REIMBURSEMENT,
                    withdrawnOn: CONST.SEARCH.DATE_PRESETS.LAST_MONTH,
                    groupBy: CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID,
                    view: CONST.SEARCH.VIEW.TABLE,
                },
                {
                    sortBy: CONST.SEARCH.TABLE_COLUMNS.GROUP_WITHDRAWN,
                    sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
                },
            ),
            get searchQueryJSON() {
                return buildSearchQueryJSON(this.searchQuery);
            },
            get hash() {
                return this.searchQueryJSON?.hash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get similarSearchHash() {
                return this.searchQueryJSON?.similarSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get recentSearchHash() {
                return this.searchQueryJSON?.recentSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
        },
        [CONST.SEARCH.SEARCH_KEYS.TOP_SPENDERS]: {
            key: CONST.SEARCH.SEARCH_KEYS.TOP_SPENDERS,
            translationPath: 'search.topSpenders',
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            icon: 'User',
            searchQuery: buildQueryStringFromFilterFormValues(
                {
                    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                    groupBy: CONST.SEARCH.GROUP_BY.FROM,
                    dateOn: CONST.SEARCH.DATE_PRESETS.LAST_MONTH,
                    status: [
                        CONST.SEARCH.STATUS.EXPENSE.DRAFTS,
                        CONST.SEARCH.STATUS.EXPENSE.OUTSTANDING,
                        CONST.SEARCH.STATUS.EXPENSE.APPROVED,
                        CONST.SEARCH.STATUS.EXPENSE.DONE,
                        CONST.SEARCH.STATUS.EXPENSE.PAID,
                    ],
                },
                {
                    sortBy: CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL,
                    sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
                },
            ),
            get searchQueryJSON() {
                return buildSearchQueryJSON(this.searchQuery);
            },
            get hash() {
                return this.searchQueryJSON?.hash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get similarSearchHash() {
                return this.searchQueryJSON?.similarSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get recentSearchHash() {
                return this.searchQueryJSON?.recentSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
        },
        [CONST.SEARCH.SEARCH_KEYS.TOP_CATEGORIES]: createTopSearchMenuItem(
            CONST.SEARCH.SEARCH_KEYS.TOP_CATEGORIES,
            'search.topCategories',
            'Folder',
            CONST.SEARCH.GROUP_BY.CATEGORY,
            CONST.SEARCH.TOP_SEARCH_LIMIT,
            CONST.SEARCH.VIEW.BAR,
        ),
        [CONST.SEARCH.SEARCH_KEYS.TOP_MERCHANTS]: createTopSearchMenuItem(
            CONST.SEARCH.SEARCH_KEYS.TOP_MERCHANTS,
            'search.topMerchants',
            'Basket',
            CONST.SEARCH.GROUP_BY.MERCHANT,
            CONST.SEARCH.TOP_SEARCH_LIMIT,
            CONST.SEARCH.VIEW.PIE,
        ),
        [CONST.SEARCH.SEARCH_KEYS.SPEND_OVER_TIME]: {
            key: CONST.SEARCH.SEARCH_KEYS.SPEND_OVER_TIME,
            translationPath: 'search.spendOverTime',
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            icon: 'CalendarSolid',
            searchQuery: buildQueryStringFromFilterFormValues(
                {
                    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                    groupBy: CONST.SEARCH.GROUP_BY.MONTH,
                    dateOn: CONST.SEARCH.DATE_PRESETS.LAST_12_MONTHS,
                    view: CONST.SEARCH.VIEW.LINE,
                },
                {
                    sortBy: CONST.SEARCH.TABLE_COLUMNS.GROUP_MONTH,
                    sortOrder: CONST.SEARCH.SORT_ORDER.ASC,
                },
            ),
            get searchQueryJSON() {
                return buildSearchQueryJSON(this.searchQuery);
            },
            get hash() {
                return this.searchQueryJSON?.hash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get similarSearchHash() {
                return this.searchQueryJSON?.similarSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
            get recentSearchHash() {
                return this.searchQueryJSON?.recentSearchHash ?? CONST.DEFAULT_NUMBER_ID;
            },
        },
    };
}

/**
 * Determines if the current user is eligible for the approve suggestion on a given policy.
 */
function isEligibleForApproveSuggestion(approvalMode: string | undefined, isApprover: boolean, isSubmittedToTarget: boolean): boolean {
    const isApprovalEnabled = approvalMode ? approvalMode !== CONST.POLICY.APPROVAL_MODE.OPTIONAL : false;
    return isApprovalEnabled && (isApprover || isSubmittedToTarget);
}

function isPolicyEligibleForSpendOverTime(policy: OnyxTypes.Policy, currentUserEmail: string | undefined): boolean {
    return (
        isPaidGroupPolicy(policy) &&
        (policy.role === CONST.POLICY.ROLE.ADMIN || policy.role === CONST.POLICY.ROLE.AUDITOR || (!!currentUserEmail && isPolicyApprover(policy, currentUserEmail)))
    );
}

function getSuggestedSearchesVisibility(
    currentUserEmail: string | undefined,
    cardFeedsByPolicy: Record<string, CardFeedForDisplay[]>,
    policies: OnyxCollection<OnyxTypes.Policy>,
    defaultExpensifyCard: CardFeedForDisplay | undefined,
): {visibility: Record<ValueOf<typeof CONST.SEARCH.SEARCH_KEYS>, boolean>; hasGroupPoliciesWithExpenseChat: boolean} {
    let shouldShowSubmitSuggestion = false;
    let shouldShowPaySuggestion = false;
    let shouldShowApproveSuggestion = false;
    let shouldShowExportSuggestion = false;
    let shouldShowStatementsSuggestion = false;
    let shouldShowUnapprovedCashSuggestion = false;
    let shouldShowUnapprovedCardSuggestion = false;
    let shouldShowExpensifyCardSuggestion = false;
    let shouldShowReimbursementsSuggestion = false;
    let shouldShowTopSpendersSuggestion = false;
    let shouldShowTopCategoriesSuggestion = false;
    let shouldShowTopMerchantsSuggestion = false;
    let hasGroupPoliciesWithExpenseChat = false;
    let shouldShowSpendOverTimeSuggestion = false;

    const hasCardFeed = Object.values(cardFeedsByPolicy ?? {}).some((feeds) => feeds.length > 0);

    Object.values(policies ?? {}).some((policy) => {
        if (!policy) {
            return false;
        }

        const isPaidPolicy = isPaidGroupPolicy(policy);
        const isPayer = isPolicyPayer(policy, currentUserEmail);
        const isAdmin = policy.role === CONST.POLICY.ROLE.ADMIN;
        const isExporter = policy.exporter === currentUserEmail;

        const isSubmittedTo =
            !!currentUserEmail && Object.values(policy.employeeList ?? {}).some((employee) => employee.submitsTo === currentUserEmail || employee.forwardsTo === currentUserEmail);
        const isUserApprover = !!currentUserEmail && isPolicyApprover(policy, currentUserEmail);
        const isApprovalEnabled = policy.approvalMode ? policy.approvalMode !== CONST.POLICY.APPROVAL_MODE.OPTIONAL : false;

        const hasExportError = (Object.keys(policy.connections ?? {}) as ConnectionName[]).some((connection) => {
            return hasSynchronizationErrorMessage(policy, connection, false);
        });
        const isPaymentEnabled = arePaymentsEnabled(policy);
        const hasVBBA = !!policy.achAccount?.bankAccountID && policy.achAccount.state === CONST.BANK_ACCOUNT.STATE.OPEN;
        const hasReimburser = !!policy.achAccount?.reimburser;
        const isECardEnabled = !!policy.areExpensifyCardsEnabled;

        const isEligibleForSubmitSuggestion = isPaidPolicy;
        const isEligibleForPaySuggestion = isPaidPolicy && isPayer;
        const isPolicyEligibleForApproveSuggestion = isPaidPolicy && isEligibleForApproveSuggestion(policy.approvalMode, isUserApprover, isSubmittedTo);
        const isEligibleForExportSuggestion = isExporter && !hasExportError;
        const isEligibleForStatementsSuggestion = isPaidPolicy && !!policy.areCompanyCardsEnabled && hasCardFeed;
        const isEligibleForUnapprovedCashSuggestion = isPaidPolicy && isAdmin && isApprovalEnabled && isPaymentEnabled;
        const isEligibleForUnapprovedCardSuggestion = isPaidPolicy && isAdmin && isApprovalEnabled && (hasCardFeed || !!defaultExpensifyCard);
        const isEligibleForExpensifyCardSuggestion = isPaidPolicy && isAdmin && isECardEnabled;
        const isEligibleForReimbursementsSuggestion = isPaidPolicy && isAdmin && isPaymentEnabled && hasVBBA && hasReimburser;
        const isAuditor = policy.role === CONST.POLICY.ROLE.AUDITOR;
        const memberCount = Object.keys(policy.employeeList ?? {}).length;
        const isEligibleForTopSpendersSuggestion = isPaidPolicy && (isAdmin || isAuditor || isUserApprover) && memberCount >= 2;
        const isEligibleForTopCategoriesSuggestion = isPaidPolicy && policy.areCategoriesEnabled === true;
        const isEligibleForTopMerchantsSuggestion = isPaidPolicy;

        shouldShowSubmitSuggestion ||= isEligibleForSubmitSuggestion;
        shouldShowPaySuggestion ||= isEligibleForPaySuggestion;
        shouldShowApproveSuggestion ||= isPolicyEligibleForApproveSuggestion;
        shouldShowExportSuggestion ||= isEligibleForExportSuggestion;
        shouldShowStatementsSuggestion ||= isEligibleForStatementsSuggestion;
        shouldShowUnapprovedCashSuggestion ||= isEligibleForUnapprovedCashSuggestion;
        shouldShowUnapprovedCardSuggestion ||= isEligibleForUnapprovedCardSuggestion;
        shouldShowExpensifyCardSuggestion ||= isEligibleForExpensifyCardSuggestion;
        shouldShowReimbursementsSuggestion ||= isEligibleForReimbursementsSuggestion;
        shouldShowTopSpendersSuggestion ||= isEligibleForTopSpendersSuggestion;
        shouldShowTopCategoriesSuggestion ||= isEligibleForTopCategoriesSuggestion;
        shouldShowTopMerchantsSuggestion ||= isEligibleForTopMerchantsSuggestion;
        hasGroupPoliciesWithExpenseChat ||=
            isPaidPolicy &&
            !!policy.isPolicyExpenseChatEnabled &&
            !policy.isJoinRequestPending &&
            (policy.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || Object.keys(policy.errors ?? {}).length > 0) &&
            !!policy.role;
        shouldShowSpendOverTimeSuggestion ||= isPolicyEligibleForSpendOverTime(policy, currentUserEmail);

        // We don't need to check the rest of the policies if we already determined that all suggestions should be displayed
        return (
            shouldShowSubmitSuggestion &&
            shouldShowPaySuggestion &&
            shouldShowApproveSuggestion &&
            shouldShowExportSuggestion &&
            shouldShowStatementsSuggestion &&
            shouldShowUnapprovedCashSuggestion &&
            shouldShowUnapprovedCardSuggestion &&
            shouldShowExpensifyCardSuggestion &&
            shouldShowReimbursementsSuggestion &&
            shouldShowTopSpendersSuggestion &&
            shouldShowTopCategoriesSuggestion &&
            shouldShowTopMerchantsSuggestion &&
            hasGroupPoliciesWithExpenseChat
        );
    });

    return {
        visibility: {
            [CONST.SEARCH.SEARCH_KEYS.EXPENSES]: true,
            [CONST.SEARCH.SEARCH_KEYS.REPORTS]: true,
            [CONST.SEARCH.SEARCH_KEYS.CHATS]: true,
            [CONST.SEARCH.SEARCH_KEYS.SUBMIT]: shouldShowSubmitSuggestion,
            [CONST.SEARCH.SEARCH_KEYS.PAY]: shouldShowPaySuggestion,
            [CONST.SEARCH.SEARCH_KEYS.APPROVE]: shouldShowApproveSuggestion,
            [CONST.SEARCH.SEARCH_KEYS.EXPORT]: shouldShowExportSuggestion,
            [CONST.SEARCH.SEARCH_KEYS.STATEMENTS]: shouldShowStatementsSuggestion,
            [CONST.SEARCH.SEARCH_KEYS.UNAPPROVED_CASH]: shouldShowUnapprovedCashSuggestion,
            [CONST.SEARCH.SEARCH_KEYS.UNAPPROVED_CARD]: shouldShowUnapprovedCardSuggestion,
            [CONST.SEARCH.SEARCH_KEYS.EXPENSIFY_CARD]: shouldShowExpensifyCardSuggestion,
            [CONST.SEARCH.SEARCH_KEYS.RECONCILIATION]: shouldShowReimbursementsSuggestion,
            [CONST.SEARCH.SEARCH_KEYS.TOP_SPENDERS]: shouldShowTopSpendersSuggestion,
            [CONST.SEARCH.SEARCH_KEYS.TOP_CATEGORIES]: shouldShowTopCategoriesSuggestion,
            [CONST.SEARCH.SEARCH_KEYS.TOP_MERCHANTS]: shouldShowTopMerchantsSuggestion,
            [CONST.SEARCH.SEARCH_KEYS.SPEND_OVER_TIME]: shouldShowSpendOverTimeSuggestion,
        },
        hasGroupPoliciesWithExpenseChat,
    };
}

/**
 * @private
 *
 * Returns a list of properties that are common to every Search ListItem
 */
function getTransactionItemCommonFormattedProperties(
    transactionItem: OnyxTypes.Transaction,
    from: OnyxTypes.PersonalDetails,
    to: OnyxTypes.PersonalDetails,
    policy: OnyxTypes.Policy,
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'],
    report: OnyxTypes.Report | undefined,
): Pick<TransactionListItemType, 'formattedFrom' | 'formattedTo' | 'formattedTotal' | 'formattedMerchant' | 'date' | 'submitted' | 'approved' | 'posted'> {
    const isExpenseReport = report?.type === CONST.REPORT.TYPE.EXPENSE;

    const fromName = getDisplayNameOrDefault(from);
    const formattedFrom = formatPhoneNumber(fromName);

    // Sometimes the search data personal detail for the 'to' account might not hold neither the display name nor the login
    // so for those cases we fallback to the display name of the personal detail data from onyx.
    let toName = getDisplayNameOrDefault(to, '', false);
    if (!toName && to?.accountID) {
        toName = getDisplayNameOrDefault(getPersonalDetailsForAccountID(to?.accountID));
    }

    const formattedTo = formatPhoneNumber(toName);
    const isDeleted = isDeletedTransaction(transactionItem);
    const formattedTotal = getTransactionAmount(transactionItem, isExpenseReport, false, isDeleted);
    const date = transactionItem?.modifiedCreated ? transactionItem.modifiedCreated : transactionItem?.created;
    const merchant = getTransactionMerchant(transactionItem);
    const formattedMerchant = isInvalidMerchantValue(merchant) ? '' : merchant;
    const submitted = report?.submitted;
    const approved = report?.approved;

    // Posted date is in the YYYYMMDD format, so we format it to YYYY-MM-DD here since JS's Date constructor interprets it as an invalid date.
    const posted = !transactionItem?.posted ? '' : `${transactionItem?.posted.slice(0, 4)}-${transactionItem?.posted.slice(4, 6)}-${transactionItem?.posted.slice(6, 8)}`;

    return {
        formattedFrom,
        formattedTo,
        date,
        submitted,
        approved,
        posted,
        formattedTotal,
        formattedMerchant,
    };
}

/**
 * @private
 */
function isReportEntry(key: string): key is ReportKey {
    return key.startsWith(ONYXKEYS.COLLECTION.REPORT);
}

/**
 * @private
 */
function isGroupEntry(key: string): key is SearchGroupKey {
    return key.startsWith(CONST.SEARCH.GROUP_PREFIX);
}

function isViolationEntry(key: string): key is ViolationKey {
    return key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
}

/**
 * @private
 */
function isReportActionEntry(key: string): key is ReportActionKey {
    return key.startsWith(ONYXKEYS.COLLECTION.REPORT_ACTIONS);
}

/**
 * @private
 */
function isTransactionEntry(key: string): key is TransactionKey {
    return key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION);
}

/**
 * Type guard that checks if something is a TransactionGroupListItemType
 */
function isTransactionGroupListItemType(item: ListItem): item is TransactionGroupListItemType {
    return 'transactions' in item;
}

/**
 * Type guard that checks if something is a TransactionReportGroupListItemType
 */
function isTransactionReportGroupListItemType(item: ListItem): item is TransactionReportGroupListItemType {
    return isTransactionGroupListItemType(item) && 'groupedBy' in item && item.groupedBy === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT;
}

/**
 * Type guard that checks if something is a TransactionMemberGroupListItemType
 */
function isTransactionMemberGroupListItemType(item: ListItem): item is TransactionMemberGroupListItemType {
    return isTransactionGroupListItemType(item) && 'groupedBy' in item && item.groupedBy === CONST.SEARCH.GROUP_BY.FROM;
}

/**
 * Type guard that checks if something is a TransactionCardGroupListItemType
 */
function isTransactionCardGroupListItemType(item: ListItem): item is TransactionCardGroupListItemType {
    return isTransactionGroupListItemType(item) && 'groupedBy' in item && item.groupedBy === CONST.SEARCH.GROUP_BY.CARD;
}

/**
 * Type guard that checks if something is a TransactionWithdrawalIDGroupListItemType
 */
function isTransactionWithdrawalIDGroupListItemType(item: ListItem): item is TransactionWithdrawalIDGroupListItemType {
    return isTransactionGroupListItemType(item) && 'groupedBy' in item && item.groupedBy === CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID;
}

/**
 * Type guard that checks if something is a TransactionCategoryGroupListItemType
 */
function isTransactionCategoryGroupListItemType(item: ListItem): item is TransactionCategoryGroupListItemType {
    return isTransactionGroupListItemType(item) && 'groupedBy' in item && item.groupedBy === CONST.SEARCH.GROUP_BY.CATEGORY;
}

/**
 * Type guard that checks if something is a TransactionMerchantGroupListItemType
 */
function isTransactionMerchantGroupListItemType(item: ListItem): item is TransactionMerchantGroupListItemType {
    return isTransactionGroupListItemType(item) && 'groupedBy' in item && item.groupedBy === CONST.SEARCH.GROUP_BY.MERCHANT;
}

/**
 * Type guard that checks if something is a TransactionTagGroupListItemType
 */
function isTransactionTagGroupListItemType(item: ListItem): item is TransactionTagGroupListItemType {
    return isTransactionGroupListItemType(item) && 'groupedBy' in item && item.groupedBy === CONST.SEARCH.GROUP_BY.TAG;
}

/**
 * Type guard that checks if something is a TransactionMonthGroupListItemType
 */
function isTransactionMonthGroupListItemType(item: ListItem): item is TransactionMonthGroupListItemType {
    return isTransactionGroupListItemType(item) && 'groupedBy' in item && item.groupedBy === CONST.SEARCH.GROUP_BY.MONTH;
}

function isTransactionWeekGroupListItemType(item: ListItem): item is TransactionWeekGroupListItemType {
    return isTransactionGroupListItemType(item) && 'groupedBy' in item && item.groupedBy === CONST.SEARCH.GROUP_BY.WEEK;
}

function isTransactionYearGroupListItemType(item: ListItem): item is TransactionYearGroupListItemType {
    return isTransactionGroupListItemType(item) && 'groupedBy' in item && item.groupedBy === CONST.SEARCH.GROUP_BY.YEAR;
}

function isTransactionQuarterGroupListItemType(item: ListItem): item is TransactionQuarterGroupListItemType {
    return isTransactionGroupListItemType(item) && 'groupedBy' in item && item.groupedBy === CONST.SEARCH.GROUP_BY.QUARTER;
}

/**
 * Type guard that checks if a list of search items contains grouped transaction data.
 * When a search has a groupBy parameter, all items share the same shape, so checking the first element is sufficient.
 */
function isGroupedItemArray(data: ListItem[]): data is GroupedItem[] {
    const first = data.at(0);
    return data.length === 0 || (first !== undefined && isTransactionGroupListItemType(first) && 'groupedBy' in first);
}

/**
 * Type guard that checks if something is a TransactionListItemType
 */
function isTransactionListItemType(item: SearchListItem): item is TransactionListItemType {
    const transactionListItem = item as TransactionListItemType;
    return transactionListItem.transactionID !== undefined;
}

/**
 * Type guard that check if something is a TaskListItemType
 */
function isTaskListItemType(item: SearchListItem): item is TaskListItemType {
    return 'type' in item && item.type === CONST.REPORT.TYPE.TASK;
}

/**
 * Type guard that checks if something is a ReportActionListItemType
 */
function isReportActionListItemType(item: SearchListItem): item is ReportActionListItemType {
    const reportActionListItem = item as ReportActionListItemType;
    return reportActionListItem.reportActionID !== undefined;
}

function isAmountTooLong(amount: number, maxLength = 8): boolean {
    return Math.abs(amount).toString().length >= maxLength;
}

function isTransactionAmountTooLong(transactionItem: TransactionListItemType | OnyxTypes.Transaction) {
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const amount = Math.abs(Number(transactionItem.modifiedAmount) || transactionItem.amount);
    return isAmountTooLong(amount);
}

function isTransactionTaxAmountTooLong(transactionItem: TransactionListItemType | OnyxTypes.Transaction) {
    // it won't matter if pass true or false as second argument to getTaxAmount here because isAmountTooLong function uses Math.abs on the returned value of getTaxAmount
    const taxAmount = getTaxAmount(transactionItem, false);
    return isAmountTooLong(taxAmount);
}

function getWideAmountIndicators(data: TransactionListItemType[] | TransactionGroupListItemType[] | TaskListItemType[] | OnyxTypes.SearchResults['data']): {
    shouldShowAmountInWideColumn: boolean;
    shouldShowTaxAmountInWideColumn: boolean;
} {
    let isAmountWide = false;
    let isTaxAmountWide = false;

    const processTransaction = (transaction: TransactionListItemType | OnyxTypes.Transaction) => {
        isAmountWide ||= isTransactionAmountTooLong(transaction);
        isTaxAmountWide ||= isTransactionTaxAmountTooLong(transaction);
    };

    if (Array.isArray(data)) {
        data.some((item) => {
            if (isTransactionGroupListItemType(item)) {
                const transactions = item.transactions ?? [];
                for (const transaction of transactions) {
                    processTransaction(transaction);
                    if (isAmountWide && isTaxAmountWide) {
                        break;
                    }
                }
            } else if (isTransactionListItemType(item)) {
                processTransaction(item);
            }
            return isAmountWide && isTaxAmountWide;
        });
    } else {
        Object.keys(data).some((key) => {
            if (isTransactionEntry(key)) {
                const item = data[key];
                processTransaction(item);
            }
            return isAmountWide && isTaxAmountWide;
        });
    }

    return {
        shouldShowAmountInWideColumn: isAmountWide,
        shouldShowTaxAmountInWideColumn: isTaxAmountWide,
    };
}

function hasDeletedTransactionInData(data: TransactionListItemType[] | TransactionGroupListItemType[] | TaskListItemType[] | OnyxTypes.SearchResults['data']): boolean {
    if (Array.isArray(data)) {
        return data.some((item) => {
            if (isTransactionGroupListItemType(item)) {
                return item.transactions.some((transaction) => transaction.reportID === CONST.REPORT.TRASH_REPORT_ID);
            }
            if (isTransactionListItemType(item)) {
                return item.reportID === CONST.REPORT.TRASH_REPORT_ID;
            }
            return false;
        });
    }

    return Object.keys(data).some((key) => {
        if (isTransactionEntry(key)) {
            const item = data[key];
            return item?.reportID === CONST.REPORT.TRASH_REPORT_ID;
        }
        return false;
    });
}

type ShouldShowYearResult = {
    shouldShowYearCreated: boolean;
    shouldShowYearSubmitted: boolean;
    shouldShowYearApproved: boolean;
    shouldShowYearPosted: boolean;
    shouldShowYearExported: boolean;
    shouldShowYearWithdrawn: boolean;
};

/**
 * @private
 * Builds a map of the last exported action by report ID for efficient lookups
 */
function buildLastExportedActionByReportIDMap(data: OnyxTypes.SearchResults['data']): Map<string, OnyxTypes.ReportAction> {
    const lastExportedActionByReportID = new Map<string, OnyxTypes.ReportAction>();
    for (const key of Object.keys(data)) {
        if (isReportActionEntry(key)) {
            const reportID = key.replace(ONYXKEYS.COLLECTION.REPORT_ACTIONS, '');
            const actions = data[key];
            const exportedActions = Object.values(actions).filter(
                (action): action is OnyxTypes.ReportAction =>
                    action.actionName === CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_CSV || action.actionName === CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_INTEGRATION,
            );

            let exportedAction: OnyxTypes.ReportAction | undefined;
            let latestTime = -Infinity;

            for (const action of exportedActions) {
                const currentTime = new Date(action.created).getTime();
                if (currentTime > latestTime) {
                    latestTime = currentTime;
                    exportedAction = action;
                }
            }

            if (exportedAction) {
                lastExportedActionByReportID.set(reportID, exportedAction);
            }
        }
    }
    return lastExportedActionByReportID;
}

/**
 * Checks if the date of transactions or reports indicate the need to display the year because they are from a past year.
 * @param data - The search results data (array or object)
 * @param checkOnlyReports - When true and data is an object, only check report dates (skip transactions and report actions)
 * @returns An object indicating which date fields should display the full year
 */
function shouldShowYear(
    data: TransactionListItemType[] | TransactionGroupListItemType[] | TaskListItemType[] | OnyxTypes.SearchResults['data'],
    checkOnlyReports = false,
    precomputedLastExportedMap?: Map<string, OnyxTypes.ReportAction>,
    skipReportCreatedDate = false,
): ShouldShowYearResult {
    const result: ShouldShowYearResult = {
        shouldShowYearCreated: false,
        shouldShowYearSubmitted: false,
        shouldShowYearApproved: false,
        shouldShowYearPosted: false,
        shouldShowYearExported: false,
        shouldShowYearWithdrawn: false,
    };

    const currentYear = new Date().getFullYear();

    if (Array.isArray(data)) {
        for (const item of data) {
            if (isTaskListItemType(item)) {
                const taskYear = new Date(item.created).getFullYear();
                if (taskYear !== currentYear) {
                    result.shouldShowYearCreated = true;
                }
            }
            if (isTransactionReportGroupListItemType(item)) {
                if (item.created && DateUtils.doesDateBelongToAPastYear(item.created)) {
                    result.shouldShowYearCreated = true;
                }
                if (item.submitted && DateUtils.doesDateBelongToAPastYear(item.submitted)) {
                    result.shouldShowYearSubmitted = true;
                }
                if (item.approved && DateUtils.doesDateBelongToAPastYear(item.approved)) {
                    result.shouldShowYearApproved = true;
                }
            }
            if (isTransactionListItemType(item)) {
                const transactionCreated = getTransactionCreatedDate(item);
                if (transactionCreated && DateUtils.doesDateBelongToAPastYear(transactionCreated)) {
                    result.shouldShowYearCreated = true;
                }
                if (item.submitted && DateUtils.doesDateBelongToAPastYear(item.submitted)) {
                    result.shouldShowYearSubmitted = true;
                }
                if (item.approved && DateUtils.doesDateBelongToAPastYear(item.approved)) {
                    result.shouldShowYearApproved = true;
                }

                // Posted date is in the YYYYMMDD format, so we extract the year manually here since JS's Date constructor interprets it as an invalid date.
                if (item?.posted) {
                    const postedYear = parseInt(item.posted.slice(0, 4), 10);
                    result.shouldShowYearPosted = postedYear !== currentYear;
                }
            }

            // Early exit if all flags are true
            if (result.shouldShowYearCreated && result.shouldShowYearSubmitted && result.shouldShowYearApproved && result.shouldShowYearPosted) {
                return result;
            }
        }
        return result;
    }

    const lastExportedActionByReportID = precomputedLastExportedMap ?? buildLastExportedActionByReportIDMap(data);

    for (const key of Object.keys(data)) {
        if (!checkOnlyReports && isTransactionEntry(key)) {
            const item = data[key];
            const transactionCreated = getTransactionCreatedDate(item);
            if (transactionCreated && DateUtils.doesDateBelongToAPastYear(transactionCreated)) {
                result.shouldShowYearCreated = true;
            }
            const report = data[`${ONYXKEYS.COLLECTION.REPORT}${item.reportID}`];
            if (report?.submitted && DateUtils.doesDateBelongToAPastYear(report.submitted)) {
                result.shouldShowYearSubmitted = true;
            }
            if (report?.approved && DateUtils.doesDateBelongToAPastYear(report.approved)) {
                result.shouldShowYearApproved = true;
            }

            // Posted date is in the YYYYMMDD format, so we extract the year manually here since JS's Date constructor interprets it as an invalid date.
            if (item?.posted) {
                const postedYear = parseInt(item.posted.slice(0, 4), 10);
                result.shouldShowYearPosted = postedYear !== currentYear;
            }

            const exportedAction = item.reportID ? lastExportedActionByReportID.get(item.reportID) : undefined;
            if (exportedAction?.created && DateUtils.doesDateBelongToAPastYear(exportedAction.created)) {
                result.shouldShowYearExported = true;
            }
        } else if (!checkOnlyReports && isReportActionEntry(key)) {
            const item = data[key];
            for (const action of Object.values(item)) {
                const date = action.created;
                if (DateUtils.doesDateBelongToAPastYear(date)) {
                    result.shouldShowYearCreated = true;
                }
            }
        } else if (isReportEntry(key)) {
            const item = data[key];

            if (!skipReportCreatedDate && item.created && DateUtils.doesDateBelongToAPastYear(item.created)) {
                result.shouldShowYearCreated = true;
            }
            if (item.submitted && DateUtils.doesDateBelongToAPastYear(item.submitted)) {
                result.shouldShowYearSubmitted = true;
            }
            if (item.approved && DateUtils.doesDateBelongToAPastYear(item.approved)) {
                result.shouldShowYearApproved = true;
            }

            const exportedAction = lastExportedActionByReportID.get(item.reportID);
            if (exportedAction?.created && DateUtils.doesDateBelongToAPastYear(exportedAction.created)) {
                result.shouldShowYearExported = true;
            }
        } else if (!result.shouldShowYearWithdrawn && isGroupEntry(key)) {
            const group = data[key];
            if ('debitPosted' in group && group.debitPosted && DateUtils.doesDateBelongToAPastYear(group.debitPosted)) {
                result.shouldShowYearWithdrawn = true;
            }
        }

        // Early exit if all flags are true
        if (
            result.shouldShowYearCreated &&
            result.shouldShowYearSubmitted &&
            result.shouldShowYearApproved &&
            result.shouldShowYearPosted &&
            result.shouldShowYearExported &&
            result.shouldShowYearWithdrawn
        ) {
            return result;
        }
    }

    return result;
}

/**
 * @private
 * Generates a display name for IOU reports considering the personal details of the payer and the transaction details.
 */
function getIOUReportName(translate: LocalizedTranslate, data: OnyxTypes.SearchResults['data'], reportItem: TransactionReportGroupListItemType) {
    const payerPersonalDetails = reportItem.managerID ? data.personalDetailsList?.[reportItem.managerID] : emptyPersonalDetails;
    // For cases where the data personal detail for manager ID do not exist in search data.personalDetailsList
    // we fallback to the display name of the personal detail data from onyx.
    const payerName = payerPersonalDetails?.displayName ?? payerPersonalDetails?.login ?? getDisplayNameOrDefault(getPersonalDetailsForAccountID(reportItem.managerID));
    const formattedAmount = convertToDisplayString(reportItem.total ?? 0, reportItem.currency ?? CONST.CURRENCY.USD);
    if (reportItem.action === CONST.SEARCH.ACTION_TYPES.PAID) {
        return translate('iou.payerPaidAmount', formattedAmount, payerName);
    }
    return translate('iou.payerOwesAmount', formattedAmount, payerName);
}

function getTransactionViolations(
    allViolations: OnyxCollection<OnyxTypes.TransactionViolation[]>,
    transaction: OnyxTypes.Transaction,
    currentUserEmail: string,
    currentUserAccountID: number,
    report: OnyxEntry<OnyxTypes.Report>,
    policy: OnyxEntry<OnyxTypes.Policy>,
): OnyxTypes.TransactionViolation[] {
    const transactionViolations = allViolations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`];
    if (!transactionViolations) {
        return [];
    }
    return transactionViolations.filter((violation) => !isViolationDismissed(transaction, violation, currentUserEmail, currentUserAccountID, report, policy));
}

/**
 * @private
 * Creates optimized lookup maps:
 * - Lookup money request action by transaction ID
 * - Lookup hold action by transaction ID
 */
function createReportActionsLookupMaps(data: OnyxTypes.SearchResults['data']): {
    moneyRequestReportActionsByTransactionID: Map<string, OnyxTypes.ReportAction>;
    holdReportActionsByTransactionID: Map<string, OnyxTypes.ReportAction>;
} {
    const moneyRequestReportActionsByTransactionID = new Map<string, OnyxTypes.ReportAction>();
    const holdReportActionsByTransactionID = new Map<string, OnyxTypes.ReportAction>();

    // Helper to match report action entries ("HOLD" report action) with transaction entries
    const allHoldReportActions = new Map<string, OnyxTypes.ReportAction>();

    for (const key of Object.keys(data)) {
        if (isReportActionEntry(key)) {
            const actions = Object.values(data[key]);
            for (const action of actions) {
                if (isMoneyRequestAction(action)) {
                    const originalMessage = getOriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.IOU>(action);
                    const transactionID = originalMessage?.IOUTransactionID;
                    if (transactionID) {
                        moneyRequestReportActionsByTransactionID.set(transactionID, action);
                    }
                } else if (isHoldAction(action)) {
                    allHoldReportActions.set(action.reportActionID, action);
                }
            }
        }
        // Optimization: We don't need to iterate over all the transactions.
        // We can stop as soon as all found "HOLD" report actions are matched with their transactions.
        // Note: This optimization is possible only because reportActions appear before transactions (alphabetical order) and this order is guaranteed.
        else if (isTransactionEntry(key) && allHoldReportActions.size > holdReportActionsByTransactionID.size) {
            const transaction = data[key];
            const holdReportActionID = transaction?.comment?.hold;
            if (holdReportActionID) {
                const action = allHoldReportActions.get(holdReportActionID);
                if (action) {
                    holdReportActionsByTransactionID.set(transaction.transactionID, action);
                }
            }
        }
    }

    return {
        moneyRequestReportActionsByTransactionID,
        holdReportActionsByTransactionID,
    };
}

/**
 * Calculates the "to" field value for a given transaction item based on the associated report and search data.
 */
function getToFieldValueForTransaction(
    transactionItem: OnyxTypes.Transaction,
    report: OnyxTypes.Report | undefined,
    personalDetailsList: OnyxTypes.PersonalDetailsList | undefined,
    reportAction: OnyxTypes.ReportAction | undefined,
): OnyxTypes.PersonalDetails {
    const shouldShowBlankTo = !report || isOpenExpenseReport(report);
    if (shouldShowBlankTo) {
        return emptyPersonalDetails;
    }

    if (reportAction) {
        const originalMessage = isMoneyRequestAction(reportAction) ? getOriginalMessage(reportAction) : undefined;
        if (originalMessage?.type === CONST.IOU.REPORT_ACTION_TYPE.PAY && report.ownerAccountID) {
            return personalDetailsList?.[report.ownerAccountID] ?? emptyPersonalDetails;
        }
    }

    if (report?.managerID) {
        const isIOUReport = report?.type === CONST.REPORT.TYPE.IOU;
        if (isIOUReport) {
            return (
                getIOUPayerAndReceiver(
                    report?.managerID ?? CONST.DEFAULT_NUMBER_ID,
                    report?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID,
                    personalDetailsList,
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    Number(transactionItem.modifiedAmount) || transactionItem.amount,
                )?.to ?? emptyPersonalDetails
            );
        }
        return personalDetailsList?.[report?.managerID] ?? emptyPersonalDetails;
    }
    return emptyPersonalDetails;
}

function getTransactionPendingAction(transactionItem: OnyxTypes.Transaction): OnyxTypes.Transaction['pendingAction'] {
    return transactionItem.pendingAction ?? (transactionItem.pendingFields ? Object.values(transactionItem.pendingFields).find(Boolean) : undefined);
}

type PreprocessingContext = {
    transactionKeys: TransactionKey[];
    reportKeys: ReportKey[];
    violations: Record<string, OnyxTypes.TransactionViolation[] | undefined>;
    shouldShowMerchant: boolean;
    lastExportedActionByReportID: Map<string, OnyxTypes.ReportAction>;
    moneyRequestReportActionsByTransactionID: Map<string, OnyxTypes.ReportAction>;
    holdReportActionsByTransactionID: Map<string, OnyxTypes.ReportAction>;
    allHoldReportActions: Map<string, OnyxTypes.ReportAction>;
    transactionsByReportID: Map<string, OnyxTypes.Transaction[]>;
    shouldShowYearCreated: boolean;
    shouldShowYearSubmitted: boolean;
    shouldShowYearApproved: boolean;
    shouldShowYearPosted: boolean;
    shouldShowYearExported: boolean;
    shouldShowYearCreatedReport: boolean;
    shouldShowYearSubmittedReport: boolean;
    shouldShowYearApprovedReport: boolean;
    shouldShowYearExportedReport: boolean;
    shouldShowAmountInWideColumn: boolean;
    shouldShowTaxAmountInWideColumn: boolean;
    hasDeletedTransaction: boolean;
    currentYear: number;
};

function createPreprocessingContext(): PreprocessingContext {
    return {
        transactionKeys: [],
        reportKeys: [],
        violations: {},
        shouldShowMerchant: false,
        lastExportedActionByReportID: new Map(),
        moneyRequestReportActionsByTransactionID: new Map(),
        holdReportActionsByTransactionID: new Map(),
        allHoldReportActions: new Map(),
        transactionsByReportID: new Map(),
        shouldShowYearCreated: false,
        shouldShowYearSubmitted: false,
        shouldShowYearApproved: false,
        shouldShowYearPosted: false,
        shouldShowYearExported: false,
        shouldShowYearCreatedReport: false,
        shouldShowYearSubmittedReport: false,
        shouldShowYearApprovedReport: false,
        shouldShowYearExportedReport: false,
        shouldShowAmountInWideColumn: false,
        shouldShowTaxAmountInWideColumn: false,
        hasDeletedTransaction: false,
        currentYear: new Date().getFullYear(),
    };
}

/**
 * Indexes report actions by building the latest-export map, money-request lookup,
 * hold-action lookup, and year-created flag from action dates.
 */
function processReportActionEntry(ctx: PreprocessingContext, key: string, actions: Record<string, OnyxTypes.ReportAction>): void {
    const reportID = key.replace(ONYXKEYS.COLLECTION.REPORT_ACTIONS, '');

    let latestExportTime = -Infinity;
    let latestExportAction: OnyxTypes.ReportAction | undefined;

    for (const action of Object.values(actions)) {
        if (action.actionName === CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_CSV || action.actionName === CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_INTEGRATION) {
            const currentTime = new Date(action.created).getTime();
            if (currentTime > latestExportTime) {
                latestExportTime = currentTime;
                latestExportAction = action;
            }
        }

        if (isMoneyRequestAction(action)) {
            const originalMessage = getOriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.IOU>(action);
            const transactionID = originalMessage?.IOUTransactionID;
            if (transactionID) {
                ctx.moneyRequestReportActionsByTransactionID.set(transactionID, action);
            }
        } else if (isHoldAction(action)) {
            ctx.allHoldReportActions.set(action.reportActionID, action);
        }

        if (!ctx.shouldShowYearCreated && DateUtils.doesDateBelongToAPastYear(action.created)) {
            ctx.shouldShowYearCreated = true;
        }
    }

    if (latestExportAction) {
        ctx.lastExportedActionByReportID.set(reportID, latestExportAction);
    }
}

/**
 * Accumulates report-level and shared year flags from report date fields.
 */
function processReportEntry(ctx: PreprocessingContext, report: OnyxTypes.Report): void {
    if (!ctx.shouldShowYearCreatedReport && report.created && DateUtils.doesDateBelongToAPastYear(report.created)) {
        ctx.shouldShowYearCreatedReport = true;
    }
    if (!ctx.shouldShowYearSubmittedReport && report.submitted && DateUtils.doesDateBelongToAPastYear(report.submitted)) {
        ctx.shouldShowYearSubmittedReport = true;
    }
    if (!ctx.shouldShowYearApprovedReport && report.approved && DateUtils.doesDateBelongToAPastYear(report.approved)) {
        ctx.shouldShowYearApprovedReport = true;
    }

    if (!ctx.shouldShowYearSubmitted && report.submitted && DateUtils.doesDateBelongToAPastYear(report.submitted)) {
        ctx.shouldShowYearSubmitted = true;
    }
    if (!ctx.shouldShowYearApproved && report.approved && DateUtils.doesDateBelongToAPastYear(report.approved)) {
        ctx.shouldShowYearApproved = true;
    }
}

/**
 * Accumulates merchant visibility, wide-amount indicators, year flags,
 * transaction-by-report grouping, and hold-action matching from a transaction.
 */
function processTransactionEntry(ctx: PreprocessingContext, transaction: OnyxTypes.Transaction, data: OnyxTypes.SearchResults['data']): void {
    if (!ctx.shouldShowMerchant) {
        const merchant = transaction.modifiedMerchant ? transaction.modifiedMerchant : (transaction.merchant ?? '');
        if (!isInvalidMerchantValue(merchant) || isScanning(transaction)) {
            ctx.shouldShowMerchant = true;
        }
    }

    if (!ctx.shouldShowAmountInWideColumn) {
        ctx.shouldShowAmountInWideColumn = isTransactionAmountTooLong(transaction);
    }
    if (!ctx.shouldShowTaxAmountInWideColumn) {
        ctx.shouldShowTaxAmountInWideColumn = isTransactionTaxAmountTooLong(transaction);
    }
    if (!ctx.hasDeletedTransaction) {
        ctx.hasDeletedTransaction = transaction.reportID === CONST.REPORT.TRASH_REPORT_ID;
    }

    if (!ctx.shouldShowYearCreated) {
        const transactionCreated = getTransactionCreatedDate(transaction);
        if (transactionCreated && DateUtils.doesDateBelongToAPastYear(transactionCreated)) {
            ctx.shouldShowYearCreated = true;
        }
    }

    const report = data[`${ONYXKEYS.COLLECTION.REPORT}${transaction.reportID}`];
    if (!ctx.shouldShowYearSubmitted && report?.submitted && DateUtils.doesDateBelongToAPastYear(report.submitted)) {
        ctx.shouldShowYearSubmitted = true;
    }
    if (!ctx.shouldShowYearApproved && report?.approved && DateUtils.doesDateBelongToAPastYear(report.approved)) {
        ctx.shouldShowYearApproved = true;
    }

    if (!ctx.shouldShowYearPosted && transaction?.posted) {
        const postedYear = parseInt(transaction.posted.slice(0, 4), 10);
        if (postedYear !== ctx.currentYear) {
            ctx.shouldShowYearPosted = true;
        }
    }

    // Optimistic: works when report-action keys precede transaction keys (common case).
    // resolveExportedYearFlags() re-checks after the export map is fully built.
    if (!ctx.shouldShowYearExported) {
        const exportedAction = transaction.reportID ? ctx.lastExportedActionByReportID.get(transaction.reportID) : undefined;
        if (exportedAction?.created && DateUtils.doesDateBelongToAPastYear(exportedAction.created)) {
            ctx.shouldShowYearExported = true;
        }
    }

    if (transaction.reportID) {
        const existing = ctx.transactionsByReportID.get(transaction.reportID);
        if (existing) {
            existing.push(transaction);
        } else {
            ctx.transactionsByReportID.set(transaction.reportID, [transaction]);
        }
    }

    if (ctx.allHoldReportActions.size > ctx.holdReportActionsByTransactionID.size) {
        const holdReportActionID = transaction?.comment?.hold;
        if (holdReportActionID) {
            const action = ctx.allHoldReportActions.get(holdReportActionID);
            if (action) {
                ctx.holdReportActionsByTransactionID.set(transaction.transactionID, action);
            }
        }
    }
}

/**
 * The export-action map is built inline during processReportActionEntry, but report
 * and transaction entries may have been iterated before the map was complete.
 * This post-loop pass re-checks both against the now-complete map.
 */
function resolveExportedYearFlags(ctx: PreprocessingContext, data: OnyxTypes.SearchResults['data']): void {
    if (ctx.shouldShowYearExported && ctx.shouldShowYearExportedReport) {
        return;
    }

    for (const key of ctx.reportKeys) {
        if (ctx.shouldShowYearExported && ctx.shouldShowYearExportedReport) {
            return;
        }
        const item = data[key];
        const exportedAction = ctx.lastExportedActionByReportID.get(item.reportID);
        if (exportedAction?.created && DateUtils.doesDateBelongToAPastYear(exportedAction.created)) {
            ctx.shouldShowYearExported = true;
            ctx.shouldShowYearExportedReport = true;
        }
    }

    if (!ctx.shouldShowYearExported) {
        for (const key of ctx.transactionKeys) {
            const transaction = data[key];
            const exportedAction = transaction.reportID ? ctx.lastExportedActionByReportID.get(transaction.reportID) : undefined;
            if (exportedAction?.created && DateUtils.doesDateBelongToAPastYear(exportedAction.created)) {
                ctx.shouldShowYearExported = true;
                break;
            }
        }
    }
}

/**
 * Single-pass preprocessing over Object.keys(data) that builds all derived structures
 * (key classification, violations, export/action maps, year flags, column indicators)
 * needed by getTransactionsSections and getReportSections.
 */
function classifyAndPreprocess(data: OnyxTypes.SearchResults['data']): Omit<PreprocessingContext, 'allHoldReportActions' | 'currentYear'> {
    const ctx = createPreprocessingContext();

    for (const key of Object.keys(data)) {
        if (isReportActionEntry(key)) {
            processReportActionEntry(ctx, key, data[key]);
        } else if (isReportEntry(key)) {
            ctx.reportKeys.push(key);
            processReportEntry(ctx, data[key]);
        } else if (isTransactionEntry(key)) {
            ctx.transactionKeys.push(key);
            processTransactionEntry(ctx, data[key], data);
        } else if (isViolationEntry(key)) {
            ctx.violations[key] = data[key];
        }
    }

    resolveExportedYearFlags(ctx, data);

    return ctx;
}

/**
 * Checks whether any non-dismissed, actionable violations are visible to the current user.
 * A violation is "visible" only when it is both actionable (type VIOLATION, or NOTICE/WARNING
 * with showInReview) AND passes shouldShowViolation for the user's role.
 */
function hasVisibleViolations(
    report: OnyxEntry<OnyxTypes.Report>,
    allViolations: OnyxCollection<OnyxTypes.TransactionViolation[]>,
    currentUserEmail: string,
    currentUserAccountID: number,
    transactions: OnyxTypes.Transaction[],
    policy: OnyxEntry<OnyxTypes.Policy>,
): boolean {
    if (!report || !allViolations || !transactions) {
        return false;
    }

    let hasActionable = false;
    let hasUserVisible = false;

    for (const transaction of transactions) {
        if (!transaction) {
            continue;
        }

        const tvs = allViolations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`];
        if (!tvs) {
            continue;
        }

        for (const violation of tvs) {
            if (isViolationDismissed(transaction, violation, currentUserEmail, currentUserAccountID, report, policy)) {
                continue;
            }

            if (!hasActionable) {
                const type = violation.type;
                const showInReview = violation.showInReview ?? false;
                if (type === CONST.VIOLATION_TYPES.VIOLATION || ((type === CONST.VIOLATION_TYPES.NOTICE || type === CONST.VIOLATION_TYPES.WARNING) && showInReview)) {
                    hasActionable = true;
                }
            }

            if (!hasUserVisible && shouldShowViolation(report, policy, violation.name, currentUserEmail, true, transaction)) {
                hasUserVisible = true;
            }

            if (hasActionable && hasUserVisible) {
                return true;
            }
        }
    }

    return hasActionable && hasUserVisible;
}

/**
 * @private
 * Organizes data into List Sections for display, for the TransactionListItemType of Search Results.
 *
 * Do not use directly, use only via `getSections()` facade.
 */
function getTransactionsSections({
    data,
    currentSearch,
    currentAccountID,
    currentUserEmail,
    formatPhoneNumber,
    isActionLoadingSet,
    bankAccountList,
    allReportMetadata,
    reportActions = {},
    queryJSON,
    policyForMovingExpenses,
}: GetTransactionSectionsParams): [TransactionListItemType[], number, boolean] {
    const {
        transactionKeys,
        violations: allViolations,
        shouldShowMerchant,
        lastExportedActionByReportID,
        moneyRequestReportActionsByTransactionID,
        holdReportActionsByTransactionID,
        shouldShowYearCreated,
        shouldShowYearSubmitted,
        shouldShowYearApproved,
        shouldShowYearPosted,
        shouldShowYearExported,
        shouldShowAmountInWideColumn,
        shouldShowTaxAmountInWideColumn,
        hasDeletedTransaction,
    } = classifyAndPreprocess(data);

    const personalDetailsMap = new Map(Object.entries(data.personalDetailsList ?? {}));
    const currentUserPersonalDetails = personalDetailsMap.get(currentAccountID.toString()) ?? emptyPersonalDetails;

    const transactionsSections: TransactionListItemType[] = [];

    const currentQueryJSON = queryJSON ?? getCurrentSearchQueryJSON();

    for (const key of transactionKeys) {
        const transactionItem = data[key];
        const report = data[`${ONYXKEYS.COLLECTION.REPORT}${transactionItem.reportID}`];

        let shouldShow = true;

        const isActionLoading = isActionLoadingSet?.has(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${transactionItem.reportID}`);
        if (currentQueryJSON && !isActionLoading) {
            if (currentQueryJSON.type === CONST.SEARCH.DATA_TYPES.EXPENSE) {
                const status = currentQueryJSON.status;
                if (Array.isArray(status)) {
                    shouldShow = status.some((expenseStatus) => {
                        return isValidExpenseStatus(expenseStatus) ? expenseStatusActionMapping[expenseStatus](report, transactionItem.reportID) : false;
                    });
                } else {
                    shouldShow = isValidExpenseStatus(status) ? expenseStatusActionMapping[status](report, transactionItem.reportID) : false;
                }
            }
        }

        if (!transactionItem.transactionID) {
            shouldShow = false;
        }

        if (shouldShow) {
            const reportAction = moneyRequestReportActionsByTransactionID.get(transactionItem.transactionID);
            const policy = data[`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`];
            const shouldShowBlankTo = !report || isOpenExpenseReport(report);
            const transactionViolations = getTransactionViolations(allViolations, transactionItem, currentUserEmail, currentAccountID ?? CONST.DEFAULT_NUMBER_ID, report, policy);
            // Use Map.get() for faster lookups with default values
            const fromAccountID = reportAction?.actorAccountID ?? report?.ownerAccountID;
            const from = fromAccountID ? (personalDetailsMap.get(fromAccountID.toString()) ?? emptyPersonalDetails) : emptyPersonalDetails;
            const to = getToFieldValueForTransaction(transactionItem, report, data.personalDetailsList, reportAction);
            const isIOUReport = report?.type === CONST.REPORT.TYPE.IOU;

            const {formattedFrom, formattedTo, formattedTotal, formattedMerchant, date, submitted, approved, posted} = getTransactionItemCommonFormattedProperties(
                transactionItem,
                from,
                to,
                policy,
                formatPhoneNumber,
                report,
            );
            const actions = reportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionItem.reportID}`] ?? [];
            const reportMetadata = allReportMetadata?.[`${ONYXKEYS.COLLECTION.REPORT_METADATA}${transactionItem.reportID}`] ?? {};
            const allActions = getActions(data, allViolations, key, currentSearch, currentUserEmail, currentAccountID, bankAccountList, reportMetadata, actions);
            const transactionPendingAction = getTransactionPendingAction(transactionItem);
            const transactionAttendees = getAttendees(transactionItem, currentUserPersonalDetails);
            const isUnreported = transactionItem.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
            const shouldShowAttendees = shouldShowAttendeesUtils(CONST.IOU.TYPE.SUBMIT, isUnreported ? policyForMovingExpenses : policy) && transactionAttendees.length > 0;

            const transactionSection: TransactionListItemType = {
                ...transactionItem,
                ...(transactionPendingAction ? {pendingAction: transactionPendingAction} : {}),
                ...(transactionAttendees.length > 0
                    ? {
                          comment: {
                              ...transactionItem.comment,
                              attendees: shouldShowAttendees ? transactionAttendees : [],
                          },
                      }
                    : {}),
                keyForList: transactionItem.transactionID,
                action: getAction(allActions),
                allActions,
                report,
                policy,
                reportAction,
                holdReportAction: holdReportActionsByTransactionID.get(transactionItem.transactionID),
                from,
                to,
                formattedFrom,
                formattedTo: shouldShowBlankTo ? '' : formattedTo,
                formattedTotal,
                formattedMerchant,
                date,
                submitted,
                approved,
                posted,
                exported: transactionItem.reportID ? (lastExportedActionByReportID.get(transactionItem.reportID)?.created ?? '') : '',
                shouldShowMerchant,
                shouldShowYear: shouldShowYearCreated,
                shouldShowYearSubmitted,
                shouldShowYearApproved,
                shouldShowYearPosted,
                shouldShowYearExported,
                isAmountColumnWide: shouldShowAmountInWideColumn,
                isTaxAmountColumnWide: shouldShowTaxAmountInWideColumn,
                isActionColumnWide: hasDeletedTransaction,
                violations: transactionViolations,
                category: isIOUReport ? '' : transactionItem?.category,
                errors: undefined,
            };

            transactionsSections.push(transactionSection);
        }
    }
    return [transactionsSections, transactionsSections.length, hasDeletedTransaction];
}

/**
 * @private
 * Retrieves all transactions associated with a specific report ID from the search data.

 */
function getTransactionsForReport(data: OnyxTypes.SearchResults['data'], reportID: string): OnyxTypes.Transaction[] {
    const transactions: OnyxTypes.Transaction[] = [];

    for (const key in data) {
        if (isTransactionEntry(key)) {
            const transaction = data[key];
            if (transaction?.reportID === reportID) {
                transactions.push(transaction);
            }
        }
    }

    return transactions;
}

/**
 * @private
 * Retrieves a report from the search data based on the provided key.
 */
function getReportFromKey(data: OnyxTypes.SearchResults['data'], key: string): OnyxTypes.Report | undefined {
    if (isTransactionEntry(key)) {
        const transaction = data[key];
        return data[`${ONYXKEYS.COLLECTION.REPORT}${transaction?.reportID}`];
    }
    if (isReportEntry(key)) {
        return data[key];
    }
    return undefined;
}

/**
 * @private
 * Retrieves the chat report associated with a given report.
 */
function getChatReport(data: OnyxTypes.SearchResults['data'], report: OnyxTypes.Report) {
    return data[`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`] ?? {};
}

/**
 * @private
 * Retrieves the policy associated with a given report.
 */
function getPolicyFromKey(data: OnyxTypes.SearchResults['data'], report: OnyxTypes.Report) {
    return data[`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`] ?? {};
}

/**
 * @private
 * Retrieves the report name-value pairs associated with a given report.
 */
function getReportNameValuePairsFromKey(data: OnyxTypes.SearchResults['data'], report: OnyxTypes.Report) {
    return data[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID}`] ?? undefined;
}

/**
 * Computes the avatar props (primaryAvatar, secondaryAvatar, avatarType) for a search report row.
 * Encapsulates the getIcons + shouldReportShowSubscript combination used in expense-report search results.
 *
 * For IOU reports under a personal policy with two user avatars (both users sent expenses),
 * the diagonal MultipleAvatars layout is used to match ReportActionAvatars behaviour.
 * For workspace IOU/expense reports both user+workspace avatars are shown via subscript layout.
 * For reports under a personal policy that are not IOU reports, subscript is suppressed.
 */
function getSearchReportAvatarProps(
    report: OnyxTypes.Report,
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'],
    personalDetailsList: OnyxTypes.PersonalDetailsList,
    policy?: OnyxTypes.Policy,
    isReportArchived = false,
) {
    const avatarIcons = getIcons(report, formatPhoneNumber, personalDetailsList, null, '', -1, policy, undefined, isReportArchived);
    const hasSecondAvatar = avatarIcons.length > 1 && !!avatarIcons.at(1)?.name;

    let avatarType: ValueOf<typeof CONST.REPORT_ACTION_AVATARS.TYPE>;

    if (isIOUReportReportUtil(report)) {
        const isPersonalPolicy = policy?.type === CONST.POLICY.TYPE.PERSONAL;
        const bothAreUserAvatars = avatarIcons.at(0)?.type === CONST.ICON_TYPE_AVATAR && avatarIcons.at(1)?.type === CONST.ICON_TYPE_AVATAR;
        if (isPersonalPolicy && bothAreUserAvatars && hasSecondAvatar) {
            // DM IOU where both users sent expenses — use diagonal MultipleAvatars to match ReportActionAvatars
            avatarType = CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_DIAGONAL;
        } else {
            avatarType = hasSecondAvatar ? CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT : CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE;
        }
    } else if (policy?.type === CONST.POLICY.TYPE.PERSONAL) {
        avatarType = CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE;
    } else {
        avatarType = shouldReportShowSubscript(report, isReportArchived) && hasSecondAvatar ? CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT : CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE;
    }

    return {
        primaryAvatar: avatarIcons.at(0),
        secondaryAvatar: avatarIcons.at(1),
        avatarType,
    };
}

/**
 * Returns the action that can be taken on a given transaction or report
 *
 * Do not use directly, use only via `getSections()` facade.
 */
function getActions(
    data: OnyxTypes.SearchResults['data'],
    allViolations: OnyxCollection<OnyxTypes.TransactionViolation[]>,
    key: string,
    currentSearch: SearchKey,
    currentUserLogin: string,
    currentUserAccountID: number,
    bankAccountList: OnyxEntry<OnyxTypes.BankAccountList>,
    reportMetadata: OnyxEntry<OnyxTypes.ReportMetadata>,
    reportActions: OnyxTypes.ReportAction[] = [],
    precomputedTransactionsForReport?: OnyxTypes.Transaction[],
): SearchTransactionAction[] {
    const isTransaction = isTransactionEntry(key);
    const report = getReportFromKey(data, key);

    if (currentSearch === CONST.SEARCH.SEARCH_KEYS.EXPORT) {
        return [CONST.SEARCH.ACTION_TYPES.EXPORT_TO_ACCOUNTING];
    }

    if (!isTransaction && !isReportEntry(key)) {
        return [CONST.SEARCH.ACTION_TYPES.VIEW];
    }

    const transaction = isTransaction ? data[key] : undefined;

    if (transaction && isDeletedTransaction(transaction)) {
        return [CONST.SEARCH.ACTION_TYPES.UNDELETE];
    }

    // Tracked and unreported expenses don't have a report, so we return early.
    if (!report) {
        return [CONST.SEARCH.ACTION_TYPES.VIEW];
    }

    const policy = getPolicyFromKey(data, report);
    const isExportAvailable = isExportAction(report, currentUserLogin, policy, reportActions) && !isTransaction;

    if (isSettled(report) && !isExportAvailable) {
        return [CONST.SEARCH.ACTION_TYPES.PAID];
    }

    // We need to check both options for a falsy value since the transaction might not have an error but the report associated with it might. We return early if there are any errors for performance reasons, so we don't need to compute any other possible actions.
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    if (transaction?.errors || report?.errors) {
        return [CONST.SEARCH.ACTION_TYPES.VIEW];
    }

    // We don't need to run the logic if this is not a transaction or iou/expense report, so let's shortcut the logic for performance reasons
    if (!isMoneyRequestReport(report) && !isInvoiceReport(report)) {
        return [CONST.SEARCH.ACTION_TYPES.VIEW];
    }

    const allActions: SearchTransactionAction[] = [];
    let allReportTransactions: OnyxTypes.Transaction[];
    if (isReportEntry(key)) {
        allReportTransactions = precomputedTransactionsForReport ?? getTransactionsForReport(data, report.reportID);
    } else {
        allReportTransactions = transaction ? [transaction] : [];
    }

    const reportNVP = getReportNameValuePairsFromKey(data, report);
    const isIOUReportArchived = isArchivedReport(reportNVP);

    const chatReportRNVP = data[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.chatReportID}`] ?? undefined;
    const isChatReportArchived = isArchivedReport(chatReportRNVP);

    // Submit/Approve/Pay can only be taken on transactions if the transaction is the only one on the report, otherwise `View` is the only option.
    // If this condition is not met, return early for performance reasons
    if (isTransaction && !isOneTransactionReport(report)) {
        return allActions.length > 0 ? allActions : [CONST.SEARCH.ACTION_TYPES.VIEW];
    }

    const invoiceReceiverPolicy: OnyxTypes.Policy | undefined =
        isInvoiceReport(report) && report?.invoiceReceiver?.type === CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS
            ? data[`${ONYXKEYS.COLLECTION.POLICY}${report?.invoiceReceiver?.policyID}`]
            : undefined;

    const chatReport = getChatReport(data, report);
    const canBePaid = canIOUBePaid(report, chatReport, policy, bankAccountList, allReportTransactions, false, chatReportRNVP, invoiceReceiverPolicy);
    const canOnlyBePaidElsewhere = canIOUBePaid(report, chatReport, policy, bankAccountList, allReportTransactions, true, chatReportRNVP, invoiceReceiverPolicy);
    const shouldOnlyShowElsewhere = !canBePaid && canOnlyBePaidElsewhere;

    // We're not supporting pay partial amount on search page now.
    if ((canBePaid || shouldOnlyShowElsewhere) && !hasHeldExpenses(report.reportID, allReportTransactions)) {
        allActions.push(CONST.SEARCH.ACTION_TYPES.PAY);
    }

    if (isExportAvailable) {
        allActions.push(CONST.SEARCH.ACTION_TYPES.EXPORT_TO_ACCOUNTING);
    }

    if (isClosedReport(report) && !(canBePaid || shouldOnlyShowElsewhere)) {
        return allActions.length > 0 ? allActions : [CONST.SEARCH.ACTION_TYPES.DONE];
    }

    const hasOnlyPendingCardOrScanningTransactions = allReportTransactions.length > 0 && allReportTransactions.every((t) => isScanning(t) || isPending(t));

    const submitToAccountID = getSubmitToAccountID(policy, report);
    const isAllowedToApproveExpenseReport = isAllowedToApproveExpenseReportUtils(report, submitToAccountID, policy);

    // We're not supporting approve partial amount on search page now
    if (
        canApproveIOU(report, policy, reportMetadata, allReportTransactions) &&
        isAllowedToApproveExpenseReport &&
        !hasOnlyPendingCardOrScanningTransactions &&
        !hasHeldExpenses(report.reportID, allReportTransactions)
    ) {
        allActions.push(CONST.SEARCH.ACTION_TYPES.APPROVE);
    }

    // We check for isAllowedToApproveExpenseReport because if the policy has preventSelfApprovals enabled, we disable the Submit action and in that case we want to show the View action instead
    if (
        canSubmitReport(report, policy, allReportTransactions, allViolations, isIOUReportArchived || isChatReportArchived, currentUserLogin, currentUserAccountID) &&
        isAllowedToApproveExpenseReport
    ) {
        allActions.push(CONST.SEARCH.ACTION_TYPES.SUBMIT);
    }

    const isApprovalEnabled = policy?.approvalMode && policy.approvalMode !== CONST.POLICY.APPROVAL_MODE.OPTIONAL;
    if (report && policy && isPolicyAdmin(policy) && isExpenseReportUtil(report) && isProcessingReport(report) && !isMoneyRequestReportPendingDeletion(report) && isApprovalEnabled) {
        allActions.push(CONST.SEARCH.ACTION_TYPES.CHANGE_APPROVER);
    }

    if (reportNVP?.exportFailedTime) {
        return allActions.length > 0 ? allActions : [CONST.SEARCH.ACTION_TYPES.VIEW];
    }

    return allActions.length > 0 ? allActions : [CONST.SEARCH.ACTION_TYPES.VIEW];
}

/**
 * @private
 * Returns the primary action to show in the Action column for a given transaction or report
 */
function getAction(allActions: SearchTransactionAction[]) {
    // Do not set CHANGE_APPROVER as the primary action as it is less frequently used than VIEW
    return allActions.find((action) => action !== CONST.SEARCH.ACTION_TYPES.CHANGE_APPROVER) ?? CONST.SEARCH.ACTION_TYPES.VIEW;
}

/**
 * @private
 * Organizes data into List Sections for display, for the TaskListItemType of Search Results.
 *
 * Do not use directly, use only via `getSections()` facade.
 */
function getTaskSections(
    data: OnyxTypes.SearchResults['data'],
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'],
    conciergeReportID: string | undefined,
    archivedReportsIDList?: ArchivedReportsIDSet,
): [TaskListItemType[], number] {
    const {shouldShowYearCreated} = shouldShowYear(data);
    const tasks = Object.keys(data)
        .filter(isReportEntry)
        // Ensure that the reports that were passed are tasks, and not some other
        // type of report that was sent as the parent
        .filter((key) => isTaskListItemType(data[key] as SearchListItem))
        .map((key) => {
            const taskItem = data[key] as SearchTask;
            const personalDetails = data.personalDetailsList;

            const assignee = personalDetails?.[taskItem.managerID] ?? emptyPersonalDetails;
            const createdBy = personalDetails?.[taskItem.accountID] ?? emptyPersonalDetails;
            const formattedAssignee = formatPhoneNumber(getDisplayNameOrDefault(assignee));
            const formattedCreatedBy = formatPhoneNumber(getDisplayNameOrDefault(createdBy));

            const report = getReportOrDraftReport(taskItem.reportID) ?? taskItem;
            const parentReport = getReportOrDraftReport(taskItem.parentReportID) ?? data[`${ONYXKEYS.COLLECTION.REPORT}${taskItem.parentReportID}`];

            const reportName = StringUtils.lineBreaksToSpaces(Parser.htmlToText(taskItem.reportName));
            const description = StringUtils.lineBreaksToSpaces(Parser.htmlToText(taskItem.description));

            const result: TaskListItemType = {
                ...taskItem,
                reportName,
                description,
                assignee,
                formattedAssignee,
                createdBy,
                formattedCreatedBy,
                keyForList: taskItem.reportID,
                shouldShowYear: shouldShowYearCreated,
            };

            if (parentReport && personalDetails) {
                const policy = data[`${ONYXKEYS.COLLECTION.POLICY}${parentReport.policyID}`];
                const isParentReportArchived = archivedReportsIDList?.has(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${parentReport?.reportID}`);
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                const parentReportName = getReportName({report: parentReport, policy, isReportArchived: isParentReportArchived, conciergeReportID});
                const icons = getIcons(parentReport, formatPhoneNumber, personalDetails, null, '', -1, policy, undefined, isParentReportArchived);
                const parentReportIcon = icons?.at(0);

                result.parentReportName = parentReportName;
                result.parentReportIcon = parentReportIcon;
            }

            if (report) {
                result.report = report;
            }

            return result;
        });
    return [tasks, tasks.length];
}

/** Creates transaction thread report and navigates to it from the search page */
function createAndOpenSearchTransactionThread(
    item: TransactionListItemType,
    introSelected: OnyxEntry<OnyxTypes.IntroSelected>,
    backTo: string,
    currentUserLogin: string,
    currentUserAccountID: number,
    betas: OnyxEntry<OnyxTypes.Beta[]>,
    IOUTransactionID?: string,
    transactionPreviewData?: TransactionPreviewData,
    shouldNavigate = true,
) {
    const isFromSelfDM = item.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
    const isDeleted = isDeletedTransaction(item);
    const iouReportAction = getIOUActionForReportID(isFromSelfDM ? findSelfDMReportID() : item.reportID, item.transactionID);
    const moneyRequestReportActionID = item.reportAction?.reportActionID ?? undefined;
    const previewData = transactionPreviewData
        ? {...transactionPreviewData, hasTransactionThreadReport: true}
        : {hasTransaction: false, hasParentReport: false, hasParentReportAction: false, hasTransactionThreadReport: true};
    setOptimisticDataForTransactionThreadPreview(item, previewData, IOUTransactionID);

    const hasActualTransactionThread = iouReportAction?.childReportID && iouReportAction?.childReportID !== CONST.FAKE_REPORT_ID;
    let transactionThreadReport;

    // The transaction thread can be created from the chat page and the snapshot data is stale
    if (hasActualTransactionThread) {
        transactionThreadReport = getReportOrDraftReport(iouReportAction.childReportID);
    }

    // Only create a new thread when there's no existing childReportID.
    // When childReportID exists but the report isn't in Onyx (e.g. search snapshot didn't include it),
    // skip creation so the navigation below falls back to the real childReportID.
    if (!transactionThreadReport && !hasActualTransactionThread) {
        const reportActionID = moneyRequestReportActionID ?? iouReportAction?.reportActionID;
        const shouldPassTransactionData = !reportActionID || isFromSelfDM;
        const transaction = shouldPassTransactionData ? getTransactionFromTransactionListItem(item) : undefined;
        const transactionViolations = shouldPassTransactionData ? item.violations : undefined;
        const reportActionToPass = iouReportAction ?? item.reportAction ?? ({reportActionID} as OnyxTypes.ReportAction);
        transactionThreadReport = createTransactionThreadReport(
            introSelected,
            currentUserLogin ?? '',
            currentUserAccountID,
            betas,
            item.report,
            reportActionToPass,
            transaction,
            transactionViolations,
        );
    }

    if (shouldNavigate) {
        // Navigate to transaction thread if there are multiple transactions in the report, or to the parent report if it's the only transaction
        const isFromOneTransactionReport = isOneTransactionReport(item.report);
        const shouldNavigateToTransactionThread = (!isFromOneTransactionReport || isFromSelfDM || isDeleted) && transactionThreadReport?.reportID !== CONST.REPORT.UNREPORTED_REPORT_ID;
        // When we have an actual transaction thread (childReportID from Onyx) but the report isn't in Onyx yet
        // (e.g. Search didn't return the IOU action for deleted items), use childReportID directly so we don't navigate with undefined
        const targetReportID = shouldNavigateToTransactionThread
            ? (transactionThreadReport?.reportID ?? (hasActualTransactionThread ? iouReportAction.childReportID : undefined))
            : item.reportID;

        if (targetReportID) {
            Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID: targetReportID, backTo})));
        }
    }
}

/**
 * @private
 * Organizes data into List Sections for display, for the ReportActionListItemType of Search Results.
 *
 * Do not use directly, use only via `getSections()` facade.
 */
function getReportActionsSections(data: OnyxTypes.SearchResults['data'], visibleReportActionsData?: OnyxTypes.VisibleReportActionsDerivedValue): [ReportActionListItemType[], number] {
    const reportActionItems: ReportActionListItemType[] = [];

    const transactions = Object.keys(data)
        .filter(isTransactionEntry)
        .map((key) => data[key]);

    const reports = Object.keys(data)
        .filter(isReportEntry)
        .map((key) => data[key]);

    let n = 0;

    for (const key in data) {
        if (isReportActionEntry(key)) {
            const reportIDFromKey = key.replace(ONYXKEYS.COLLECTION.REPORT_ACTIONS, '');
            const reportActions = Object.values(data[key]);
            n += reportActions.length;
            for (const reportAction of reportActions) {
                // Always use the container reportID so "In <chat name>" rows open the parent chat, not a child task/thread report.
                const reportID = reportIDFromKey;
                const from = reportAction.accountID ? (data.personalDetailsList?.[reportAction.accountID] ?? emptyPersonalDetails) : emptyPersonalDetails;
                const report =
                    getReportOrDraftReport(reportID) ??
                    getReportOrDraftReport(reportAction.reportID) ??
                    data[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`] ??
                    data[`${ONYXKEYS.COLLECTION.REPORT}${reportAction.reportID}`] ??
                    {};
                const policy = data[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`] ?? {};
                const originalMessage = isMoneyRequestAction(reportAction) ? getOriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.IOU>(reportAction) : undefined;
                const isSendingMoney = isMoneyRequestAction(reportAction) && originalMessage?.type === CONST.IOU.REPORT_ACTION_TYPE.PAY && originalMessage?.IOUDetails;
                const isReportArchived = isArchivedReport(data[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`]);
                const invoiceReceiverPolicy: OnyxTypes.Policy | undefined =
                    report?.invoiceReceiver?.type === CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS ? data[`${ONYXKEYS.COLLECTION.POLICY}${report.invoiceReceiver.policyID}`] : undefined;
                if (
                    !reportID ||
                    !isReportActionVisible(reportAction, reportID, canUserPerformWriteAction(report, isReportArchived), visibleReportActionsData) ||
                    isDeletedAction(reportAction) ||
                    isResolvedActionableWhisper(reportAction) ||
                    reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.CLOSED ||
                    isCreatedAction(reportAction) ||
                    isWhisperActionTargetedToOthers(reportAction) ||
                    (isMoneyRequestAction(reportAction) && !!report?.isWaitingOnBankAccount && originalMessage?.type === CONST.IOU.REPORT_ACTION_TYPE.PAY && !isSendingMoney)
                ) {
                    continue;
                }

                reportActionItems.push({
                    ...reportAction,
                    reportID,
                    from,
                    // eslint-disable-next-line @typescript-eslint/no-deprecated
                    reportName: getSearchReportName({report, policy, personalDetails: data.personalDetailsList, transactions, invoiceReceiverPolicy, reports, isReportArchived}),
                    formattedFrom: from?.displayName ?? from?.login ?? '',
                    date: reportAction.created,
                    keyForList: reportAction.reportActionID,
                } as ReportActionListItemType);
            }
        }
    }
    return [reportActionItems, n];
}

/**
 * @private
 * Organizes data into List Sections grouped by report for display, for the TransactionGroupListItemType of Search Results.
 *
 * Do not use directly, use only via `getSections()` facade.
 */
function getReportSections({
    data,
    policies,
    currentSearch,
    currentAccountID,
    currentUserEmail,
    translate,
    isOffline,
    formatPhoneNumber,
    isActionLoadingSet,
    allTransactionViolations,
    bankAccountList,
    reportActions = {},
    allReportMetadata,
    queryJSON,
    onyxPersonalDetailsList,
}: GetReportSectionsParams): [TransactionGroupListItemType[], number, boolean] {
    const {
        transactionKeys,
        reportKeys,
        violations: allViolations,
        shouldShowMerchant,
        lastExportedActionByReportID,
        moneyRequestReportActionsByTransactionID,
        holdReportActionsByTransactionID,
        transactionsByReportID,
        shouldShowYearCreated,
        shouldShowYearSubmitted,
        shouldShowYearApproved,
        shouldShowYearPosted: shouldShowYearPostedTransaction,
        shouldShowYearExported,
        shouldShowYearCreatedReport,
        shouldShowYearSubmittedReport,
        shouldShowYearApprovedReport,
        shouldShowYearExportedReport,
        shouldShowAmountInWideColumn,
        shouldShowTaxAmountInWideColumn,
        hasDeletedTransaction,
    } = classifyAndPreprocess(data);

    const currentQueryJSON = queryJSON ?? getCurrentSearchQueryJSON();
    const reportIDToTransactions: Record<string, TransactionReportGroupListItemType> = {};

    const orderedKeys: string[] = [...reportKeys, ...transactionKeys];
    const mergedPersonalDetails = {...(onyxPersonalDetailsList ?? {}), ...(data.personalDetailsList ?? {})};

    for (const key of orderedKeys) {
        if (isReportEntry(key) && (data[key].type === CONST.REPORT.TYPE.IOU || data[key].type === CONST.REPORT.TYPE.EXPENSE || data[key].type === CONST.REPORT.TYPE.INVOICE)) {
            const reportItem = {...data[key]} as OnyxTypes.Report;
            const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${reportItem.reportID}`;
            const transactions = reportIDToTransactions[reportKey]?.transactions ?? [];
            const isIOUReport = reportItem.type === CONST.REPORT.TYPE.IOU;
            const actions = reportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportItem.reportID}`];

            let shouldShow = true;

            const isActionLoading = isActionLoadingSet?.has(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportItem.reportID}`);
            if (currentQueryJSON && !isActionLoading) {
                if (currentQueryJSON.type === CONST.SEARCH.DATA_TYPES.EXPENSE) {
                    const status = currentQueryJSON.status;

                    if (Array.isArray(status)) {
                        shouldShow = status.some((expenseStatus) => {
                            return isValidExpenseStatus(expenseStatus) ? expenseStatusActionMapping[expenseStatus](reportItem) : false;
                        });
                    } else {
                        shouldShow = isValidExpenseStatus(status) ? expenseStatusActionMapping[status](reportItem) : false;
                    }
                }
            }

            if (shouldShow) {
                const reportPendingAction = reportItem?.pendingAction ?? reportItem?.pendingFields?.preview;
                const shouldShowBlankTo = !reportItem || isOpenExpenseReport(reportItem);
                const reportMetadata = allReportMetadata?.[`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportItem.reportID}`] ?? {};
                const allReportTransactions = transactionsByReportID.get(reportItem.reportID) ?? [];
                const allActions = getActions(data, allViolations, key, currentSearch, currentUserEmail, currentAccountID, bankAccountList, reportMetadata, actions, allReportTransactions);

                const fromDetails =
                    mergedPersonalDetails?.[reportItem.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID] ??
                    getPersonalDetailsForAccountID(reportItem.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID) ??
                    emptyPersonalDetails;
                const toDetails = !shouldShowBlankTo && reportItem.managerID ? mergedPersonalDetails?.[reportItem.managerID] : emptyPersonalDetails;

                const formattedFrom = formatPhoneNumber(getDisplayNameOrDefault(fromDetails));
                const formattedTo = !shouldShowBlankTo ? formatPhoneNumber(getDisplayNameOrDefault(toDetails)) : '';

                const formattedStatus = getReportStatusTranslation({stateNum: reportItem.stateNum, statusNum: reportItem.statusNum, translate});
                const policyFromKey = getPolicyFromKey(data, reportItem);
                const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${reportItem?.policyID ?? String(CONST.DEFAULT_NUMBER_ID)}`] ?? policyFromKey;

                const shouldShowStatusAsPending = !!isOffline && reportItem?.pendingFields?.nextStep === CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE;

                const hasVisibleViolationsForReport = hasVisibleViolations(
                    reportItem,
                    allTransactionViolations ?? allViolations,
                    currentUserEmail,
                    currentAccountID ?? CONST.DEFAULT_NUMBER_ID,
                    allReportTransactions,
                    policy,
                );

                const {totalDisplaySpend, nonReimbursableSpend, reimbursableSpend} = getMoneyRequestSpendBreakdown(reportItem);
                const reportIsArchived = isArchivedReport(getReportNameValuePairsFromKey(data, reportItem));
                const avatarProps = getSearchReportAvatarProps(reportItem, formatPhoneNumber, mergedPersonalDetails, policy, reportIsArchived);

                const isRejectedReport =
                    reportItem.stateNum === CONST.REPORT.STATE_NUM.OPEN &&
                    reportItem.ownerAccountID === currentAccountID &&
                    reportItem.nextStep?.messageKey === CONST.NEXT_STEP.MESSAGE_KEY.REJECTED_REPORT;

                reportIDToTransactions[reportKey] = {
                    ...reportItem,
                    action: getAction(allActions),
                    allActions,
                    keyForList: String(reportItem.reportID),
                    groupedBy: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
                    from: (fromDetails ?? emptyPersonalDetails) as OnyxTypes.PersonalDetails,
                    to: (toDetails ?? emptyPersonalDetails) as OnyxTypes.PersonalDetails,
                    exported: lastExportedActionByReportID.get(reportItem.reportID)?.created ?? '',
                    formattedFrom,
                    formattedTo,
                    formattedStatus,
                    transactions,
                    shouldShowStatusAsPending,
                    ...(reportPendingAction ? {pendingAction: reportPendingAction} : {}),
                    shouldShowYear: shouldShowYearCreatedReport,
                    shouldShowYearSubmitted: shouldShowYearSubmittedReport,
                    shouldShowYearApproved: shouldShowYearApprovedReport,
                    shouldShowYearExported: shouldShowYearExportedReport,
                    hasVisibleViolations: hasVisibleViolationsForReport,
                    isRejectedReport,
                    totalDisplaySpend,
                    nonReimbursableSpend,
                    reimbursableSpend,
                    isAmountColumnWide: shouldShowAmountInWideColumn,
                    isActionColumnWide: hasDeletedTransaction,
                    isAllScanning: false,
                    ...avatarProps,
                };

                if (isIOUReport) {
                    reportIDToTransactions[reportKey].reportName = getIOUReportName(translate, data, reportIDToTransactions[reportKey]);
                }
            }
        } else if (isTransactionEntry(key)) {
            const transactionItem = {...data[key]};
            const reportAction = moneyRequestReportActionsByTransactionID.get(transactionItem.transactionID);
            const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${transactionItem.reportID}`;
            const report = data[`${ONYXKEYS.COLLECTION.REPORT}${transactionItem.reportID}`] as OnyxTypes.Report | undefined;
            const policy = data[`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`];
            const shouldShowBlankTo = !report || isOpenExpenseReport(report);
            const transactionViolations = getTransactionViolations(allViolations, transactionItem, currentUserEmail, currentAccountID ?? CONST.DEFAULT_NUMBER_ID, report, policy);
            const actions = Object.values(reportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionItem.reportID}`] ?? {});
            const from = reportAction?.actorAccountID ? (mergedPersonalDetails?.[reportAction.actorAccountID] ?? emptyPersonalDetails) : emptyPersonalDetails;
            const to = getToFieldValueForTransaction(transactionItem, report, mergedPersonalDetails, reportAction);
            const isIOUReport = report?.type === CONST.REPORT.TYPE.IOU;

            const {formattedFrom, formattedTo, formattedTotal, formattedMerchant, date} = getTransactionItemCommonFormattedProperties(
                transactionItem,
                from,
                to,
                policy,
                formatPhoneNumber,
                report,
            );

            const transactionReportMetadata = allReportMetadata?.[`${ONYXKEYS.COLLECTION.REPORT_METADATA}${transactionItem.reportID}`] ?? {};
            const allActions = getActions(data, allViolations, key, currentSearch, currentUserEmail, currentAccountID, bankAccountList, transactionReportMetadata, actions);
            const transactionPendingAction = getTransactionPendingAction(transactionItem);
            const transaction = {
                ...transactionItem,
                ...(transactionPendingAction ? {pendingAction: transactionPendingAction} : {}),
                action: getAction(allActions),
                allActions,
                report,
                reportAction,
                holdReportAction: holdReportActionsByTransactionID.get(transactionItem.transactionID),
                policy,
                from,
                to,
                formattedFrom,
                formattedTo: shouldShowBlankTo ? '' : formattedTo,
                formattedTotal,
                formattedMerchant,
                date,
                exported: transactionItem.reportID ? (lastExportedActionByReportID.get(transactionItem.reportID)?.created ?? '') : '',
                shouldShowMerchant,
                shouldShowYear: shouldShowYearCreated || shouldShowYearCreatedReport,
                shouldShowYearSubmitted,
                shouldShowYearApproved,
                shouldShowYearPosted: shouldShowYearPostedTransaction,
                shouldShowYearExported,
                keyForList: transactionItem.transactionID,
                violations: transactionViolations,
                isAmountColumnWide: shouldShowAmountInWideColumn,
                isTaxAmountColumnWide: shouldShowTaxAmountInWideColumn,
                isActionColumnWide: hasDeletedTransaction,
                category: isIOUReport ? '' : transactionItem?.category,
                errors: undefined,
            };
            if (reportIDToTransactions[reportKey]) {
                const reportSection = reportIDToTransactions[reportKey];
                const hadTransactions = reportSection.transactions.length > 0;
                reportSection.transactions.push(transaction);
                reportSection.from = data?.personalDetailsList?.[data?.[reportKey as ReportKey]?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID] ?? emptyPersonalDetails;
                reportSection.isAllScanning = hadTransactions ? !!reportSection.isAllScanning && isScanning(transaction) : isScanning(transaction);
            }
        }
    }

    const reportIDToTransactionsValues = Object.values(reportIDToTransactions);
    return [reportIDToTransactionsValues, reportIDToTransactionsValues.length, hasDeletedTransaction];
}

function buildSpecificGroupQuery(queryJSON: SearchQueryJSON, filterKey: SearchFilterKey, filterValue: string | number): SearchQueryJSON | undefined {
    const newFlatFilters = queryJSON.flatFilters.filter((filter) => filter.key !== filterKey);
    newFlatFilters.push({key: filterKey, filters: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: filterValue}]});
    const newQueryJSON: SearchQueryJSON = {...queryJSON, groupBy: undefined, flatFilters: newFlatFilters};
    return buildSearchQueryJSON(buildSearchQueryString(newQueryJSON));
}

function getActiveGroupSearchHashes(data: OnyxTypes.SearchResults['data'] | undefined, queryJSON: SearchQueryJSON | undefined): number[] {
    if (!data || !queryJSON?.groupBy) {
        return [];
    }

    const searchHashes = new Set<number>();

    for (const [key, group] of Object.entries(data)) {
        if (!group || !isGroupEntry(key)) {
            continue;
        }

        let transactionsQueryJSON: SearchQueryJSON | undefined;

        switch (queryJSON.groupBy) {
            case CONST.SEARCH.GROUP_BY.FROM: {
                const memberGroup = group as SearchMemberGroup;
                if (memberGroup.accountID) {
                    transactionsQueryJSON = buildSpecificGroupQuery(queryJSON, CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM, memberGroup.accountID);
                }
                break;
            }
            case CONST.SEARCH.GROUP_BY.CARD: {
                const cardGroup = group as SearchCardGroup;
                if (cardGroup.cardID) {
                    transactionsQueryJSON = buildSpecificGroupQuery(queryJSON, CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID, cardGroup.cardID);
                }
                break;
            }
            case CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID: {
                const withdrawalIDGroup = group as SearchWithdrawalIDGroup;
                if (withdrawalIDGroup.entryID) {
                    transactionsQueryJSON = buildSpecificGroupQuery(queryJSON, CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_ID, withdrawalIDGroup.entryID);
                }
                break;
            }
            case CONST.SEARCH.GROUP_BY.CATEGORY: {
                const categoryGroup = group as SearchCategoryGroup;
                if (categoryGroup.category !== undefined) {
                    transactionsQueryJSON = buildSpecificGroupQuery(
                        queryJSON,
                        CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY,
                        !categoryGroup.category ? CONST.SEARCH.CATEGORY_EMPTY_VALUE : categoryGroup.category,
                    );
                }
                break;
            }
            case CONST.SEARCH.GROUP_BY.MERCHANT: {
                const merchantGroup = group as SearchMerchantGroup;
                if (merchantGroup.merchant !== undefined) {
                    transactionsQueryJSON = buildSpecificGroupQuery(
                        queryJSON,
                        CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT,
                        merchantGroup.merchant === '' ? CONST.SEARCH.MERCHANT_EMPTY_VALUE : merchantGroup.merchant,
                    );
                }
                break;
            }
            case CONST.SEARCH.GROUP_BY.TAG: {
                const tagGroup = group as SearchTagGroup;
                if (tagGroup.tag !== undefined) {
                    transactionsQueryJSON = buildSpecificGroupQuery(
                        queryJSON,
                        CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG,
                        tagGroup.tag === '' || tagGroup.tag === '(untagged)' ? CONST.SEARCH.TAG_EMPTY_VALUE : tagGroup.tag,
                    );
                }
                break;
            }
            case CONST.SEARCH.GROUP_BY.MONTH: {
                const monthGroup = group as SearchMonthGroup;
                if (monthGroup.year && monthGroup.month) {
                    transactionsQueryJSON = buildDateRangeGroupQuery(queryJSON, DateUtils.getMonthDateRange(monthGroup.year, monthGroup.month))?.transactionsQueryJSON;
                }
                break;
            }
            case CONST.SEARCH.GROUP_BY.WEEK: {
                const weekGroup = group as SearchWeekGroup;
                if (weekGroup.week) {
                    transactionsQueryJSON = buildDateRangeGroupQuery(queryJSON, DateUtils.getWeekDateRange(weekGroup.week))?.transactionsQueryJSON;
                }
                break;
            }
            case CONST.SEARCH.GROUP_BY.YEAR: {
                const yearGroup = group as SearchYearGroup;
                if (typeof yearGroup.year === 'number') {
                    transactionsQueryJSON = buildDateRangeGroupQuery(queryJSON, DateUtils.getYearDateRange(yearGroup.year))?.transactionsQueryJSON;
                }
                break;
            }
            case CONST.SEARCH.GROUP_BY.QUARTER: {
                const quarterGroup = group as SearchQuarterGroup;
                if (typeof quarterGroup.year === 'number' && typeof quarterGroup.quarter === 'number') {
                    transactionsQueryJSON = buildDateRangeGroupQuery(queryJSON, DateUtils.getQuarterDateRange(quarterGroup.year, quarterGroup.quarter))?.transactionsQueryJSON;
                }
                break;
            }
            default:
                break;
        }

        if (transactionsQueryJSON?.hash !== undefined && transactionsQueryJSON.hash >= 0) {
            searchHashes.add(transactionsQueryJSON.hash);
        }
    }

    return Array.from(searchHashes);
}

function buildDateRangeGroupQuery(queryJSON: SearchQueryJSON, dateRange: {start: string; end: string}): {transactionsQueryJSON: SearchQueryJSON | undefined; start: string; end: string} {
    const dateFilters = queryJSON.flatFilters.filter((filter) => filter.key === CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE);
    const {start, end} = adjustTimeRangeToDateFilters(dateRange, dateFilters);
    const newFlatFilters = queryJSON.flatFilters.filter((filter) => filter.key !== CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE);
    newFlatFilters.push({
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE,
        filters: [
            {operator: CONST.SEARCH.SYNTAX_OPERATORS.GREATER_THAN_OR_EQUAL_TO, value: start},
            {operator: CONST.SEARCH.SYNTAX_OPERATORS.LOWER_THAN_OR_EQUAL_TO, value: end},
        ],
    });
    const newQueryJSON: SearchQueryJSON = {...queryJSON, groupBy: undefined, flatFilters: newFlatFilters};
    const transactionsQueryJSON = buildSearchQueryJSON(buildSearchQueryString(newQueryJSON));
    return {transactionsQueryJSON, start, end};
}

/**
 * @private
 * Organizes data into List Sections grouped by member for display, for the TransactionGroupListItemType of Search Results.
 *
 * Do not use directly, use only via `getSections()` facade.
 */
function getMemberSections(
    data: OnyxTypes.SearchResults['data'],
    queryJSON: SearchQueryJSON | undefined,
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'],
): [TransactionMemberGroupListItemType[], number, boolean] {
    const memberSections: Record<string, TransactionMemberGroupListItemType> = {};

    for (const key in data) {
        if (isGroupEntry(key)) {
            const memberGroup = data[key] as SearchMemberGroup;

            const personalDetails = data.personalDetailsList?.[memberGroup.accountID] ?? emptyPersonalDetails;
            const transactionsQueryJSON = queryJSON && memberGroup.accountID ? buildSpecificGroupQuery(queryJSON, CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM, memberGroup.accountID) : undefined;

            memberSections[key] = {
                groupedBy: CONST.SEARCH.GROUP_BY.FROM,
                transactions: [],
                transactionsQueryJSON,
                ...personalDetails,
                ...memberGroup,
                formattedFrom: formatPhoneNumber(getDisplayNameOrDefault(personalDetails)),
                keyForList: key,
            };
        }
    }

    const memberSectionsValues = Object.values(memberSections);
    return [memberSectionsValues, memberSectionsValues.length, hasDeletedTransactionInData(data)];
}

function formattedCardNameWithDotAndLastFour(formattedCardName: string, lastFour: string): string {
    return `${formattedCardName} ${CONST.DOT_SEPARATOR} ${lastFour}`;
}

/**
 * @private
 * Organizes data into List Sections grouped by card for display, for the TransactionGroupListItemType of Search Results.
 *
 * Do not use directly, use only via `getSections()` facade.
 */
function getCardSections(
    data: OnyxTypes.SearchResults['data'],
    queryJSON: SearchQueryJSON | undefined,
    translate: LocalizedTranslate,
    cardFeeds?: OnyxCollection<OnyxTypes.CardFeeds>,
    customCardNames?: Record<number, string>,
): [TransactionCardGroupListItemType[], number, boolean] {
    const cardSections: Record<string, TransactionCardGroupListItemType> = {};
    const cardDescriptionByCardID = new Map<number, string>();

    for (const key in data) {
        if (isGroupEntry(key)) {
            const cardGroup = data[key] as SearchCardGroup;
            const personalDetails = data.personalDetailsList?.[cardGroup.accountID] ?? emptyPersonalDetails;
            const transactionsQueryJSON = queryJSON && cardGroup.cardID ? buildSpecificGroupQuery(queryJSON, CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID, cardGroup.cardID) : undefined;

            if (!cardGroup.cardID) {
                continue;
            }

            let formattedCardName = customCardNames?.[cardGroup.cardID];
            if (formattedCardName === undefined) {
                const cached = cardDescriptionByCardID.get(cardGroup.cardID);
                if (cached !== undefined) {
                    formattedCardName = cached;
                } else {
                    formattedCardName = getCardDescriptionForSearchTable(
                        {
                            cardID: cardGroup.cardID,
                            bank: cardGroup.bank,
                            cardName: cardGroup.cardName,
                            lastFourPAN: cardGroup.lastFourPAN,
                        } as OnyxTypes.Card,
                        translate,
                        personalDetails?.displayName,
                    );
                    cardDescriptionByCardID.set(cardGroup.cardID, formattedCardName);
                }
            } else if (cardGroup.lastFourPAN) {
                formattedCardName = formattedCardNameWithDotAndLastFour(formattedCardName, cardGroup.lastFourPAN);
            }

            cardSections[key] = {
                groupedBy: CONST.SEARCH.GROUP_BY.CARD,
                transactions: [],
                transactionsQueryJSON,
                ...personalDetails,
                ...cardGroup,
                formattedCardName,
                formattedFeedName: getFeedNameForDisplay(translate, cardGroup.bank as OnyxTypes.CompanyCardFeed, cardFeeds),
                keyForList: key,
            };
        }
    }

    const cardSectionsValues = Object.values(cardSections);
    return [cardSectionsValues, cardSectionsValues.length, hasDeletedTransactionInData(data)];
}

/**
 * @private
 * Organizes data into List Sections grouped by card for display, for the TransactionWithdrawalIDGroupListItemType of Search Results.
 *
 * Do not use directly, use only via `getSections()` facade.
 */
function getWithdrawalIDSections(data: OnyxTypes.SearchResults['data'], queryJSON: SearchQueryJSON | undefined): [TransactionWithdrawalIDGroupListItemType[], number, boolean] {
    const {shouldShowYearWithdrawn} = shouldShowYear(data);
    const withdrawalIDSections: Record<string, TransactionWithdrawalIDGroupListItemType> = {};

    for (const key in data) {
        if (isGroupEntry(key)) {
            const withdrawalIDGroup = data[key] as SearchWithdrawalIDGroup;
            const transactionsQueryJSON =
                queryJSON && withdrawalIDGroup.entryID ? buildSpecificGroupQuery(queryJSON, CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_ID, withdrawalIDGroup.entryID) : undefined;

            if (!withdrawalIDGroup.accountNumber) {
                continue;
            }

            withdrawalIDSections[key] = {
                groupedBy: CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID,
                transactions: [],
                transactionsQueryJSON,
                ...withdrawalIDGroup,
                shouldShowYearWithdrawn,
                formattedWithdrawalID: String(withdrawalIDGroup.entryID),
                keyForList: key,
            };
        }
    }

    const withdrawalIDSectionsValues = Object.values(withdrawalIDSections);
    return [withdrawalIDSectionsValues, withdrawalIDSectionsValues.length, hasDeletedTransactionInData(data)];
}

/**
 * @private
 * Organizes data into List Sections grouped by category for display, for the TransactionGroupListItemType of Search Results.
 *
 * Do not use directly, use only via `getSections()` facade.
 */
function getCategorySections(data: OnyxTypes.SearchResults['data'], queryJSON: SearchQueryJSON | undefined): [TransactionCategoryGroupListItemType[], number, boolean] {
    const categorySections: Record<string, TransactionCategoryGroupListItemType> = {};

    for (const key in data) {
        if (isGroupEntry(key)) {
            const categoryGroup = data[key] as SearchCategoryGroup;

            const transactionsQueryJSON =
                queryJSON && categoryGroup.category !== undefined
                    ? buildSpecificGroupQuery(queryJSON, CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY, !categoryGroup.category ? CONST.SEARCH.CATEGORY_EMPTY_VALUE : categoryGroup.category)
                    : undefined;

            // Format the category name - decode HTML entities for display, keep empty/none values as-is
            const rawCategory = categoryGroup.category;
            const formattedCategory = !rawCategory || rawCategory === CONST.SEARCH.CATEGORY_EMPTY_VALUE ? rawCategory : getDecodedCategoryName(rawCategory);

            categorySections[key] = {
                groupedBy: CONST.SEARCH.GROUP_BY.CATEGORY,
                transactions: [],
                transactionsQueryJSON,
                ...categoryGroup,
                formattedCategory,
                keyForList: key,
            };
        }
    }

    const categorySectionsValues = Object.values(categorySections);
    return [categorySectionsValues, categorySectionsValues.length, hasDeletedTransactionInData(data)];
}

/**
 * @private
 * Organizes data into List Sections grouped by merchant for display, for the TransactionGroupListItemType of Search Results.
 *
 * Do not use directly, use only via `getSections()` facade.
 */
function getMerchantSections(
    data: OnyxTypes.SearchResults['data'],
    queryJSON: SearchQueryJSON | undefined,
    translate: LocalizedTranslate,
): [TransactionMerchantGroupListItemType[], number, boolean] {
    const merchantSections: Record<string, TransactionMerchantGroupListItemType> = {};

    for (const key in data) {
        if (isGroupEntry(key)) {
            const merchantGroup = data[key] as SearchMerchantGroup;

            const transactionsQueryJSON =
                queryJSON && merchantGroup.merchant !== undefined
                    ? buildSpecificGroupQuery(queryJSON, CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT, merchantGroup.merchant === '' ? CONST.SEARCH.MERCHANT_EMPTY_VALUE : merchantGroup.merchant)
                    : undefined;

            // Format the merchant name - use translated "No merchant" for empty values so it sorts alphabetically
            // Handle all known empty merchant values:
            // - Empty string or falsy
            // - MERCHANT_EMPTY_VALUE ('none') - used in search queries
            // - DEFAULT_MERCHANT ('Expense') - system default for expenses without merchant
            // - PARTIAL_TRANSACTION_MERCHANT ('(none)') - used for partial/incomplete transactions
            // - UNKNOWN_MERCHANT ('Unknown Merchant') - used when merchant cannot be determined
            const rawMerchant = merchantGroup.merchant;
            const isEmptyMerchant =
                !rawMerchant || rawMerchant === CONST.SEARCH.MERCHANT_EMPTY_VALUE || rawMerchant === CONST.TRANSACTION.UNKNOWN_MERCHANT || isInvalidMerchantValue(rawMerchant);
            const formattedMerchant = isEmptyMerchant ? translate('search.noMerchant') : rawMerchant;

            merchantSections[key] = {
                groupedBy: CONST.SEARCH.GROUP_BY.MERCHANT,
                transactions: [],
                transactionsQueryJSON,
                ...merchantGroup,
                formattedMerchant,
                keyForList: key,
            };
        }
    }

    const merchantSectionsValues = Object.values(merchantSections);
    return [merchantSectionsValues, merchantSectionsValues.length, hasDeletedTransactionInData(data)];
}

/**
 * @private
 * Organizes data into List Sections grouped by tag for display, for the TransactionGroupListItemType of Search Results.
 *
 * Do not use directly, use only via `getSections()` facade.
 */
function getTagSections(data: OnyxTypes.SearchResults['data'], queryJSON: SearchQueryJSON | undefined, translate: LocalizedTranslate): [TransactionTagGroupListItemType[], number, boolean] {
    const tagSections: Record<string, TransactionTagGroupListItemType> = {};

    for (const key in data) {
        if (isGroupEntry(key)) {
            const tagGroup = data[key] as SearchTagGroup;

            const transactionsQueryJSON =
                queryJSON && tagGroup.tag !== undefined
                    ? buildSpecificGroupQuery(
                          queryJSON,
                          CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG,
                          tagGroup.tag === '' || tagGroup.tag === '(untagged)' ? CONST.SEARCH.TAG_EMPTY_VALUE : tagGroup.tag,
                      )
                    : undefined;

            // Format the tag name - use translated "No tag" for empty values so it sorts alphabetically
            const rawTag = tagGroup.tag;
            const isEmptyTag = !rawTag || rawTag === CONST.SEARCH.TAG_EMPTY_VALUE || rawTag === '(untagged)';
            const formattedTag = isEmptyTag ? translate('search.noTag') : getCommaSeparatedTagNameWithSanitizedColons(rawTag);

            tagSections[key] = {
                groupedBy: CONST.SEARCH.GROUP_BY.TAG,
                transactions: [],
                transactionsQueryJSON,
                ...tagGroup,
                formattedTag,
                keyForList: key,
            };
        }
    }

    const tagSectionsValues = Object.values(tagSections);
    return [tagSectionsValues, tagSectionsValues.length, hasDeletedTransactionInData(data)];
}

/**
 * @private
 * Organizes data into List Sections grouped by month for display, for the TransactionGroupListItemType of Search Results.
 *
 * Do not use directly, use only via `getSections()` facade.
 */
function getMonthSections(data: OnyxTypes.SearchResults['data'], queryJSON: SearchQueryJSON | undefined): [TransactionMonthGroupListItemType[], number, boolean] {
    const monthSections: Record<string, TransactionMonthGroupListItemType> = {};
    for (const key in data) {
        if (isGroupEntry(key)) {
            const monthGroup = data[key];
            if (!('year' in monthGroup) || !('month' in monthGroup)) {
                continue;
            }
            const dateResult =
                queryJSON && monthGroup.year && monthGroup.month ? buildDateRangeGroupQuery(queryJSON, DateUtils.getMonthDateRange(monthGroup.year, monthGroup.month)) : undefined;
            const transactionsQueryJSON = dateResult?.transactionsQueryJSON;

            const monthDate = new Date(monthGroup.year, monthGroup.month - 1, 1);
            const formattedMonth = format(monthDate, 'MMMM yyyy');

            monthSections[key] = {
                groupedBy: CONST.SEARCH.GROUP_BY.MONTH,
                transactions: [],
                transactionsQueryJSON,
                keyForList: key,
                ...monthGroup,
                formattedMonth,
                sortKey: monthGroup.year * 100 + monthGroup.month,
            };
        }
    }

    const monthSectionsValues = Object.values(monthSections);
    return [monthSectionsValues, monthSectionsValues.length, hasDeletedTransactionInData(data)];
}

/**
 * Returns sections for week-grouped search results.
 * Do not use directly, use only via `getSections()` facade.
 */
function getWeekSections(data: OnyxTypes.SearchResults['data'], queryJSON: SearchQueryJSON | undefined): [TransactionWeekGroupListItemType[], number, boolean] {
    const weekSections: Record<string, TransactionWeekGroupListItemType> = {};
    for (const key in data) {
        if (isGroupEntry(key)) {
            const weekGroup = data[key];
            if (!('week' in weekGroup)) {
                continue;
            }
            const rawRange = DateUtils.getWeekDateRange(weekGroup.week);
            const dateResult = queryJSON && weekGroup.week ? buildDateRangeGroupQuery(queryJSON, rawRange) : undefined;
            const transactionsQueryJSON = dateResult?.transactionsQueryJSON;
            const formattedWeek = DateUtils.getFormattedDateRangeForSearch(dateResult?.start ?? rawRange.start, dateResult?.end ?? rawRange.end);

            weekSections[key] = {
                groupedBy: CONST.SEARCH.GROUP_BY.WEEK,
                transactions: [],
                transactionsQueryJSON,
                ...weekGroup,
                formattedWeek,
                keyForList: key,
            };
        }
    }

    const weekSectionsValues = Object.values(weekSections);
    return [weekSectionsValues, weekSectionsValues.length, hasDeletedTransactionInData(data)];
}

/**
 * Returns sections for year-grouped search results.
 * Do not use directly, use only via `getSections()` facade.
 */
function getYearSections(data: OnyxTypes.SearchResults['data'], queryJSON: SearchQueryJSON | undefined): [TransactionYearGroupListItemType[], number, boolean] {
    const yearSections: Record<string, TransactionYearGroupListItemType> = {};
    for (const key in data) {
        if (isGroupEntry(key)) {
            const yearGroup = data[key];
            if (!('year' in yearGroup) || typeof yearGroup.year !== 'number') {
                continue;
            }
            const transactionsQueryJSON =
                queryJSON && yearGroup.year !== undefined ? buildDateRangeGroupQuery(queryJSON, DateUtils.getYearDateRange(yearGroup.year))?.transactionsQueryJSON : undefined;
            const formattedYear = String(yearGroup.year);

            yearSections[key] = {
                groupedBy: CONST.SEARCH.GROUP_BY.YEAR,
                transactions: [],
                transactionsQueryJSON,
                ...yearGroup,
                formattedYear,
                sortKey: yearGroup.year,
                keyForList: key,
            };
        }
    }

    const yearSectionsValues = Object.values(yearSections);
    return [yearSectionsValues, yearSectionsValues.length, hasDeletedTransactionInData(data)];
}

function getQuarterSections(data: OnyxTypes.SearchResults['data'], queryJSON: SearchQueryJSON | undefined): [TransactionQuarterGroupListItemType[], number, boolean] {
    const quarterSections: Record<string, TransactionQuarterGroupListItemType> = {};
    for (const key in data) {
        if (isGroupEntry(key)) {
            const quarterGroup = data[key];
            if (!('year' in quarterGroup) || typeof quarterGroup.year !== 'number' || !('quarter' in quarterGroup) || typeof quarterGroup.quarter !== 'number') {
                continue;
            }
            const transactionsQueryJSON =
                queryJSON && quarterGroup.year !== undefined && quarterGroup.quarter !== undefined
                    ? buildDateRangeGroupQuery(queryJSON, DateUtils.getQuarterDateRange(quarterGroup.year, quarterGroup.quarter))?.transactionsQueryJSON
                    : undefined;
            const formattedQuarter = DateUtils.getFormattedQuarterForSearch(quarterGroup.year, quarterGroup.quarter);

            quarterSections[key] = {
                groupedBy: CONST.SEARCH.GROUP_BY.QUARTER,
                transactions: [],
                transactionsQueryJSON,
                ...quarterGroup,
                formattedQuarter,
                sortKey: quarterGroup.year * 10 + quarterGroup.quarter, // Sort by year*10 + quarter (e.g., 20241, 20242, etc.)
                keyForList: key,
            };
        }
    }

    const quarterSectionsValues = Object.values(quarterSections);
    return [quarterSectionsValues, quarterSectionsValues.length, hasDeletedTransactionInData(data)];
}

/**
 * Returns the appropriate list item component based on the type and status of the search data.
 */
function getListItem(type: SearchDataTypes, status: SearchStatus, groupBy?: SearchGroupBy): ListItemType<typeof type, typeof status> {
    if (type === CONST.SEARCH.DATA_TYPES.CHAT) {
        return ChatListItem;
    }
    if (type === CONST.SEARCH.DATA_TYPES.TASK) {
        return TaskListItem;
    }
    if (type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT) {
        return ExpenseReportListItem;
    }
    if (groupBy) {
        return TransactionGroupListItem;
    }
    return TransactionListItem;
}

/**
 * Organizes data into appropriate list sections for display based on the type of search results.
 */
function getSections({
    type,
    data,
    policies,
    currentAccountID,
    currentUserEmail,
    translate,
    formatPhoneNumber,
    bankAccountList,
    groupBy,
    reportActions = {},
    currentSearch = CONST.SEARCH.SEARCH_KEYS.EXPENSES,
    archivedReportsIDList,
    queryJSON,
    isActionLoadingSet,
    isOffline,
    cardFeeds,
    customCardNames,
    allTransactionViolations,
    visibleReportActionsData,
    allReportMetadata,
    conciergeReportID,
    onyxPersonalDetailsList,
    policyForMovingExpenses,
}: GetSectionsParams): GetSectionsResult {
    if (type === CONST.SEARCH.DATA_TYPES.CHAT) {
        return [...getReportActionsSections(data, visibleReportActionsData), false];
    }
    if (type === CONST.SEARCH.DATA_TYPES.TASK) {
        return [...getTaskSections(data, formatPhoneNumber, conciergeReportID, archivedReportsIDList), false];
    }

    if (type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT) {
        return getReportSections({
            data,
            policies,
            currentSearch,
            currentAccountID,
            currentUserEmail,
            translate,
            isOffline,
            formatPhoneNumber,
            isActionLoadingSet,
            allTransactionViolations,
            bankAccountList,
            reportActions,
            allReportMetadata,
            queryJSON,
            onyxPersonalDetailsList,
        });
    }

    if (groupBy) {
        // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
        // eslint-disable-next-line default-case
        switch (groupBy) {
            case CONST.SEARCH.GROUP_BY.FROM:
                return getMemberSections(data, queryJSON, formatPhoneNumber);
            case CONST.SEARCH.GROUP_BY.CARD:
                return getCardSections(data, queryJSON, translate, cardFeeds, customCardNames);
            case CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID:
                return getWithdrawalIDSections(data, queryJSON);
            case CONST.SEARCH.GROUP_BY.CATEGORY:
                return getCategorySections(data, queryJSON);
            case CONST.SEARCH.GROUP_BY.MERCHANT:
                return getMerchantSections(data, queryJSON, translate);
            case CONST.SEARCH.GROUP_BY.TAG:
                return getTagSections(data, queryJSON, translate);
            case CONST.SEARCH.GROUP_BY.MONTH:
                return getMonthSections(data, queryJSON);
            case CONST.SEARCH.GROUP_BY.WEEK:
                return getWeekSections(data, queryJSON);
            case CONST.SEARCH.GROUP_BY.YEAR:
                return getYearSections(data, queryJSON);
            case CONST.SEARCH.GROUP_BY.QUARTER:
                return getQuarterSections(data, queryJSON);
        }
    }

    return getTransactionsSections({
        data,
        currentSearch,
        currentAccountID,
        currentUserEmail,
        formatPhoneNumber,
        isActionLoadingSet,
        bankAccountList,
        allReportMetadata,
        reportActions,
        queryJSON,
        policyForMovingExpenses,
    });
}

type GroupBySortFunction = (
    data: TransactionGroupListItemType[],
    localeCompare: LocaleContextProps['localeCompare'],
    sortBy?: SearchColumnType,
    sortOrder?: SortOrder,
) => TransactionGroupListItemType[];

function createGroupSortFunction<T extends TransactionGroupListItemType>(
    columnMapping: ColumnSortMapping<T>,
    defaultComparator: (a: T, b: T, localeCompare: LocaleContextProps['localeCompare']) => number,
): GroupBySortFunction {
    return (data, localeCompare, sortBy, sortOrder) => getSortedData(data as T[], localeCompare, columnMapping, (a, b) => defaultComparator(a, b, localeCompare), sortBy, sortOrder);
}

const groupBySortFunction: Record<SearchGroupBy, GroupBySortFunction> = {
    [CONST.SEARCH.GROUP_BY.FROM]: createGroupSortFunction<TransactionMemberGroupListItemType>(transactionMemberGroupColumnNamesToSortingProperty, (a, b, lc) =>
        lc(a.formattedFrom ?? '', b.formattedFrom ?? ''),
    ),
    [CONST.SEARCH.GROUP_BY.CARD]: createGroupSortFunction<TransactionCardGroupListItemType>(transactionCardGroupColumnNamesToSortingProperty, (a, b, lc) =>
        lc(a.formattedCardName ?? '', b.formattedCardName ?? ''),
    ),
    [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: createGroupSortFunction<TransactionWithdrawalIDGroupListItemType>(transactionWithdrawalIDGroupColumnNamesToSortingProperty, (a, b, lc) =>
        lc(a.debitPosted, b.debitPosted),
    ),
    [CONST.SEARCH.GROUP_BY.CATEGORY]: createGroupSortFunction<TransactionCategoryGroupListItemType>(transactionCategoryGroupColumnNamesToSortingProperty, (a, b, lc) =>
        lc(a.formattedCategory ?? '', b.formattedCategory ?? ''),
    ),
    [CONST.SEARCH.GROUP_BY.MERCHANT]: createGroupSortFunction<TransactionMerchantGroupListItemType>(transactionMerchantGroupColumnNamesToSortingProperty, (a, b, lc) =>
        lc(a.formattedMerchant ?? '', b.formattedMerchant ?? ''),
    ),
    [CONST.SEARCH.GROUP_BY.TAG]: createGroupSortFunction<TransactionTagGroupListItemType>(transactionTagGroupColumnNamesToSortingProperty, (a, b, lc) =>
        lc(a.formattedTag ?? '', b.formattedTag ?? ''),
    ),
    [CONST.SEARCH.GROUP_BY.MONTH]: createGroupSortFunction<TransactionMonthGroupListItemType>(transactionMonthGroupColumnNamesToSortingProperty, (a, b) => a.sortKey - b.sortKey),
    [CONST.SEARCH.GROUP_BY.WEEK]: createGroupSortFunction<TransactionWeekGroupListItemType>(transactionWeekGroupColumnNamesToSortingProperty, (a, b, lc) => lc(a.week, b.week)),
    [CONST.SEARCH.GROUP_BY.YEAR]: createGroupSortFunction<TransactionYearGroupListItemType>(transactionYearGroupColumnNamesToSortingProperty, (a, b) => a.year - b.year),
    [CONST.SEARCH.GROUP_BY.QUARTER]: createGroupSortFunction<TransactionQuarterGroupListItemType>(transactionQuarterGroupColumnNamesToSortingProperty, (a, b) => a.sortKey - b.sortKey),
};

const groupByRequiredColumns: Partial<Record<SearchGroupBy, SearchColumnType[]>> = {
    [CONST.SEARCH.GROUP_BY.FROM]: [CONST.SEARCH.TABLE_COLUMNS.AVATAR, CONST.SEARCH.TABLE_COLUMNS.GROUP_FROM],
    [CONST.SEARCH.GROUP_BY.CARD]: [CONST.SEARCH.TABLE_COLUMNS.AVATAR, CONST.SEARCH.TABLE_COLUMNS.GROUP_CARD],
    [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: [CONST.SEARCH.TABLE_COLUMNS.AVATAR, CONST.SEARCH.TABLE_COLUMNS.GROUP_WITHDRAWAL_ID],
    [CONST.SEARCH.GROUP_BY.CATEGORY]: [CONST.SEARCH.TABLE_COLUMNS.GROUP_CATEGORY],
    [CONST.SEARCH.GROUP_BY.MERCHANT]: [CONST.SEARCH.TABLE_COLUMNS.GROUP_MERCHANT],
    [CONST.SEARCH.GROUP_BY.TAG]: [CONST.SEARCH.TABLE_COLUMNS.GROUP_TAG],
    [CONST.SEARCH.GROUP_BY.MONTH]: [CONST.SEARCH.TABLE_COLUMNS.GROUP_MONTH],
    [CONST.SEARCH.GROUP_BY.WEEK]: [CONST.SEARCH.TABLE_COLUMNS.GROUP_WEEK],
    [CONST.SEARCH.GROUP_BY.YEAR]: [CONST.SEARCH.TABLE_COLUMNS.GROUP_YEAR],
    [CONST.SEARCH.GROUP_BY.QUARTER]: [CONST.SEARCH.TABLE_COLUMNS.GROUP_QUARTER],
};

/**
 * Sorts sections of data based on a specified column and sort order for displaying sorted results.
 */
function getSortedSections(
    type: SearchDataTypes,
    status: SearchStatus,
    data: ListItemDataType<typeof type, typeof status>,
    localeCompare: LocaleContextProps['localeCompare'],
    translate: LocaleContextProps['translate'],
    sortBy?: SearchColumnType,
    sortOrder?: SortOrder,
    groupBy?: SearchGroupBy,
) {
    if (type === CONST.SEARCH.DATA_TYPES.CHAT) {
        return getSortedReportActionData(data as ReportActionListItemType[], localeCompare);
    }
    if (type === CONST.SEARCH.DATA_TYPES.TASK) {
        return getSortedTaskData(data as TaskListItemType[], localeCompare, sortBy, sortOrder);
    }
    if (type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT) {
        return getSortedReportData(data as TransactionReportGroupListItemType[], localeCompare, translate, sortBy, sortOrder);
    }

    if (groupBy) {
        const sortFunction = groupBySortFunction[groupBy];
        if (sortFunction) {
            return sortFunction(data as TransactionGroupListItemType[], localeCompare, sortBy, sortOrder);
        }
    }

    return getSortedTransactionData(data as TransactionListItemType[], localeCompare, translate, sortBy, sortOrder);
}

/**
 * Compares two values based on a specified sorting order and column.
 * Handles both string and numeric comparisons.
 */
function compareValues(a: unknown, b: unknown, sortOrder: SortOrder, sortBy: string, localeCompare: LocaleContextProps['localeCompare'], shouldCompareOriginalValue = false): number {
    const isAsc = sortOrder === CONST.SEARCH.SORT_ORDER.ASC;
    const aIsEmpty = a === undefined || a === null || a === '';
    const bIsEmpty = b === undefined || b === null || b === '';

    if (aIsEmpty && bIsEmpty) {
        return 0;
    }

    if (aIsEmpty) {
        return isAsc ? -1 : 1;
    }

    if (bIsEmpty) {
        return isAsc ? 1 : -1;
    }

    if (typeof a === 'string' && typeof b === 'string') {
        return isAsc ? localeCompare(a, b) : localeCompare(b, a);
    }

    if (typeof a === 'number' && typeof b === 'number') {
        const aValue =
            (sortBy === CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT || sortBy.toLowerCase() === CONST.SEARCH.TABLE_COLUMNS.ORIGINAL_AMOUNT) && !shouldCompareOriginalValue ? Math.abs(a) : a;
        const bValue =
            (sortBy === CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT || sortBy.toLowerCase() === CONST.SEARCH.TABLE_COLUMNS.ORIGINAL_AMOUNT) && !shouldCompareOriginalValue ? Math.abs(b) : b;
        return isAsc ? aValue - bValue : bValue - aValue;
    }

    return 0;
}

/**
 * @private
 * Gets the value to use for sorting a transaction by a given property.
 * Handles special cases like comments and boolean fields (reimbursable, billable).
 */
function getTransactionSortValue(transaction: TransactionListItemType, sortingProperty: string): unknown {
    if (sortingProperty === 'comment') {
        return transaction.comment?.comment;
    }

    if (sortingProperty === 'reimbursable' || sortingProperty === 'billable') {
        const boolValue = transaction[sortingProperty as keyof TransactionListItemType];
        return boolValue ? CONST.SEARCH.BOOLEAN.YES : CONST.SEARCH.BOOLEAN.NO;
    }

    return transaction[sortingProperty as keyof TransactionListItemType];
}

/**
 * @private
 * Sorts transaction sections based on a specified column and sort order.
 */
function getSortedTransactionData(
    data: TransactionListItemType[],
    localeCompare: LocaleContextProps['localeCompare'],
    translate: LocaleContextProps['translate'],
    sortBy?: SearchColumnType,
    sortOrder?: SortOrder,
) {
    if (!sortBy || !sortOrder) {
        return data;
    }

    if (sortBy === CONST.SEARCH.TABLE_COLUMNS.REPORT_ID || sortBy === CONST.SEARCH.TABLE_COLUMNS.BASE_62_REPORT_ID) {
        return data.sort((a, b) => {
            const aValue = a.reportID;
            const bValue = b.reportID;
            return compareValues(aValue, bValue, sortOrder, sortBy, localeCompare, true);
        });
    }

    if (sortBy === CONST.SEARCH.TABLE_COLUMNS.EXPORTED_TO) {
        return data.sort((a, b) => {
            const aValue = `${!!a.exported}`;
            const bValue = `${!!b.exported}`;
            return compareValues(aValue, bValue, sortOrder, sortBy, localeCompare);
        });
    }

    const sortingProperty = transactionColumnNamesToSortingProperty[sortBy];

    if (sortBy === CONST.SEARCH.TABLE_COLUMNS.POLICY_NAME) {
        return data.sort((a, b) => {
            const aIsUnreported = a.report?.type !== CONST.REPORT.TYPE.EXPENSE && a.report?.type !== CONST.REPORT.TYPE.INVOICE;
            const bIsUnreported = b.report?.type !== CONST.REPORT.TYPE.EXPENSE && b.report?.type !== CONST.REPORT.TYPE.INVOICE;

            const aValue = !aIsUnreported ? getPolicyName({report: a.report, policy: a.policy}) : '';
            const bValue = !bIsUnreported ? getPolicyName({report: b.report, policy: b.policy}) : '';
            return compareValues(aValue, bValue, sortOrder, sortBy, localeCompare);
        });
    }

    if (sortBy === CONST.SEARCH.TABLE_COLUMNS.TITLE) {
        return data.sort((a, b) => {
            const aValue = a.report?.reportName ?? '';
            const bValue = b.report?.reportName ?? '';
            return compareValues(aValue, bValue, sortOrder, sortBy, localeCompare);
        });
    }

    if (sortBy === CONST.SEARCH.TABLE_COLUMNS.CARD) {
        return data.sort((a, b) => {
            const aValue = a.cardName === CONST.EXPENSE.TYPE.CASH_CARD_NAME ? '' : (a.cardName ?? '');
            const bValue = b.cardName === CONST.EXPENSE.TYPE.CASH_CARD_NAME ? '' : (b.cardName ?? '');
            return compareValues(aValue, bValue, sortOrder, sortBy, localeCompare);
        });
    }

    if (sortBy === CONST.SEARCH.TABLE_COLUMNS.STATUS) {
        return data.sort((a, b) => {
            const aReport = a.report;
            const bReport = b.report;

            const aValue = getReportStatusTranslation({stateNum: aReport?.stateNum, statusNum: aReport?.statusNum, translate});
            const bValue = getReportStatusTranslation({stateNum: bReport?.stateNum, statusNum: bReport?.statusNum, translate});
            return compareValues(aValue, bValue, sortOrder, sortBy, localeCompare);
        });
    }

    if (sortBy === CONST.SEARCH.TABLE_COLUMNS.EXCHANGE_RATE) {
        return data.sort((a, b) => {
            const aExchangeRate = getExchangeRate(a);
            const bExchangeRate = getExchangeRate(b);
            return compareValues(aExchangeRate, bExchangeRate, sortOrder, sortBy, localeCompare, true);
        });
    }

    if (sortBy === CONST.SEARCH.TABLE_COLUMNS.TAX_RATE) {
        return data.sort((a, b) => {
            const aValue = getTaxName(a.policy, a);
            const bValue = getTaxName(b.policy, b);
            return compareValues(aValue, bValue, sortOrder, sortBy, localeCompare);
        });
    }

    if (sortBy === CONST.SEARCH.TABLE_COLUMNS.ORIGINAL_AMOUNT) {
        return data.sort((a, b) => {
            const aValue = getOriginalAmountForDisplay(a, a.report?.type === CONST.REPORT.TYPE.EXPENSE);
            const bValue = getOriginalAmountForDisplay(b, b.report?.type === CONST.REPORT.TYPE.EXPENSE);
            return compareValues(aValue, bValue, sortOrder, sortBy, localeCompare, true);
        });
    }

    if (sortBy === CONST.SEARCH.TABLE_COLUMNS.ATTENDEES) {
        return data.sort((a, b) => {
            const aValue = a.comment?.attendees?.length ?? 0;
            const bValue = b.comment?.attendees?.length ?? 0;
            return compareValues(aValue, bValue, sortOrder, sortBy, localeCompare);
        });
    }

    if (sortBy === CONST.SEARCH.TABLE_COLUMNS.TOTAL_PER_ATTENDEE) {
        const getTotalPerAttendee = (t: TransactionListItemType) => {
            const attendeesCount = t.comment?.attendees?.length ?? 0;
            if (!attendeesCount) {
                return 0;
            }
            const totalAmount = getAmount(t, t.report?.type === CONST.REPORT.TYPE.EXPENSE);
            return totalAmount / attendeesCount;
        };

        return data.sort((a, b) => {
            const aValue = getTotalPerAttendee(a);
            const bValue = getTotalPerAttendee(b);
            return compareValues(aValue, bValue, sortOrder, sortBy, localeCompare);
        });
    }

    if (!sortingProperty) {
        return data;
    }

    return data.sort((a, b) => {
        const aValue = getTransactionSortValue(a, sortingProperty);
        const bValue = getTransactionSortValue(b, sortingProperty);

        const primaryComparison = compareValues(aValue, bValue, sortOrder, sortingProperty, localeCompare);

        if (primaryComparison !== 0) {
            return primaryComparison;
        }

        // If we have a tie in the primary comparison, we add a tie breaker on date and/or transactionID as a last resort to make the sort deterministic
        const createdComparison = compareValues(a.created, b.created, sortOrder, 'created', localeCompare);

        if (createdComparison !== 0) {
            return createdComparison;
        }

        return compareValues(a.transactionID, b.transactionID, sortOrder, 'transactionID', localeCompare);
    });
}

function getSortedTaskData(data: TaskListItemType[], localeCompare: LocaleContextProps['localeCompare'], sortBy?: SearchColumnType, sortOrder?: SortOrder) {
    if (!sortBy || !sortOrder) {
        return data;
    }

    const sortingProperty = taskColumnNamesToSortingProperty[sortBy];

    if (!sortingProperty) {
        return data;
    }

    return data.sort((a, b) => {
        const aValue = a[sortingProperty];
        const bValue = b[sortingProperty];

        return compareValues(aValue, bValue, sortOrder, sortingProperty, localeCompare);
    });
}

/**
 * @private
 * Sorts report sections based on a specified column and sort order.
 */
function getSortedReportData(
    data: TransactionReportGroupListItemType[],
    localeCompare: LocaleContextProps['localeCompare'],
    translate: LocaleContextProps['translate'],
    sortBy?: SearchColumnType,
    sortOrder?: SortOrder,
) {
    for (const report of data) {
        report.transactions = getSortedTransactionData(report.transactions, localeCompare, translate, CONST.SEARCH.TABLE_COLUMNS.DATE, CONST.SEARCH.SORT_ORDER.DESC);
    }

    if (!sortBy || !sortOrder) {
        return data.sort((a, b) => {
            if (!a.created || !b.created) {
                return 0;
            }

            return localeCompare(b.created.toLowerCase(), a.created.toLowerCase());
        });
    }

    if (sortBy === CONST.SEARCH.TABLE_COLUMNS.POLICY_NAME) {
        return data.sort((a, b) => {
            const aValue = getPolicyName({report: a});
            const bValue = getPolicyName({report: b});
            return compareValues(aValue, bValue, sortOrder, sortBy, localeCompare);
        });
    }

    if (sortBy === CONST.SEARCH.TABLE_COLUMNS.REIMBURSABLE_TOTAL) {
        return data.sort((a, b) => {
            const aTotal = a.total;
            const bTotal = b.total;

            const aNonReimbursableTotal = a.nonReimbursableTotal;
            const bNonReimbursableTotal = b.nonReimbursableTotal;

            if (aTotal == null || bTotal == null || aNonReimbursableTotal == null || bNonReimbursableTotal == null) {
                return 0;
            }

            const aValue = aTotal - aNonReimbursableTotal;
            const bValue = bTotal - bNonReimbursableTotal;
            return compareValues(aValue, bValue, sortOrder, sortBy, localeCompare);
        });
    }

    if (sortBy === CONST.SEARCH.TABLE_COLUMNS.NON_REIMBURSABLE_TOTAL) {
        return data.sort((a, b) => {
            const aNonReimbursableTotal = a.nonReimbursableTotal;
            const bNonReimbursableTotal = b.nonReimbursableTotal;
            return compareValues(aNonReimbursableTotal, bNonReimbursableTotal, sortOrder, sortBy, localeCompare);
        });
    }

    if (sortBy === CONST.SEARCH.TABLE_COLUMNS.REPORT_ID || sortBy === CONST.SEARCH.TABLE_COLUMNS.BASE_62_REPORT_ID) {
        return data.sort((a, b) => {
            const aValue = a.reportID;
            const bValue = b.reportID;
            return compareValues(aValue, bValue, sortOrder, sortBy, localeCompare, true);
        });
    }

    if (sortBy === CONST.SEARCH.TABLE_COLUMNS.EXPORTED_TO) {
        return data.sort((a, b) => {
            const aValue = `${!!a.exported}`;
            const bValue = `${!!b.exported}`;
            return compareValues(aValue, bValue, sortOrder, sortBy, localeCompare);
        });
    }

    const sortingProperty = expenseReportColumnNamesToSortingProperty[sortBy];

    if (!sortingProperty) {
        return data;
    }

    return data.sort((a, b) => {
        let aValue = a[sortingProperty];
        let bValue = b[sortingProperty];

        // When sorting by total, apply the backend logic:
        // IOU reports have positive amounts, expense reports have negative amounts
        if (sortingProperty === 'total' && typeof aValue === 'number' && typeof bValue === 'number') {
            const aNum: number = aValue;
            const bNum: number = bValue;
            aValue = a.type === CONST.REPORT.TYPE.IOU ? aNum : -aNum;
            bValue = b.type === CONST.REPORT.TYPE.IOU ? bNum : -bNum;
        }

        return compareValues(aValue, bValue, sortOrder, sortingProperty, localeCompare);
    });
}

/**
 * @private
 * Generic sorting function with column mapping and default fallback comparator
 */
function getSortedData<T extends TransactionGroupListItemType>(
    data: T[],
    localeCompare: LocaleContextProps['localeCompare'],
    columnNamesToSortingProperty: ColumnSortMapping<T>,
    defaultComparator: (a: T, b: T) => number,
    sortBy?: SearchColumnType,
    sortOrder?: SortOrder,
) {
    if (!sortBy || !sortOrder) {
        return data.sort(defaultComparator);
    }

    const sortingProperty = columnNamesToSortingProperty[sortBy];

    if (!sortingProperty) {
        return data;
    }

    return data.sort((a, b) => {
        const aValue = a[sortingProperty];
        const bValue = b[sortingProperty];

        return compareValues(aValue, bValue, sortOrder, sortingProperty as string, localeCompare);
    });
}

/**
 * @private
 * Sorts report actions sections based on a specified column and sort order.
 */
function getSortedReportActionData(data: ReportActionListItemType[], localeCompare: LocaleContextProps['localeCompare']) {
    return data.sort((a, b) => {
        const aValue = a?.created;
        const bValue = b?.created;

        if (aValue === undefined || bValue === undefined) {
            return 0;
        }

        return localeCompare(bValue.toLowerCase(), aValue.toLowerCase());
    });
}

/**
 * Checks if the search results contain any data, useful for determining if the search results are empty.
 */
function isSearchResultsEmpty(searchResults: SearchResults, groupBy?: SearchGroupBy) {
    if (groupBy) {
        return !Object.keys(searchResults?.data).some((key) => isGroupEntry(key));
    }

    if (searchResults?.search?.type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT) {
        return !Object.keys(searchResults?.data).some(
            (key) => isReportEntry(key) && (searchResults?.data[key as keyof typeof searchResults.data] as OnyxTypes.Report)?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
        );
    }

    return !Object.keys(searchResults?.data).some(
        (key) =>
            key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION) &&
            (searchResults?.data[key as keyof typeof searchResults.data] as OnyxTypes.Transaction)?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
    );
}

function getCustomColumns(value?: SearchDataTypes | SearchGroupBy): SearchCustomColumnIds[] {
    switch (value) {
        case CONST.SEARCH.DATA_TYPES.EXPENSE:
            return Object.values(CONST.SEARCH.TYPE_CUSTOM_COLUMNS.EXPENSE);
        case CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT:
            return Object.values(CONST.SEARCH.TYPE_CUSTOM_COLUMNS.EXPENSE_REPORT);
        case CONST.SEARCH.DATA_TYPES.INVOICE:
            return Object.values(CONST.SEARCH.TYPE_CUSTOM_COLUMNS.INVOICE);
        case CONST.SEARCH.DATA_TYPES.TASK:
            return Object.values(CONST.SEARCH.TYPE_CUSTOM_COLUMNS.TASK);
        case CONST.SEARCH.DATA_TYPES.TRIP:
            return Object.values(CONST.SEARCH.TYPE_CUSTOM_COLUMNS.TRIP);
        case CONST.SEARCH.DATA_TYPES.CHAT:
            return Object.values(CONST.SEARCH.TYPE_CUSTOM_COLUMNS.CHAT);
        case CONST.SEARCH.GROUP_BY.CARD:
            return Object.values(CONST.SEARCH.GROUP_CUSTOM_COLUMNS.CARD);
        case CONST.SEARCH.GROUP_BY.FROM:
            return Object.values(CONST.SEARCH.GROUP_CUSTOM_COLUMNS.FROM);
        case CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID:
            return Object.values(CONST.SEARCH.GROUP_CUSTOM_COLUMNS.WITHDRAWAL_ID);
        case CONST.SEARCH.GROUP_BY.CATEGORY:
            return Object.values(CONST.SEARCH.GROUP_CUSTOM_COLUMNS.CATEGORY);
        case CONST.SEARCH.GROUP_BY.MERCHANT:
            return Object.values(CONST.SEARCH.GROUP_CUSTOM_COLUMNS.MERCHANT);
        case CONST.SEARCH.GROUP_BY.TAG:
            return Object.values(CONST.SEARCH.GROUP_CUSTOM_COLUMNS.TAG);
        case CONST.SEARCH.GROUP_BY.MONTH:
            return Object.values(CONST.SEARCH.GROUP_CUSTOM_COLUMNS.MONTH);
        case CONST.SEARCH.GROUP_BY.WEEK:
            return Object.values(CONST.SEARCH.GROUP_CUSTOM_COLUMNS.WEEK);
        case CONST.SEARCH.GROUP_BY.YEAR:
            return Object.values(CONST.SEARCH.GROUP_CUSTOM_COLUMNS.YEAR);
        case CONST.SEARCH.GROUP_BY.QUARTER:
            return Object.values(CONST.SEARCH.GROUP_CUSTOM_COLUMNS.QUARTER);
        default:
            return [];
    }
}

function getCustomColumnDefault(value?: SearchDataTypes | SearchGroupBy): SearchCustomColumnIds[] {
    switch (value) {
        case CONST.SEARCH.DATA_TYPES.EXPENSE:
            return CONST.SEARCH.TYPE_DEFAULT_COLUMNS.EXPENSE;
        case CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT:
            return CONST.SEARCH.TYPE_DEFAULT_COLUMNS.EXPENSE_REPORT;
        case CONST.SEARCH.DATA_TYPES.INVOICE:
            return CONST.SEARCH.TYPE_DEFAULT_COLUMNS.INVOICE;
        case CONST.SEARCH.DATA_TYPES.TASK:
            return CONST.SEARCH.TYPE_DEFAULT_COLUMNS.TASK;
        case CONST.SEARCH.DATA_TYPES.TRIP:
            return CONST.SEARCH.TYPE_DEFAULT_COLUMNS.TRIP;
        case CONST.SEARCH.DATA_TYPES.CHAT:
            return CONST.SEARCH.TYPE_DEFAULT_COLUMNS.CHAT;
        case CONST.SEARCH.GROUP_BY.CARD:
            return CONST.SEARCH.GROUP_DEFAULT_COLUMNS.CARD;
        case CONST.SEARCH.GROUP_BY.FROM:
            return CONST.SEARCH.GROUP_DEFAULT_COLUMNS.FROM;
        case CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID:
            return CONST.SEARCH.GROUP_DEFAULT_COLUMNS.WITHDRAWAL_ID;
        case CONST.SEARCH.GROUP_BY.CATEGORY:
            return CONST.SEARCH.GROUP_DEFAULT_COLUMNS.CATEGORY;
        case CONST.SEARCH.GROUP_BY.MERCHANT:
            return CONST.SEARCH.GROUP_DEFAULT_COLUMNS.MERCHANT;
        case CONST.SEARCH.GROUP_BY.TAG:
            return CONST.SEARCH.GROUP_DEFAULT_COLUMNS.TAG;
        case CONST.SEARCH.GROUP_BY.MONTH:
            return CONST.SEARCH.GROUP_DEFAULT_COLUMNS.MONTH;
        case CONST.SEARCH.GROUP_BY.WEEK:
            return CONST.SEARCH.GROUP_DEFAULT_COLUMNS.WEEK;
        case CONST.SEARCH.GROUP_BY.YEAR:
            return CONST.SEARCH.GROUP_DEFAULT_COLUMNS.YEAR;
        case CONST.SEARCH.GROUP_BY.QUARTER:
            return CONST.SEARCH.GROUP_DEFAULT_COLUMNS.QUARTER;
        default:
            return [];
    }
}

function getSearchColumnTranslationKey(column: SearchColumnType): TranslationPaths {
    // eslint-disable-next-line default-case
    switch (column) {
        case CONST.SEARCH.TABLE_COLUMNS.DATE:
            return 'common.date';
        case CONST.SEARCH.TABLE_COLUMNS.SUBMITTED:
            return 'common.submitted';
        case CONST.SEARCH.TABLE_COLUMNS.APPROVED:
            return 'search.filters.approved';
        case CONST.SEARCH.TABLE_COLUMNS.POSTED:
            return 'search.filters.posted';
        case CONST.SEARCH.TABLE_COLUMNS.EXPORTED:
            return 'search.filters.exported';
        case CONST.SEARCH.TABLE_COLUMNS.MERCHANT:
            return 'common.merchant';
        case CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION:
            return 'common.description';
        case CONST.SEARCH.TABLE_COLUMNS.FROM:
            return 'common.from';
        case CONST.SEARCH.TABLE_COLUMNS.TO:
            return 'common.to';
        case CONST.SEARCH.TABLE_COLUMNS.CATEGORY:
            return 'common.category';
        case CONST.SEARCH.TABLE_COLUMNS.ATTENDEES:
            return 'iou.attendees';
        case CONST.SEARCH.TABLE_COLUMNS.TOTAL_PER_ATTENDEE:
            return 'iou.totalPerAttendee';
        case CONST.SEARCH.TABLE_COLUMNS.RECEIPT:
            return 'common.receipt';
        case CONST.SEARCH.TABLE_COLUMNS.TAG:
            return 'common.tag';
        case CONST.SEARCH.TABLE_COLUMNS.ORIGINAL_AMOUNT:
            return 'common.originalAmount';
        case CONST.SEARCH.TABLE_COLUMNS.REIMBURSABLE:
            return 'common.reimbursable';
        case CONST.SEARCH.TABLE_COLUMNS.BILLABLE:
            return 'common.billable';
        case CONST.SEARCH.TABLE_COLUMNS.ACTION:
            return 'common.action';
        case CONST.SEARCH.TABLE_COLUMNS.TITLE:
            return 'common.title';
        case CONST.SEARCH.TABLE_COLUMNS.STATUS:
            return 'common.status';
        case CONST.SEARCH.TABLE_COLUMNS.EXCHANGE_RATE:
            return 'common.exchangeRate';
        case CONST.SEARCH.TABLE_COLUMNS.POLICY_NAME:
            return 'workspace.common.workspace';
        case CONST.SEARCH.TABLE_COLUMNS.CARD:
            return 'common.card';
        case CONST.SEARCH.TABLE_COLUMNS.REIMBURSABLE_TOTAL:
            return 'common.reimbursableTotal';
        case CONST.SEARCH.TABLE_COLUMNS.NON_REIMBURSABLE_TOTAL:
            return 'common.nonReimbursableTotal';
        case CONST.SEARCH.TABLE_COLUMNS.TAX_AMOUNT:
            return 'common.tax';
        case CONST.SEARCH.TABLE_COLUMNS.TAX_RATE:
            return 'iou.taxRate';
        case CONST.SEARCH.TABLE_COLUMNS.REPORT_ID:
            return 'common.longReportID';
        case CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT:
            return 'iou.amount';
        case CONST.SEARCH.TABLE_COLUMNS.TOTAL:
            return 'common.total';
        case CONST.SEARCH.TABLE_COLUMNS.BASE_62_REPORT_ID:
            return 'common.reportID';
        case CONST.SEARCH.TABLE_COLUMNS.GROUP_WITHDRAWAL_STATUS:
            return 'common.withdrawalStatus';
        case CONST.SEARCH.TABLE_COLUMNS.GROUP_BANK_ACCOUNT:
            return 'common.bankAccount';
        case CONST.SEARCH.TABLE_COLUMNS.GROUP_CARD:
            return 'common.card';
        case CONST.SEARCH.TABLE_COLUMNS.GROUP_FROM:
            return 'common.from';
        case CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES:
            return 'common.expenses';
        case CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL:
            return 'common.total';
        case CONST.SEARCH.TABLE_COLUMNS.GROUP_WITHDRAWAL_ID:
            return 'common.withdrawalID';
        case CONST.SEARCH.TABLE_COLUMNS.GROUP_MONTH:
            return 'common.month';
        case CONST.SEARCH.TABLE_COLUMNS.GROUP_WEEK:
            return 'common.week';
        case CONST.SEARCH.TABLE_COLUMNS.GROUP_YEAR:
            return 'common.year';
        case CONST.SEARCH.TABLE_COLUMNS.GROUP_QUARTER:
            return 'common.quarter';
        case CONST.SEARCH.TABLE_COLUMNS.GROUP_WITHDRAWN:
            return 'search.filters.withdrawn';
        case CONST.SEARCH.TABLE_COLUMNS.GROUP_FEED:
            return 'search.filters.feed';
        case CONST.SEARCH.TABLE_COLUMNS.GROUP_CATEGORY:
            return 'common.category';
        case CONST.SEARCH.TABLE_COLUMNS.GROUP_MERCHANT:
            return 'common.merchant';
        case CONST.SEARCH.TABLE_COLUMNS.GROUP_TAG:
            return 'common.tag';
        case CONST.SEARCH.TABLE_COLUMNS.EXPORTED_TO:
            return 'search.exportedTo';
        default:
            // This should never happen, but TypeScript requires a default case
            return 'common.expenses' as TranslationPaths;
    }
}

function isColumnSortable(column: SearchColumnType) {
    return !nonSortableColumns.has(column);
}

type OverflowMenuIconsType = Record<'Pencil' | 'Trashcan', IconAsset>;

/**
 * Constructs and configures the overflow menu for search items, handling interactions such as renaming or deleting items.
 */
function getOverflowMenu(
    icons: OverflowMenuIconsType,
    itemName: string,
    hash: number,
    inputQuery: string,
    translate: LocalizedTranslate,
    showDeleteModal: (hash: number) => void,
    isMobileMenu?: boolean,
    closeMenu?: () => void,
) {
    return [
        {
            text: translate('common.rename'),
            onSelected: () => {
                if (isMobileMenu && closeMenu) {
                    closeMenu();
                }
                Navigation.navigate(ROUTES.SEARCH_SAVED_SEARCH_RENAME.getRoute({name: encodeURIComponent(itemName), jsonQuery: inputQuery}));
            },
            icon: icons.Pencil,
            shouldShowRightIcon: false,
            shouldShowRightComponent: false,
            shouldCallAfterModalHide: true,
        },
        {
            text: translate('common.delete'),
            onSelected: () => {
                if (isMobileMenu && closeMenu) {
                    closeMenu();
                }
                showDeleteModal(hash);
            },
            icon: icons.Trashcan,
            shouldShowRightIcon: false,
            shouldShowRightComponent: false,
            shouldCallAfterModalHide: true,
            shouldCloseAllModals: true,
        },
    ];
}

/**
 * Checks if the passed username is a correct standard username, and not a placeholder
 */
function isCorrectSearchUserName(displayName?: string) {
    return displayName && displayName.toUpperCase() !== CONST.REPORT.OWNER_EMAIL_FAKE;
}

function isTodoSearch(recentSearchHash: number, suggestedSearches: Record<string, SearchTypeMenuItem>) {
    const TODO_KEYS: SearchKey[] = [CONST.SEARCH.SEARCH_KEYS.SUBMIT, CONST.SEARCH.SEARCH_KEYS.APPROVE, CONST.SEARCH.SEARCH_KEYS.PAY, CONST.SEARCH.SEARCH_KEYS.EXPORT];
    const matchedSearchKey = Object.values(suggestedSearches).find((search) => search.recentSearchHash === recentSearchHash)?.key;
    return !!matchedSearchKey && TODO_KEYS.includes(matchedSearchKey);
}

type TypeMenuSectionsParams = {
    currentUserEmail: string | undefined;
    currentUserAccountID: number | undefined;
    cardFeedsByPolicy: Record<string, CardFeedForDisplay[]>;
    defaultCardFeed: CardFeedForDisplay | undefined;
    policies: OnyxCollection<OnyxTypes.Policy>;
    savedSearches: OnyxEntry<OnyxTypes.SaveSearch>;
    isOffline: boolean;
    defaultExpensifyCard: CardFeedForDisplay | undefined;
    shouldRedirectToExpensifyClassic: boolean;
    draftTransactionIDs: string[] | undefined;
    isTrackIntentUser: boolean;
};

function createTypeMenuSections(params: TypeMenuSectionsParams): SearchTypeMenuSection[] {
    const {
        currentUserEmail,
        currentUserAccountID,
        cardFeedsByPolicy,
        defaultCardFeed,
        policies,
        savedSearches,
        isOffline,
        defaultExpensifyCard,
        shouldRedirectToExpensifyClassic,
        draftTransactionIDs,
        isTrackIntentUser,
    } = params;
    const typeMenuSections: SearchTypeMenuSection[] = [];

    const suggestedSearches = getSuggestedSearches(currentUserAccountID, defaultCardFeed?.id);
    const {visibility: suggestedSearchesVisibility, hasGroupPoliciesWithExpenseChat} = getSuggestedSearchesVisibility(currentUserEmail, cardFeedsByPolicy, policies, defaultExpensifyCard);

    // Explore section
    {
        const exploreSection: SearchTypeMenuSection = {
            translationPath: 'common.explore',
            menuItems: [],
        };

        if (suggestedSearchesVisibility[CONST.SEARCH.SEARCH_KEYS.REPORTS]) {
            exploreSection.menuItems.push(suggestedSearches[CONST.SEARCH.SEARCH_KEYS.REPORTS]);
        }
        if (suggestedSearchesVisibility[CONST.SEARCH.SEARCH_KEYS.EXPENSES]) {
            exploreSection.menuItems.push(suggestedSearches[CONST.SEARCH.SEARCH_KEYS.EXPENSES]);
        }
        if (suggestedSearchesVisibility[CONST.SEARCH.SEARCH_KEYS.CHATS]) {
            exploreSection.menuItems.push(suggestedSearches[CONST.SEARCH.SEARCH_KEYS.CHATS]);
        }

        if (exploreSection.menuItems.length > 0) {
            typeMenuSections.push(exploreSection);
        }
    }

    // Todo section (hidden for track-intent users)
    if (!isTrackIntentUser) {
        const todoSection: SearchTypeMenuSection = {
            translationPath: 'common.todo',
            menuItems: [],
        };

        if (suggestedSearchesVisibility[CONST.SEARCH.SEARCH_KEYS.SUBMIT]) {
            todoSection.menuItems.push({
                ...suggestedSearches[CONST.SEARCH.SEARCH_KEYS.SUBMIT],
                emptyState: {
                    title: 'search.searchResults.emptySubmitResults.title',
                    subtitle: 'search.searchResults.emptySubmitResults.subtitle',
                    buttons: hasGroupPoliciesWithExpenseChat
                        ? [
                              {
                                  success: true,
                                  buttonText: 'report.newReport.createExpense',
                                  buttonAction: () => {
                                      interceptAnonymousUser(() => {
                                          if (shouldRedirectToExpensifyClassic) {
                                              setIsOpenConfirmNavigateExpensifyClassicModalOpen(true);
                                              return;
                                          }

                                          startMoneyRequest(CONST.IOU.TYPE.CREATE, generateReportID(), draftTransactionIDs, CONST.IOU.REQUEST_TYPE.SCAN);
                                      });
                                  },
                              },
                          ]
                        : [],
                },
            });
        }
        if (suggestedSearchesVisibility[CONST.SEARCH.SEARCH_KEYS.APPROVE]) {
            todoSection.menuItems.push({
                ...suggestedSearches[CONST.SEARCH.SEARCH_KEYS.APPROVE],
                emptyState: {
                    title: 'search.searchResults.emptyApproveResults.title',
                    subtitle: 'search.searchResults.emptyApproveResults.subtitle',
                },
            });
        }
        if (suggestedSearchesVisibility[CONST.SEARCH.SEARCH_KEYS.PAY]) {
            todoSection.menuItems.push({
                ...suggestedSearches[CONST.SEARCH.SEARCH_KEYS.PAY],
                emptyState: {
                    title: 'search.searchResults.emptyPayResults.title',
                    subtitle: 'search.searchResults.emptyPayResults.subtitle',
                },
            });
        }
        if (suggestedSearchesVisibility[CONST.SEARCH.SEARCH_KEYS.EXPORT]) {
            todoSection.menuItems.push({
                ...suggestedSearches[CONST.SEARCH.SEARCH_KEYS.EXPORT],
                emptyState: {
                    title: 'search.searchResults.emptyExportResults.title',
                    subtitle: 'search.searchResults.emptyExportResults.subtitle',
                },
            });
        }

        if (todoSection.menuItems.length > 0) {
            typeMenuSections.push(todoSection);
        }
    }

    // Monthly accrual section
    {
        const monthlyAccrualSection: SearchTypeMenuSection = {
            translationPath: 'search.monthlyAccrual',
            menuItems: [],
        };

        if (suggestedSearchesVisibility[CONST.SEARCH.SEARCH_KEYS.UNAPPROVED_CASH]) {
            monthlyAccrualSection.menuItems.push({
                ...suggestedSearches[CONST.SEARCH.SEARCH_KEYS.UNAPPROVED_CASH],
                emptyState: {
                    title: 'search.searchResults.emptyUnapprovedResults.title',
                    subtitle: 'search.searchResults.emptyUnapprovedResults.subtitle',
                },
            });
        }
        if (suggestedSearchesVisibility[CONST.SEARCH.SEARCH_KEYS.UNAPPROVED_CARD]) {
            monthlyAccrualSection.menuItems.push({
                ...suggestedSearches[CONST.SEARCH.SEARCH_KEYS.UNAPPROVED_CARD],
                emptyState: {
                    title: 'search.searchResults.emptyUnapprovedResults.title',
                    subtitle: 'search.searchResults.emptyUnapprovedResults.subtitle',
                },
            });
        }

        if (monthlyAccrualSection.menuItems.length > 0) {
            typeMenuSections.push(monthlyAccrualSection);
        }
    }

    // Reconciliation section
    {
        const reconciliationSection: SearchTypeMenuSection = {
            translationPath: 'search.reconciliation',
            menuItems: [],
        };

        if (suggestedSearchesVisibility[CONST.SEARCH.SEARCH_KEYS.STATEMENTS]) {
            reconciliationSection.menuItems.push({
                ...suggestedSearches[CONST.SEARCH.SEARCH_KEYS.STATEMENTS],
                emptyState: {
                    title: 'search.searchResults.emptyStatementsResults.title',
                    subtitle: 'search.searchResults.emptyStatementsResults.subtitle',
                },
            });
        }
        if (suggestedSearchesVisibility[CONST.SEARCH.SEARCH_KEYS.EXPENSIFY_CARD]) {
            reconciliationSection.menuItems.push({
                ...suggestedSearches[CONST.SEARCH.SEARCH_KEYS.EXPENSIFY_CARD],
                emptyState: {
                    title: 'search.searchResults.emptyStatementsResults.title',
                    subtitle: 'search.searchResults.emptyStatementsResults.subtitle',
                },
            });
        }
        if (suggestedSearchesVisibility[CONST.SEARCH.SEARCH_KEYS.RECONCILIATION]) {
            reconciliationSection.menuItems.push({
                ...suggestedSearches[CONST.SEARCH.SEARCH_KEYS.RECONCILIATION],
                emptyState: {
                    title: 'search.searchResults.emptyStatementsResults.title',
                    subtitle: 'search.searchResults.emptyStatementsResults.subtitle',
                },
            });
        }

        if (reconciliationSection.menuItems.length > 0) {
            typeMenuSections.push(reconciliationSection);
        }
    }

    // Saved section
    {
        const shouldShowSavedSearchesMenuItemTitle = Object.values(savedSearches ?? {}).filter((s) => s.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || isOffline).length > 0;

        if (shouldShowSavedSearchesMenuItemTitle) {
            const savedSection: SearchTypeMenuSection = {
                translationPath: 'search.savedSearchesMenuItemTitle',
                menuItems: [],
            };

            typeMenuSections.push(savedSection);
        }
    }

    // Insights section
    {
        const insightsSection: SearchTypeMenuSection = {
            translationPath: 'common.insights',
            menuItems: [],
        };

        const insightsSearchKeys = [
            CONST.SEARCH.SEARCH_KEYS.SPEND_OVER_TIME,
            ...(!isTrackIntentUser ? [CONST.SEARCH.SEARCH_KEYS.TOP_SPENDERS] : []),
            CONST.SEARCH.SEARCH_KEYS.TOP_CATEGORIES,
            CONST.SEARCH.SEARCH_KEYS.TOP_MERCHANTS,
        ];

        for (const key of insightsSearchKeys) {
            if (!suggestedSearchesVisibility[key]) {
                continue;
            }

            insightsSection.menuItems.push({
                ...suggestedSearches[key],
                emptyState: {
                    title: 'search.searchResults.emptyResults.title',
                    subtitle: 'search.searchResults.emptyResults.subtitle',
                },
            });
        }

        if (insightsSection.menuItems.length > 0) {
            typeMenuSections.push(insightsSection);
        }
    }

    return typeMenuSections;
}

function createBaseSavedSearchMenuItem(item: SaveSearchItem, key: string, index: number, title: string, isFocused: boolean): SavedSearchMenuItem {
    return {
        key,
        title,
        hash: key,
        query: item.query,
        shouldShowRightComponent: true,
        focused: isFocused,
        pendingAction: item.pendingAction,
        disabled: item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
        shouldIconUseAutoWidthStyle: true,
    };
}

/**
 * Whether to show the empty state or not
 */
function shouldShowEmptyState(isDataLoaded: boolean, dataLength: number, type: SearchDataTypes | undefined) {
    return !isDataLoaded || dataLength === 0 || !type || !Object.values(CONST.SEARCH.DATA_TYPES).includes(type);
}

function isSearchDataLoaded(searchResults: SearchResults | undefined, queryJSON: SearchQueryJSON | undefined) {
    const {status} = queryJSON ?? {};

    const sortedSearchResultStatus = !Array.isArray(searchResults?.search?.status)
        ? searchResults?.search?.status?.split(',').sort().join(',')
        : searchResults?.search?.status?.sort().join(',');
    const sortedQueryJSONStatus = Array.isArray(status) ? status.sort().join(',') : status;
    const isDataLoaded =
        (searchResults?.data != null || searchResults?.errors != null) && searchResults?.search?.type === queryJSON?.type && sortedSearchResultStatus === sortedQueryJSONStatus;

    return isDataLoaded;
}

function getValidGroupBy(groupBy: string | undefined): ValueOf<typeof CONST.SEARCH.GROUP_BY> | undefined {
    return groupBy && Object.values(CONST.SEARCH.GROUP_BY).includes(groupBy as ValueOf<typeof CONST.SEARCH.GROUP_BY>) ? (groupBy as ValueOf<typeof CONST.SEARCH.GROUP_BY>) : undefined;
}

function getStatusOptions(translate: LocalizedTranslate, type: SearchDataTypes) {
    switch (type) {
        case CONST.SEARCH.DATA_TYPES.INVOICE:
            return getInvoiceStatusOptions(translate);
        case CONST.SEARCH.DATA_TYPES.TRIP:
            return getTripStatusOptions(translate);
        case CONST.SEARCH.DATA_TYPES.TASK:
            return getTaskStatusOptions(translate);
        case CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT:
            return getExpenseReportedStatusOptions(translate);
        case CONST.SEARCH.DATA_TYPES.EXPENSE:
        default:
            return getExpenseStatusOptions(translate);
    }
}

function getHasOptions(translate: LocalizedTranslate, type: SearchDataTypes) {
    switch (type) {
        case CONST.SEARCH.DATA_TYPES.EXPENSE:
            return [
                {text: translate('common.receipt'), value: CONST.SEARCH.HAS_VALUES.RECEIPT},
                {text: translate('common.attachment'), value: CONST.SEARCH.HAS_VALUES.ATTACHMENT},
                {text: translate('common.tag'), value: CONST.SEARCH.HAS_VALUES.TAG},
                {text: translate('common.category'), value: CONST.SEARCH.HAS_VALUES.CATEGORY},
            ];
        case CONST.SEARCH.DATA_TYPES.CHAT:
            return [
                {text: translate('common.link'), value: CONST.SEARCH.HAS_VALUES.LINK},
                {text: translate('common.attachment'), value: CONST.SEARCH.HAS_VALUES.ATTACHMENT},
            ];
        default:
            return [];
    }
}

function getTypeOptions(translate: LocalizedTranslate, policies: OnyxCollection<OnyxTypes.Policy>, currentUserLogin?: string) {
    const typeOptions: Array<SingleSelectItem<SearchDataTypes>> = [
        {text: translate('common.expense'), value: CONST.SEARCH.DATA_TYPES.EXPENSE},
        {text: translate('common.expenseReport'), value: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT},
        {text: translate('common.chat'), value: CONST.SEARCH.DATA_TYPES.CHAT},
        {text: translate('common.invoice'), value: CONST.SEARCH.DATA_TYPES.INVOICE},
        {text: translate('common.trip'), value: CONST.SEARCH.DATA_TYPES.TRIP},
        {text: translate('common.task'), value: CONST.SEARCH.DATA_TYPES.TASK},
    ];
    const shouldHideInvoiceOption = !canSendInvoice(policies, currentUserLogin) && !hasInvoiceReports();

    // Remove the invoice option if the user is not allowed to send invoices
    return shouldHideInvoiceOption ? typeOptions.filter((typeOption) => typeOption.value !== CONST.SEARCH.DATA_TYPES.INVOICE) : typeOptions;
}

function getGroupByOptions(translate: LocalizedTranslate) {
    return Object.values(CONST.SEARCH.GROUP_BY).map<SingleSelectItem<SearchGroupBy>>((value) => ({text: translate(`search.filters.groupBy.${value}`), value}));
}

function getSortByOptions(columns: SearchColumnType[], translate: LocalizedTranslate) {
    const sortableColumns: Array<SingleSelectItem<SearchColumnType>> = [];
    for (const column of columns) {
        if (isColumnSortable(column)) {
            sortableColumns.push({text: translate(getSearchColumnTranslationKey(column)), value: column});
        }
    }
    return sortableColumns;
}

function getSortOrderOptions(translate: LocalizedTranslate) {
    return Object.values(CONST.SEARCH.SORT_ORDER).map<SingleSelectItem<SortOrder>>((value) => ({text: translate(`search.filters.sortOrder.${value}`), value}));
}

function getGroupBySections(translate: LocalizedTranslate): GroupBySection[] {
    const getOption = (groupBy: SearchGroupBy): SingleSelectItem<SearchGroupBy> => ({
        text: translate(`search.filters.groupBy.${groupBy}`),
        value: groupBy,
    });
    return [
        {
            options: [getOption(CONST.SEARCH.GROUP_BY.FROM), getOption(CONST.SEARCH.GROUP_BY.CARD)],
        },
        {
            options: [getOption(CONST.SEARCH.GROUP_BY.CATEGORY), getOption(CONST.SEARCH.GROUP_BY.MERCHANT), getOption(CONST.SEARCH.GROUP_BY.TAG)],
        },
        {
            options: [getOption(CONST.SEARCH.GROUP_BY.MONTH), getOption(CONST.SEARCH.GROUP_BY.WEEK), getOption(CONST.SEARCH.GROUP_BY.YEAR), getOption(CONST.SEARCH.GROUP_BY.QUARTER)],
        },
        {
            options: [getOption(CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID)],
        },
    ].map((section, sectionIndex) => ({
        ...section,
        sectionIndex,
    }));
}

function getViewOptions(translate: LocalizedTranslate) {
    return Object.values(CONST.SEARCH.VIEW).map<SingleSelectItem<SearchView>>((value) => ({text: translate(`search.view.${value}`), value}));
}

function getCurrencyOptions(currencyList: OnyxTypes.CurrencyList, getCurrencySymbol: CurrencyListActionsContextType['getCurrencySymbol']) {
    return Object.keys(currencyList).reduce(
        (options, currencyCode) => {
            if (!currencyList?.[currencyCode]?.retired) {
                options.push({text: `${currencyCode} - ${getCurrencySymbol(currencyCode)}`, value: currencyCode});
            }

            return options;
        },
        [] as Array<SingleSelectItem<string>>,
    );
}

function getFeedOptions(
    allCardFeeds: OnyxCollection<OnyxTypes.CardFeeds>,
    allCards: OnyxTypes.CardList | undefined,
    translate: LocalizedTranslate,
    localeCompare: LocaleContextProps['localeCompare'],
    feedKeysWithCards?: FeedKeysWithAssignedCards,
) {
    return Object.values(getCardFeedsForDisplay(allCardFeeds, allCards, translate, feedKeysWithCards))
        .map<SingleSelectItem<string>>((cardFeed) => ({
            text: cardFeed.name,
            value: cardFeed.id,
        }))
        .sort((a, b) => localeCompare(a.text, b.text));
}

function getDatePresets(filterKey: SearchDateFilterKeys, hasFeed: boolean): SearchDatePreset[] {
    const commonPresets = [CONST.SEARCH.DATE_PRESETS.THIS_MONTH, CONST.SEARCH.DATE_PRESETS.LAST_MONTH, CONST.SEARCH.DATE_PRESETS.YEAR_TO_DATE, CONST.SEARCH.DATE_PRESETS.LAST_12_MONTHS];

    switch (filterKey) {
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE:
            return commonPresets;
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.POSTED:
            return [...commonPresets, CONST.SEARCH.DATE_PRESETS.NEVER, ...(hasFeed ? [CONST.SEARCH.DATE_PRESETS.LAST_STATEMENT] : [])];
        default:
            return [...commonPresets, CONST.SEARCH.DATE_PRESETS.NEVER];
    }
}

/**
 * Returns the start and end date range for a date preset.
 */
function getDateRangeForPreset(preset: SearchDatePreset): {start: string; end: string} {
    const now = new Date();
    let start: Date;
    let end: Date;
    const lastMonth = subMonths(now, 1);

    switch (preset) {
        case CONST.SEARCH.DATE_PRESETS.THIS_MONTH:
            start = startOfMonth(now);
            end = endOfMonth(now);
            break;
        case CONST.SEARCH.DATE_PRESETS.LAST_MONTH:
            start = startOfMonth(lastMonth);
            end = endOfMonth(lastMonth);
            break;
        case CONST.SEARCH.DATE_PRESETS.YEAR_TO_DATE:
            start = startOfYear(now);
            end = now;
            break;
        case CONST.SEARCH.DATE_PRESETS.LAST_12_MONTHS:
            start = startOfMonth(subMonths(now, 11));
            end = endOfMonth(now);
            break;
        default:
            return {start: '', end: ''};
    }

    return {
        start: format(start, 'yyyy-MM-dd'),
        end: format(end, 'yyyy-MM-dd'),
    };
}

/**
 * Checks if a string value is a date preset
 */
function isDatePreset(value: string | number | undefined): value is SearchDatePreset {
    if (typeof value !== 'string') {
        return false;
    }
    return Object.values(CONST.SEARCH.DATE_PRESETS).some((datePreset) => datePreset === value);
}

/**
 * Adjusts a time range based on date filters, intersecting preset ranges with additional constraints.
 * When combining date presets (e.g., `date:on=last_month`) with constraints (e.g., `date:>=2025-04-01`),
 * takes the intersection to narrow the range rather than overwriting it.
 *
 * @param timeRange - The base time range to adjust (e.g., a year/month/quarter range)
 * @param flatFilters - Optional array of date filter objects from the search query
 * @returns Adjusted time range that respects all date filters (intersected, not overwritten)
 */
function adjustTimeRangeToDateFilters(timeRange: {start: string; end: string}, dateFilters: QueryFilters | undefined): {start: string; end: string} {
    if (!dateFilters || dateFilters.length === 0) {
        return timeRange;
    }

    const flattenFilters = dateFilters.flatMap((filter) => filter.filters || []);

    const {start: timeRangeStart, end: timeRangeEnd} = timeRange;
    const equalToFilter = flattenFilters.find((filter) => filter.operator === CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO);

    let limitsStart: string | undefined;
    let limitsEnd: string | undefined;
    // Date presets come with the equals operator, so we need to check if the value is a date preset
    if (equalToFilter?.value) {
        const value = String(equalToFilter.value);
        if (isDatePreset(value)) {
            const presetRange = getDateRangeForPreset(value);
            limitsStart = presetRange.start || undefined;
            limitsEnd = presetRange.end || undefined;
        } else {
            limitsStart = value;
            limitsEnd = value;
        }
    }

    let startLimitFilter = flattenFilters.find((filter) => filter.operator === CONST.SEARCH.SYNTAX_OPERATORS.GREATER_THAN_OR_EQUAL_TO);
    if (startLimitFilter?.value) {
        const constraintStart = String(startLimitFilter.value);
        if (limitsStart) {
            limitsStart = limitsStart > constraintStart ? limitsStart : constraintStart;
        } else {
            limitsStart = constraintStart;
        }
    }

    startLimitFilter = flattenFilters.find((filter) => filter.operator === CONST.SEARCH.SYNTAX_OPERATORS.GREATER_THAN);
    if (startLimitFilter?.value) {
        const date = parse(String(startLimitFilter.value), 'yyyy-MM-dd', new Date());
        const constraintStart = format(addDays(date, 1), 'yyyy-MM-dd');
        if (limitsStart) {
            limitsStart = limitsStart > constraintStart ? limitsStart : constraintStart;
        } else {
            limitsStart = constraintStart;
        }
    }

    let endLimitFilter = flattenFilters.find((filter) => filter.operator === CONST.SEARCH.SYNTAX_OPERATORS.LOWER_THAN_OR_EQUAL_TO);
    if (endLimitFilter?.value) {
        const constraintEnd = String(endLimitFilter.value);
        if (limitsEnd) {
            limitsEnd = limitsEnd < constraintEnd ? limitsEnd : constraintEnd;
        } else {
            limitsEnd = constraintEnd;
        }
    }

    endLimitFilter = flattenFilters.find((filter) => filter.operator === CONST.SEARCH.SYNTAX_OPERATORS.LOWER_THAN);
    if (endLimitFilter?.value) {
        const date = parse(String(endLimitFilter.value), 'yyyy-MM-dd', new Date());
        const constraintEnd = format(subDays(date, 1), 'yyyy-MM-dd');
        if (limitsEnd) {
            limitsEnd = limitsEnd < constraintEnd ? limitsEnd : constraintEnd;
        } else {
            limitsEnd = constraintEnd;
        }
    }

    let adjustedStart = timeRangeStart;
    if (limitsStart && limitsStart > timeRangeStart) {
        adjustedStart = limitsStart;
    }

    let adjustedEnd = timeRangeEnd;
    if (limitsEnd && limitsEnd < timeRangeEnd) {
        adjustedEnd = limitsEnd;
    }

    return {
        start: adjustedStart,
        end: adjustedEnd,
    };
}

type SearchFilter = {
    key: SearchAdvancedFiltersKey;
    label: string;
    value: string | string[] | null;
};

type FilterGroupConfig = {
    label: TranslationPaths;
    syntax: SearchDateFilterKeys | SearchAmountFilterKeys;
};

const FILTER_GROUP_MAP: Partial<Record<SearchAdvancedFiltersKey, FilterGroupConfig>> = {
    [FILTER_KEYS.DATE_ON]: {label: 'common.date', syntax: CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE},
    [FILTER_KEYS.DATE_AFTER]: {label: 'common.date', syntax: CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE},
    [FILTER_KEYS.DATE_BEFORE]: {label: 'common.date', syntax: CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE},
    [FILTER_KEYS.DATE_RANGE]: {label: 'common.date', syntax: CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE},

    [FILTER_KEYS.SUBMITTED_ON]: {label: 'search.filters.submitted', syntax: CONST.SEARCH.SYNTAX_FILTER_KEYS.SUBMITTED},
    [FILTER_KEYS.SUBMITTED_AFTER]: {label: 'search.filters.submitted', syntax: CONST.SEARCH.SYNTAX_FILTER_KEYS.SUBMITTED},
    [FILTER_KEYS.SUBMITTED_BEFORE]: {label: 'search.filters.submitted', syntax: CONST.SEARCH.SYNTAX_FILTER_KEYS.SUBMITTED},
    [FILTER_KEYS.SUBMITTED_RANGE]: {label: 'search.filters.submitted', syntax: CONST.SEARCH.SYNTAX_FILTER_KEYS.SUBMITTED},

    [FILTER_KEYS.APPROVED_ON]: {label: 'search.filters.approved', syntax: CONST.SEARCH.SYNTAX_FILTER_KEYS.APPROVED},
    [FILTER_KEYS.APPROVED_AFTER]: {label: 'search.filters.approved', syntax: CONST.SEARCH.SYNTAX_FILTER_KEYS.APPROVED},
    [FILTER_KEYS.APPROVED_BEFORE]: {label: 'search.filters.approved', syntax: CONST.SEARCH.SYNTAX_FILTER_KEYS.APPROVED},
    [FILTER_KEYS.APPROVED_RANGE]: {label: 'search.filters.approved', syntax: CONST.SEARCH.SYNTAX_FILTER_KEYS.APPROVED},

    [FILTER_KEYS.PAID_ON]: {label: 'search.filters.paid', syntax: CONST.SEARCH.SYNTAX_FILTER_KEYS.PAID},
    [FILTER_KEYS.PAID_AFTER]: {label: 'search.filters.paid', syntax: CONST.SEARCH.SYNTAX_FILTER_KEYS.PAID},
    [FILTER_KEYS.PAID_BEFORE]: {label: 'search.filters.paid', syntax: CONST.SEARCH.SYNTAX_FILTER_KEYS.PAID},
    [FILTER_KEYS.PAID_RANGE]: {label: 'search.filters.paid', syntax: CONST.SEARCH.SYNTAX_FILTER_KEYS.PAID},

    [FILTER_KEYS.EXPORTED_ON]: {label: 'search.filters.exported', syntax: CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPORTED},
    [FILTER_KEYS.EXPORTED_AFTER]: {label: 'search.filters.exported', syntax: CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPORTED},
    [FILTER_KEYS.EXPORTED_BEFORE]: {label: 'search.filters.exported', syntax: CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPORTED},
    [FILTER_KEYS.EXPORTED_RANGE]: {label: 'search.filters.exported', syntax: CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPORTED},

    [FILTER_KEYS.POSTED_ON]: {label: 'search.filters.posted', syntax: CONST.SEARCH.SYNTAX_FILTER_KEYS.POSTED},
    [FILTER_KEYS.POSTED_AFTER]: {label: 'search.filters.posted', syntax: CONST.SEARCH.SYNTAX_FILTER_KEYS.POSTED},
    [FILTER_KEYS.POSTED_BEFORE]: {label: 'search.filters.posted', syntax: CONST.SEARCH.SYNTAX_FILTER_KEYS.POSTED},
    [FILTER_KEYS.POSTED_RANGE]: {label: 'search.filters.posted', syntax: CONST.SEARCH.SYNTAX_FILTER_KEYS.POSTED},

    [FILTER_KEYS.WITHDRAWN_ON]: {label: 'search.filters.withdrawn', syntax: CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWN},
    [FILTER_KEYS.WITHDRAWN_AFTER]: {label: 'search.filters.withdrawn', syntax: CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWN},
    [FILTER_KEYS.WITHDRAWN_BEFORE]: {label: 'search.filters.withdrawn', syntax: CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWN},
    [FILTER_KEYS.WITHDRAWN_RANGE]: {label: 'search.filters.withdrawn', syntax: CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWN},

    [FILTER_KEYS.AMOUNT_EQUAL_TO]: {label: 'iou.amount', syntax: CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT},
    [FILTER_KEYS.AMOUNT_LESS_THAN]: {label: 'iou.amount', syntax: CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT},
    [FILTER_KEYS.AMOUNT_GREATER_THAN]: {label: 'iou.amount', syntax: CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT},

    [FILTER_KEYS.TOTAL_EQUAL_TO]: {label: 'common.total', syntax: CONST.SEARCH.SYNTAX_FILTER_KEYS.TOTAL},
    [FILTER_KEYS.TOTAL_LESS_THAN]: {label: 'common.total', syntax: CONST.SEARCH.SYNTAX_FILTER_KEYS.TOTAL},
    [FILTER_KEYS.TOTAL_GREATER_THAN]: {label: 'common.total', syntax: CONST.SEARCH.SYNTAX_FILTER_KEYS.TOTAL},

    [FILTER_KEYS.PURCHASE_AMOUNT_EQUAL_TO]: {label: 'common.purchaseAmount', syntax: CONST.SEARCH.SYNTAX_FILTER_KEYS.PURCHASE_AMOUNT},
    [FILTER_KEYS.PURCHASE_AMOUNT_LESS_THAN]: {label: 'common.purchaseAmount', syntax: CONST.SEARCH.SYNTAX_FILTER_KEYS.PURCHASE_AMOUNT},
    [FILTER_KEYS.PURCHASE_AMOUNT_GREATER_THAN]: {label: 'common.purchaseAmount', syntax: CONST.SEARCH.SYNTAX_FILTER_KEYS.PURCHASE_AMOUNT},
};

const FILTER_LABEL_MAP: Partial<Record<SearchAdvancedFiltersKey, TranslationPaths>> = {
    [FILTER_KEYS.ASSIGNEE]: 'task.assignee',
    [FILTER_KEYS.ATTENDEE]: 'iou.attendees',
    [FILTER_KEYS.BILLABLE]: 'search.filters.billable',
    [FILTER_KEYS.CARD_ID]: 'common.card',
    [FILTER_KEYS.CATEGORY]: 'common.category',
    [FILTER_KEYS.CURRENCY]: 'common.currency',
    [FILTER_KEYS.DESCRIPTION]: 'common.description',
    [FILTER_KEYS.EXPENSE_TYPE]: 'search.expenseType',
    [FILTER_KEYS.EXPORTED_TO]: 'search.exportedTo',
    [FILTER_KEYS.FEED]: 'search.filters.feed',
    [FILTER_KEYS.FROM]: 'common.from',
    [FILTER_KEYS.GROUP_CURRENCY]: 'common.groupCurrency',
    [FILTER_KEYS.HAS]: 'search.has',
    [FILTER_KEYS.IN]: 'common.in',
    [FILTER_KEYS.IS]: 'search.filters.is',
    [FILTER_KEYS.KEYWORD]: 'search.filters.keyword',
    [FILTER_KEYS.MERCHANT]: 'common.merchant',
    [FILTER_KEYS.POLICY_ID]: 'workspace.common.workspace',
    [FILTER_KEYS.PURCHASE_CURRENCY]: 'search.filters.purchaseCurrency',
    [FILTER_KEYS.REIMBURSABLE]: 'common.reimbursable',
    [FILTER_KEYS.REPORT_ID]: 'common.reportID',
    [FILTER_KEYS.STATUS]: 'common.status',
    [FILTER_KEYS.TAG]: 'common.tag',
    [FILTER_KEYS.TAX_RATE]: 'workspace.taxes.taxRate',
    [FILTER_KEYS.TYPE]: 'common.type',
    [FILTER_KEYS.TO]: 'common.to',
    [FILTER_KEYS.TITLE]: 'common.title',
    [FILTER_KEYS.WITHDRAWAL_ID]: 'common.withdrawalID',
    [FILTER_KEYS.WITHDRAWAL_TYPE]: 'search.withdrawalType',
};

function getDateDisplayValue(syntaxKey: SearchDateFilterKeys, form: Partial<SearchAdvancedFiltersForm>, translate: LocalizedTranslate): string {
    const on = form[`${syntaxKey}${CONST.SEARCH.DATE_MODIFIERS.ON}`];
    const after = form[`${syntaxKey}${CONST.SEARCH.DATE_MODIFIERS.AFTER}`];
    const before = form[`${syntaxKey}${CONST.SEARCH.DATE_MODIFIERS.BEFORE}`];
    const range = form[`${syntaxKey}${CONST.SEARCH.DATE_MODIFIERS.RANGE}`];
    const parts: string[] = [];

    if (on) {
        parts.push(isSearchDatePreset(on) ? translate(`search.filters.date.presets.${on}`) : `${translate('common.on')} ${DateUtils.formatToReadableString(on)}`);
    }

    if (after) {
        parts.push(`${translate('common.after')} ${DateUtils.formatToReadableString(after)}`);
    }

    if (before) {
        parts.push(`${translate('common.before')} ${DateUtils.formatToReadableString(before)}`);
    }

    if (range) {
        const rangeDisplay = getDateRangeDisplayValueFromFormValue(range, undefined, undefined, true);
        if (rangeDisplay) {
            parts.push(rangeDisplay);
        }
    }

    return parts.join(', ');
}

function getAmountDisplayValue(syntaxKey: SearchAmountFilterKeys, form: Partial<SearchAdvancedFiltersForm>, translate: LocalizedTranslate): string | undefined {
    const lessThan = form[`${syntaxKey}${CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN}`];
    const greaterThan = form[`${syntaxKey}${CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN}`];
    const equalTo = form[`${syntaxKey}${CONST.SEARCH.AMOUNT_MODIFIERS.EQUAL_TO}`];

    const formatAmount = (val: string) => convertToDisplayStringWithoutCurrency(Number(val));

    if (equalTo) {
        return translate('search.filters.amount.equalTo', formatAmount(equalTo));
    }
    if (lessThan && greaterThan) {
        return translate('search.filters.amount.between', formatAmount(greaterThan), formatAmount(lessThan));
    }
    if (lessThan) {
        return translate('search.filters.amount.lessThan', formatAmount(lessThan));
    }
    if (greaterThan) {
        return translate('search.filters.amount.greaterThan', formatAmount(greaterThan));
    }
    return undefined;
}

function getReportFieldDisplayValue(form: Partial<SearchAdvancedFiltersForm>, translate: LocalizedTranslate): string {
    const values: string[] = [];

    for (const [fieldKey, fieldValue] of Object.entries(form)) {
        if (fieldKey.startsWith(CONST.SEARCH.REPORT_FIELD.NOT_PREFIX) || !fieldValue || !fieldKey.startsWith(CONST.SEARCH.REPORT_FIELD.GLOBAL_PREFIX)) {
            continue;
        }

        const fieldName = fieldKey
            .replace(CONST.SEARCH.REPORT_FIELD.ON_PREFIX, '')
            .replace(CONST.SEARCH.REPORT_FIELD.AFTER_PREFIX, '')
            .replace(CONST.SEARCH.REPORT_FIELD.BEFORE_PREFIX, '')
            .replace(CONST.SEARCH.REPORT_FIELD.DEFAULT_PREFIX, '')
            .split('-')
            .map((word, index) => (index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word))
            .join(' ');

        if (fieldKey.startsWith(CONST.SEARCH.REPORT_FIELD.ON_PREFIX)) {
            const dateString = isSearchDatePreset(fieldValue as string)
                ? translate(`search.filters.date.presets.${fieldValue as SearchDatePreset}`)
                : translate('search.filters.date.on', fieldValue as string);

            values.push(translate('search.filters.reportField', fieldName, dateString.toLowerCase()));
        }

        if (fieldKey.startsWith(CONST.SEARCH.REPORT_FIELD.AFTER_PREFIX)) {
            const dateString = translate('search.filters.date.after', fieldValue as string).toLowerCase();
            values.push(translate('search.filters.reportField', fieldName, dateString.toLowerCase()));
        }

        if (fieldKey.startsWith(CONST.SEARCH.REPORT_FIELD.BEFORE_PREFIX)) {
            const dateString = translate('search.filters.date.before', fieldValue as string).toLowerCase();
            values.push(translate('search.filters.reportField', fieldName, dateString.toLowerCase()));
        }

        if (fieldKey.startsWith(CONST.SEARCH.REPORT_FIELD.DEFAULT_PREFIX)) {
            const valueString = translate('search.filters.reportField', fieldName, fieldValue as string);
            values.push(valueString);
        }
    }

    return values.join(', ');
}

function getDisplayValue(
    key: SearchAdvancedFiltersKey,
    form: Partial<SearchAdvancedFiltersForm>,
    type: SearchDataTypes,
    policyIDQuery: string[] | undefined,
    translate: LocalizedTranslate,
    localeCompare: LocaleContextProps['localeCompare'],
) {
    if (key === FILTER_KEYS.TYPE) {
        const filterValue = form[key];
        if (filterValue === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT) {
            return translate('common.expenseReport');
        }
        return filterValue ? translate(`common.${filterValue}`) : undefined;
    }

    if (key === FILTER_KEYS.TAG || key === FILTER_KEYS.CATEGORY) {
        const mapFn =
            key === FILTER_KEYS.TAG
                ? (value: string) => (value === CONST.SEARCH.TAG_EMPTY_VALUE ? translate('search.noTag') : getCleanedTagName(value))
                : (value: string) => (value === CONST.SEARCH.CATEGORY_EMPTY_VALUE ? translate('search.noCategory') : value);

        return form[key]
            ?.sort((a, b) => sortOptionsWithEmptyValue(a, b, localeCompare))
            .map(mapFn)
            .join(', ');
    }

    if (key === FILTER_KEYS.CURRENCY || key === FILTER_KEYS.PURCHASE_CURRENCY) {
        return form[key]?.sort(localeCompare).join(', ');
    }

    if (key === FILTER_KEYS.BILLABLE || key === FILTER_KEYS.REIMBURSABLE) {
        const formValue = form[key];
        return formValue ? translate(`common.${formValue}`) : undefined;
    }

    if (key === FILTER_KEYS.WITHDRAWAL_TYPE) {
        const withdrawalType = form[key];
        return withdrawalType ? translate(`search.filters.withdrawalType.${withdrawalType}`) : undefined;
    }

    if (key === FILTER_KEYS.STATUS) {
        const status = form[key];
        if (!status?.length) {
            return;
        }
        const statusOptions = getStatusOptions(translate, type);
        return statusOptions
            .filter((option) => status.includes(option.value))
            .map((option) => option.text)
            .join(', ');
    }

    if (key === FILTER_KEYS.IS || key === FILTER_KEYS.HAS) {
        const formValue = form[key];
        return formValue?.map((option) => translate(`common.${option}`)).join(', ');
    }

    if (key === FILTER_KEYS.FROM || key === FILTER_KEYS.TO || key === FILTER_KEYS.ATTENDEE || key === FILTER_KEYS.ASSIGNEE || key === FILTER_KEYS.TAX_RATE || key === FILTER_KEYS.IN) {
        return form[key];
    }

    if (key === FILTER_KEYS.POLICY_ID) {
        const policyID = form[key];
        const policyIDs = policyID ?? policyIDQuery;
        if (policyIDs) {
            return Array.isArray(policyIDs) ? policyIDs : [policyIDs];
        }
        return undefined;
    }

    if (key === FILTER_KEYS.EXPENSE_TYPE) {
        return form[key]?.map((expenseType) => translate(getExpenseTypeTranslationKey(expenseType))).join(', ');
    }

    const formValue = form[key];
    return Array.isArray(formValue) ? formValue.join(', ') : formValue;
}

function shouldShowFilter(skipFilters: Set<SearchAdvancedFiltersKey> | undefined, key: SearchAdvancedFiltersKey, value: ValueOf<SearchAdvancedFiltersForm>, type: SearchDataTypes) {
    return !skipFilters?.has(key) && isFilterSupported(key, type) && value && (!Array.isArray(value) || value.length > 0);
}

function mapFiltersFormToLabelValueList<T extends Record<string, unknown>>(
    searchAdvancedFiltersForm: Partial<SearchAdvancedFiltersForm>,
    policyIDQuery: string[] | undefined,
    skipFilters: Set<SearchAdvancedFiltersKey> | undefined,
    translate: LocalizedTranslate,
    localeCompare: LocaleContextProps['localeCompare'],
    mapper?: (filterKey: SearchAdvancedFiltersKey) => T,
): Array<SearchFilter & T> {
    const filters: Array<SearchFilter & T> = [];
    const addedGroups = new Set<SearchDateFilterKeys | SearchAmountFilterKeys | typeof CONST.SEARCH.REPORT_FIELD.GLOBAL_PREFIX>();
    const type = searchAdvancedFiltersForm.type ?? CONST.SEARCH.DATA_TYPES.EXPENSE;

    for (const filterKey of Object.keys(searchAdvancedFiltersForm)) {
        const key = filterKey as SearchAdvancedFiltersKey;
        if (!shouldShowFilter(skipFilters, key, searchAdvancedFiltersForm[key], type)) {
            continue;
        }

        const extra = mapper?.(key) ?? ({} as T);

        // Handle grouped filters (date, amount) - only add once per group
        const groupConfig = FILTER_GROUP_MAP[key];
        if (groupConfig) {
            if (addedGroups.has(groupConfig.syntax)) {
                continue;
            }

            const displayValue = isAmountFilterKey(groupConfig.syntax)
                ? getAmountDisplayValue(groupConfig.syntax, searchAdvancedFiltersForm, translate)
                : getDateDisplayValue(groupConfig.syntax, searchAdvancedFiltersForm, translate);

            if (displayValue) {
                addedGroups.add(groupConfig.syntax);
                filters.push({key, label: translate(groupConfig.label), value: displayValue, ...extra});
            }
            continue;
        }

        // Handle report field filters - only add once
        if (key.startsWith(CONST.SEARCH.REPORT_FIELD.GLOBAL_PREFIX)) {
            if (addedGroups.has(CONST.SEARCH.REPORT_FIELD.GLOBAL_PREFIX)) {
                continue;
            }

            const value = getReportFieldDisplayValue(searchAdvancedFiltersForm, translate);
            if (value) {
                addedGroups.add(CONST.SEARCH.REPORT_FIELD.GLOBAL_PREFIX);
                filters.push({key, label: translate('workspace.common.reportField'), value, ...extra});
            }
            continue;
        }

        // Handle regular filters
        const label = FILTER_LABEL_MAP[key];
        const value = getDisplayValue(key, searchAdvancedFiltersForm, type, policyIDQuery, translate, localeCompare);

        if (label && value && !(Array.isArray(value) && value.length === 0)) {
            filters.push({key, label: translate(label), value, ...extra});
        }
    }

    return filters;
}

function getSingleSelectFilterOptions(filterKey: SearchAdvancedFiltersKey, translate: LocalizedTranslate) {
    if (filterKey === FILTER_KEYS.BILLABLE || filterKey === FILTER_KEYS.REIMBURSABLE) {
        return Object.values(CONST.SEARCH.BOOLEAN).map((value) => ({value, text: translate(`common.${value}`)}));
    }

    if (filterKey === FILTER_KEYS.WITHDRAWAL_TYPE) {
        return getWithdrawalTypeOptions(translate);
    }

    return [];
}

function getMultiSelectFilterOptions(filterKey: SearchAdvancedFiltersKey, type: SearchDataTypes, translate: LocalizedTranslate) {
    if (filterKey === FILTER_KEYS.HAS) {
        return getHasOptions(translate, type);
    }

    if (filterKey === FILTER_KEYS.IS) {
        return Object.values(CONST.SEARCH.IS_VALUES).map((value) => ({text: translate(`common.${value}`), value}));
    }

    if (filterKey === FILTER_KEYS.EXPENSE_TYPE) {
        return Object.values(CONST.SEARCH.TRANSACTION_TYPE).map((expenseType) => {
            const expenseTypeName = translate(getExpenseTypeTranslationKey(expenseType));
            return {text: expenseTypeName, value: expenseType};
        });
    }

    if (filterKey === FILTER_KEYS.STATUS) {
        return type ? getStatusOptions(translate, type) : [];
    }

    return [];
}

function getWithdrawalTypeOptions(translate: LocaleContextProps['translate']) {
    return Object.values(CONST.SEARCH.WITHDRAWAL_TYPE).map<SingleSelectItem<SearchWithdrawalType>>((value) => ({text: translate(`search.filters.withdrawalType.${value}`), value}));
}

function getActionOptions(translate: LocaleContextProps['translate']) {
    return Object.values(CONST.SEARCH.ACTION_FILTERS).map<SingleSelectItem<SearchAction>>((value) => ({text: translate(`search.filters.action.${value}`), value}));
}

/**
 * Determines what columns to show based on available data
 * @param isExpenseReportView: true when we are inside an expense report view, false if we're in the Reports page.
 * @returns An ordered array of visible column IDs
 */
function getColumnsToShow({
    currentAccountID,
    data,
    visibleColumns = [],
    isExpenseReportView = false,
    type,
    groupBy,
    isExpenseReportViewFromIOUReport = false,
    shouldShowBillableColumn = false,
    shouldShowReimbursableColumn = false,
    reportCurrency,
    shouldUseStrictDefaultExpenseColumns = false,
}: {
    currentAccountID: number | undefined;
    data: OnyxTypes.SearchResults['data'] | OnyxTypes.Transaction[];
    visibleColumns?: SearchCustomColumnIds[];
    isExpenseReportView?: boolean;
    type?: SearchDataTypes;
    groupBy?: SearchGroupBy;
    isExpenseReportViewFromIOUReport?: boolean;
    shouldShowBillableColumn?: boolean;
    shouldShowReimbursableColumn?: boolean;
    shouldUseStrictDefaultExpenseColumns?: boolean;
    reportCurrency?: string;
}): SearchColumnType[] {
    if (type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT) {
        const defaultReportColumns: SearchColumnType[] = [
            CONST.SEARCH.TABLE_COLUMNS.AVATAR,
            CONST.SEARCH.TABLE_COLUMNS.DATE,
            CONST.SEARCH.TABLE_COLUMNS.STATUS,
            CONST.SEARCH.TABLE_COLUMNS.TITLE,
            CONST.SEARCH.TABLE_COLUMNS.FROM,
            CONST.SEARCH.TABLE_COLUMNS.TO,
            CONST.SEARCH.TABLE_COLUMNS.TOTAL,
            CONST.SEARCH.TABLE_COLUMNS.ACTION,
        ];

        // If there are no visible columns, everything should be visible
        const filteredVisibleColumns = visibleColumns.filter((column) => {
            return Object.values(CONST.SEARCH.TYPE_CUSTOM_COLUMNS.EXPENSE_REPORT).includes(column as ValueOf<typeof CONST.SEARCH.TYPE_CUSTOM_COLUMNS.EXPENSE_REPORT>);
        });

        if (!filteredVisibleColumns.length) {
            return defaultReportColumns;
        }

        // If the user has set custom columns, use their order then add required columns
        const requiredColumns = new Set<SearchColumnType>([CONST.SEARCH.TABLE_COLUMNS.AVATAR, CONST.SEARCH.TABLE_COLUMNS.TOTAL]);
        const result: SearchColumnType[] = [];

        for (const col of requiredColumns) {
            if (!filteredVisibleColumns.includes(col as SearchCustomColumnIds)) {
                result.push(col);
            }
        }

        for (const col of filteredVisibleColumns) {
            result.push(col);
        }

        return result;
    }

    if (type === CONST.SEARCH.DATA_TYPES.TASK) {
        return [
            CONST.SEARCH.TABLE_COLUMNS.DATE,
            CONST.SEARCH.TABLE_COLUMNS.TITLE,
            CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION,
            CONST.SEARCH.TABLE_COLUMNS.FROM,
            CONST.SEARCH.TABLE_COLUMNS.IN,
            CONST.SEARCH.TABLE_COLUMNS.ASSIGNEE,
            CONST.SEARCH.TABLE_COLUMNS.ACTION,
        ];
    }

    if (!isExpenseReportView && groupBy) {
        const customColumns = {
            [CONST.SEARCH.GROUP_BY.CARD]: CONST.SEARCH.GROUP_CUSTOM_COLUMNS.CARD,
            [CONST.SEARCH.GROUP_BY.FROM]: CONST.SEARCH.GROUP_CUSTOM_COLUMNS.FROM,
            [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: CONST.SEARCH.GROUP_CUSTOM_COLUMNS.WITHDRAWAL_ID,
            [CONST.SEARCH.GROUP_BY.CATEGORY]: CONST.SEARCH.GROUP_CUSTOM_COLUMNS.CATEGORY,
            [CONST.SEARCH.GROUP_BY.MERCHANT]: CONST.SEARCH.GROUP_CUSTOM_COLUMNS.MERCHANT,
            [CONST.SEARCH.GROUP_BY.TAG]: CONST.SEARCH.GROUP_CUSTOM_COLUMNS.TAG,
            [CONST.SEARCH.GROUP_BY.MONTH]: CONST.SEARCH.GROUP_CUSTOM_COLUMNS.MONTH,
            [CONST.SEARCH.GROUP_BY.WEEK]: CONST.SEARCH.GROUP_CUSTOM_COLUMNS.WEEK,
            [CONST.SEARCH.GROUP_BY.YEAR]: CONST.SEARCH.GROUP_CUSTOM_COLUMNS.YEAR,
            [CONST.SEARCH.GROUP_BY.QUARTER]: CONST.SEARCH.GROUP_CUSTOM_COLUMNS.QUARTER,
        }[groupBy];

        const defaultCustomColumns = {
            [CONST.SEARCH.GROUP_BY.CARD]: CONST.SEARCH.GROUP_DEFAULT_COLUMNS.CARD,
            [CONST.SEARCH.GROUP_BY.FROM]: CONST.SEARCH.GROUP_DEFAULT_COLUMNS.FROM,
            [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: CONST.SEARCH.GROUP_DEFAULT_COLUMNS.WITHDRAWAL_ID,
            [CONST.SEARCH.GROUP_BY.CATEGORY]: CONST.SEARCH.GROUP_DEFAULT_COLUMNS.CATEGORY,
            [CONST.SEARCH.GROUP_BY.MERCHANT]: CONST.SEARCH.GROUP_DEFAULT_COLUMNS.MERCHANT,
            [CONST.SEARCH.GROUP_BY.TAG]: CONST.SEARCH.GROUP_DEFAULT_COLUMNS.TAG,
            [CONST.SEARCH.GROUP_BY.MONTH]: CONST.SEARCH.GROUP_DEFAULT_COLUMNS.MONTH,
            [CONST.SEARCH.GROUP_BY.WEEK]: CONST.SEARCH.GROUP_DEFAULT_COLUMNS.WEEK,
            [CONST.SEARCH.GROUP_BY.YEAR]: CONST.SEARCH.GROUP_DEFAULT_COLUMNS.YEAR,
            [CONST.SEARCH.GROUP_BY.QUARTER]: CONST.SEARCH.GROUP_DEFAULT_COLUMNS.QUARTER,
        }[groupBy];

        const filteredVisibleColumns = customColumns ? visibleColumns.filter((column) => Object.values(customColumns).includes(column as ValueOf<typeof customColumns>)) : [];
        const columnsToShow: SearchColumnType[] = filteredVisibleColumns.length ? filteredVisibleColumns : (defaultCustomColumns ?? []);

        const requiredCols = groupByRequiredColumns[groupBy];
        if (requiredCols) {
            const requiredColumnsSet = new Set<SearchColumnType>(requiredCols);
            const result: SearchColumnType[] = [];

            for (const col of requiredColumnsSet) {
                if (!columnsToShow.includes(col as SearchCustomColumnIds)) {
                    result.push(col);
                }
            }

            for (const col of columnsToShow ?? []) {
                result.push(col);
            }

            return result;
        }
    }

    const columns: ColumnVisibility = isExpenseReportView
        ? {
              [CONST.SEARCH.TABLE_COLUMNS.RECEIPT]: true,
              [CONST.SEARCH.TABLE_COLUMNS.TYPE]: true,
              [CONST.SEARCH.TABLE_COLUMNS.DATE]: true,
              [CONST.SEARCH.TABLE_COLUMNS.MERCHANT]: false,
              [CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION]: false,
              [CONST.SEARCH.TABLE_COLUMNS.CATEGORY]: false,
              [CONST.SEARCH.TABLE_COLUMNS.TAG]: false,
              [CONST.SEARCH.TABLE_COLUMNS.CARD]: false,
              [CONST.SEARCH.TABLE_COLUMNS.TAX_RATE]: false,
              [CONST.SEARCH.TABLE_COLUMNS.TAX_AMOUNT]: false,
              [CONST.SEARCH.TABLE_COLUMNS.EXCHANGE_RATE]: false,
              [CONST.SEARCH.TABLE_COLUMNS.ORIGINAL_AMOUNT]: false,
              [CONST.SEARCH.TABLE_COLUMNS.REIMBURSABLE]: shouldShowReimbursableColumn,
              [CONST.SEARCH.TABLE_COLUMNS.BILLABLE]: shouldShowBillableColumn,
              [CONST.SEARCH.TABLE_COLUMNS.COMMENTS]: true,
              [CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT]: true,
          }
        : {
              [CONST.SEARCH.TABLE_COLUMNS.AVATAR]: true,
              [CONST.SEARCH.TABLE_COLUMNS.RECEIPT]: true,
              [CONST.SEARCH.TABLE_COLUMNS.TYPE]: true,
              [CONST.SEARCH.TABLE_COLUMNS.DATE]: true,
              [CONST.SEARCH.TABLE_COLUMNS.STATUS]: true,
              [CONST.SEARCH.TABLE_COLUMNS.POSTED]: false,
              [CONST.SEARCH.TABLE_COLUMNS.EXPORTED]: false,
              [CONST.SEARCH.TABLE_COLUMNS.SUBMITTED]: false,
              [CONST.SEARCH.TABLE_COLUMNS.APPROVED]: false,
              [CONST.SEARCH.TABLE_COLUMNS.MERCHANT]: false,
              [CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION]: false,
              [CONST.SEARCH.TABLE_COLUMNS.FROM]: false,
              [CONST.SEARCH.TABLE_COLUMNS.TO]: false,
              [CONST.SEARCH.TABLE_COLUMNS.POLICY_NAME]: false,
              [CONST.SEARCH.TABLE_COLUMNS.CARD]: false,
              [CONST.SEARCH.TABLE_COLUMNS.CATEGORY]: false,
              [CONST.SEARCH.TABLE_COLUMNS.TAG]: false,
              [CONST.SEARCH.TABLE_COLUMNS.REIMBURSABLE]: false,
              [CONST.SEARCH.TABLE_COLUMNS.BILLABLE]: false,
              [CONST.SEARCH.TABLE_COLUMNS.TAX_RATE]: false,
              [CONST.SEARCH.TABLE_COLUMNS.TAX_AMOUNT]: false,
              [CONST.SEARCH.TABLE_COLUMNS.EXCHANGE_RATE]: false,
              [CONST.SEARCH.TABLE_COLUMNS.ORIGINAL_AMOUNT]: false,
              [CONST.SEARCH.TABLE_COLUMNS.BASE_62_REPORT_ID]: false,
              [CONST.SEARCH.TABLE_COLUMNS.REPORT_ID]: false,
              [CONST.SEARCH.TABLE_COLUMNS.TITLE]: false,
              [CONST.SEARCH.TABLE_COLUMNS.EXPORTED_TO]: false,
              [CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT]: true,
              [CONST.SEARCH.TABLE_COLUMNS.ACTION]: false,
              [CONST.SEARCH.TABLE_COLUMNS.COMMENTS]: false,
          };

    // If the user has set custom columns for the search, we need to respect their preference and order
    const allowedColumns: string[] = isExpenseReportView ? Object.values(CONST.SEARCH.REPORT_DETAILS_CUSTOM_COLUMNS) : Object.values(CONST.SEARCH.TYPE_CUSTOM_COLUMNS.EXPENSE);
    const filteredVisibleColumns = visibleColumns.filter((column) => allowedColumns.includes(column));

    let customResult: SearchColumnType[] | undefined;

    if (!arraysEqual(Object.values(CONST.SEARCH.TYPE_DEFAULT_COLUMNS.EXPENSE), filteredVisibleColumns) && filteredVisibleColumns.length > 0) {
        const result: SearchColumnType[] = [];
        const addedColumns = new Set<SearchColumnType>();

        if (isExpenseReportView) {
            // If RECEIPT is first, TYPE goes second; otherwise TYPE goes first
            for (const col of filteredVisibleColumns) {
                result.push(col);
                addedColumns.add(col);
            }

            if (!addedColumns.has(CONST.SEARCH.TABLE_COLUMNS.TYPE)) {
                const isReceiptFirst = result.at(0) === CONST.SEARCH.TABLE_COLUMNS.RECEIPT;
                if (isReceiptFirst) {
                    result.splice(1, 0, CONST.SEARCH.TABLE_COLUMNS.TYPE);
                } else {
                    result.unshift(CONST.SEARCH.TABLE_COLUMNS.TYPE);
                }
            }

            if (!addedColumns.has(CONST.SEARCH.TABLE_COLUMNS.COMMENTS)) {
                result.push(CONST.SEARCH.TABLE_COLUMNS.COMMENTS);
            }

            // Don't return early — fall through to updateColumns to detect empty columns
            customResult = result;
        } else {
            // Search page: prepend AVATAR, TYPE
            result.push(CONST.SEARCH.TABLE_COLUMNS.AVATAR);
            addedColumns.add(CONST.SEARCH.TABLE_COLUMNS.AVATAR);
            result.push(CONST.SEARCH.TABLE_COLUMNS.TYPE);
            addedColumns.add(CONST.SEARCH.TABLE_COLUMNS.TYPE);

            // Add remaining visible columns that weren't already added
            for (const col of filteredVisibleColumns) {
                if (!addedColumns.has(col)) {
                    result.push(col);
                }
            }

            // Don't return early — fall through to updateColumns to detect empty columns
            customResult = result;
        }
    }

    const {moneyRequestReportActionsByTransactionID} = Array.isArray(data) ? {} : createReportActionsLookupMaps(data);
    const updateColumns = (transaction: OnyxTypes.Transaction) => {
        const merchant = transaction.modifiedMerchant ? transaction.modifiedMerchant : (transaction.merchant ?? '');
        if (!isInvalidMerchantValue(merchant) || isScanning(transaction)) {
            columns[CONST.SEARCH.TABLE_COLUMNS.MERCHANT] = true;
        }

        if (getDescription(transaction) !== '') {
            columns[CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION] = true;
        }

        const hasCategory = (() => {
            const category = getCategory(transaction);
            return category !== '' && category !== CONST.SEARCH.CATEGORY_EMPTY_VALUE;
        })();

        const hasTag = (() => {
            const tag = getTag(transaction);
            return tag !== '' && tag !== CONST.SEARCH.TAG_EMPTY_VALUE;
        })();

        // Category/tag: set for all paths (default search, custom search, report view).
        // Will be refined later for search page non-IOU check.
        if (hasCategory) {
            columns[CONST.SEARCH.TABLE_COLUMNS.CATEGORY] = !isExpenseReportViewFromIOUReport;
        }
        if (hasTag) {
            columns[CONST.SEARCH.TABLE_COLUMNS.TAG] = !isExpenseReportViewFromIOUReport;
        }

        // Data-presence checks for columns that are hidden when empty.
        // Only update when we have custom columns to filter (customResult) or in expense report view,
        // so that the default search page path doesn't show extra columns.
        if (customResult || isExpenseReportView) {
            if (transaction.cardName && transaction.cardName !== CONST.EXPENSE.TYPE.CASH_CARD_NAME) {
                columns[CONST.SEARCH.TABLE_COLUMNS.CARD] = true;
            }

            if (transaction.taxCode) {
                columns[CONST.SEARCH.TABLE_COLUMNS.TAX_RATE] = true;
            }

            if (transaction.taxAmount) {
                columns[CONST.SEARCH.TABLE_COLUMNS.TAX_AMOUNT] = true;
            }

            const hasExchangeRate = getExchangeRate(transaction, reportCurrency) !== '';
            if (hasExchangeRate || transaction.originalAmount) {
                columns[CONST.SEARCH.TABLE_COLUMNS.ORIGINAL_AMOUNT] = true;
                columns[CONST.SEARCH.TABLE_COLUMNS.EXCHANGE_RATE] = true;
            }

            if (!Array.isArray(data)) {
                const report = data[`${ONYXKEYS.COLLECTION.REPORT}${transaction.reportID}`];

                if (report?.submitted) {
                    columns[CONST.SEARCH.TABLE_COLUMNS.SUBMITTED] = true;
                }

                if (report?.policyID) {
                    columns[CONST.SEARCH.TABLE_COLUMNS.POLICY_NAME] = true;
                }

                const reportAction = moneyRequestReportActionsByTransactionID?.get(transaction.transactionID);
                const toFieldValue = getToFieldValueForTransaction(transaction, report, data.personalDetailsList, reportAction);
                if (toFieldValue.accountID) {
                    columns[CONST.SEARCH.TABLE_COLUMNS.TO] = true;
                }
            }
        }

        if (isExpenseReportView) {
            if (hasCategory) {
                columns[CONST.SEARCH.TABLE_COLUMNS.CATEGORY] = !isExpenseReportViewFromIOUReport;
            }
            if (hasTag) {
                columns[CONST.SEARCH.TABLE_COLUMNS.TAG] = !isExpenseReportViewFromIOUReport;
            }
            return;
        }

        // The From/To columns display logic depends on the passed report/reportAction i.e. if data is SearchResults and not an array (Transaction[])
        if (!Array.isArray(data)) {
            const report = data[`${ONYXKEYS.COLLECTION.REPORT}${transaction.reportID}`];
            const reportAction = moneyRequestReportActionsByTransactionID?.get(transaction.transactionID);

            // Handle From&To columns that are only shown in the Reports page
            // if From or To differ from current user in any transaction, show the columns
            const accountID = reportAction?.actorAccountID;
            if (accountID && accountID !== currentAccountID) {
                columns[CONST.SEARCH.TABLE_COLUMNS.FROM] = true;
            }

            // Show category/tag if any non-IOU transaction has them.
            // Only set to true, never reset — so a previous non-IOU match is preserved.
            if (hasCategory && !isIOUReportReportUtil(report)) {
                columns[CONST.SEARCH.TABLE_COLUMNS.CATEGORY] = true;
            }
            if (hasTag && !isIOUReportReportUtil(report)) {
                columns[CONST.SEARCH.TABLE_COLUMNS.TAG] = true;
            }

            // eslint-disable-next-line @typescript-eslint/no-deprecated
            const toFieldValue = getToFieldValueForTransaction(transaction, report, data.personalDetailsList, reportAction);
            if (!shouldUseStrictDefaultExpenseColumns && toFieldValue.accountID && toFieldValue.accountID !== currentAccountID && !columns[CONST.SEARCH.TABLE_COLUMNS.TO]) {
                columns[CONST.SEARCH.TABLE_COLUMNS.TO] = !!report && !isOpenReport(report);
            }
        }
    };

    if (Array.isArray(data)) {
        for (const item of data) {
            updateColumns(item);
        }
    } else {
        for (const key of Object.keys(data)) {
            if (!isTransactionEntry(key)) {
                continue;
            }
            updateColumns(data[key]);
        }
    }

    if (customResult) {
        // Columns that always have content and don't need data-presence checks.
        // These are false in the default columns map (so they don't appear by default)
        // but should be kept when explicitly selected by the user in custom columns.
        const nonDataColumns = new Set<SearchColumnType>([
            CONST.SEARCH.TABLE_COLUMNS.AVATAR,
            CONST.SEARCH.TABLE_COLUMNS.RECEIPT,
            CONST.SEARCH.TABLE_COLUMNS.TYPE,
            CONST.SEARCH.TABLE_COLUMNS.DATE,
            CONST.SEARCH.TABLE_COLUMNS.STATUS,
            CONST.SEARCH.TABLE_COLUMNS.COMMENTS,
            CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT,
            CONST.SEARCH.TABLE_COLUMNS.REIMBURSABLE,
            CONST.SEARCH.TABLE_COLUMNS.BILLABLE,
            CONST.SEARCH.TABLE_COLUMNS.BASE_62_REPORT_ID,
            CONST.SEARCH.TABLE_COLUMNS.REPORT_ID,
            CONST.SEARCH.TABLE_COLUMNS.TITLE,
            CONST.SEARCH.TABLE_COLUMNS.ACTION,
            CONST.SEARCH.TABLE_COLUMNS.ATTENDEES,
            CONST.SEARCH.TABLE_COLUMNS.TOTAL_PER_ATTENDEE,
        ]);

        return customResult.filter((col) => nonDataColumns.has(col) || columns[col]);
    }

    return (Object.keys(columns) as SearchColumnType[]).filter((col) => columns[col]);
}

/**
 * Maps numeric state value to settlement status
 * State mapping confirmed by backend team (@JS00001):
 * - 5, 6, 7: Failed
 * - 8: Cleared (succeeded and complete)
 * - 9: Cleared (settled, pending batch processing)
 * - All others: Pending (processing)
 */
const settlementStatusMap = new Map<number, ValueOf<typeof CONST.SEARCH.SETTLEMENT_STATUS>>([
    [5, CONST.SEARCH.SETTLEMENT_STATUS.FAILED],
    [6, CONST.SEARCH.SETTLEMENT_STATUS.FAILED],
    [7, CONST.SEARCH.SETTLEMENT_STATUS.FAILED],
    [8, CONST.SEARCH.SETTLEMENT_STATUS.CLEARED],
    [9, CONST.SEARCH.SETTLEMENT_STATUS.CLEARED],
]);

function getSettlementStatus(state: number | undefined): ValueOf<typeof CONST.SEARCH.SETTLEMENT_STATUS> | undefined {
    if (state === undefined) {
        return undefined;
    }

    return settlementStatusMap.get(state) ?? CONST.SEARCH.SETTLEMENT_STATUS.PENDING;
}

/**
 * Get badge properties for settlement status
 * Uses Report Status Badge styling as recommended by designer
 */
function getSettlementStatusBadgeProps(
    state: number | undefined,
    translate: LocaleContextProps['translate'],
    theme: ThemeColors,
): {
    text: string;
    badgeStyles: ViewStyle;
    textStyles: TextStyle;
} | null {
    const status = getSettlementStatus(state);
    if (!status) {
        return null;
    }

    switch (status) {
        case CONST.SEARCH.SETTLEMENT_STATUS.CLEARED:
            return {
                text: translate('settlement.status.cleared'),
                badgeStyles: {
                    backgroundColor: theme.reportStatusBadge.closed.backgroundColor,
                },
                textStyles: {
                    color: theme.reportStatusBadge.closed.textColor,
                },
            };
        case CONST.SEARCH.SETTLEMENT_STATUS.FAILED:
            return {
                text: translate('settlement.status.failed'),
                badgeStyles: {
                    backgroundColor: theme.reportStatusBadge.outstanding.backgroundColor,
                },
                textStyles: {
                    color: theme.reportStatusBadge.outstanding.textColor,
                },
            };
        case CONST.SEARCH.SETTLEMENT_STATUS.PENDING:
            return {
                text: translate('settlement.status.pending'),
                badgeStyles: {
                    backgroundColor: theme.reportStatusBadge.draft.backgroundColor,
                },
                textStyles: {
                    color: theme.reportStatusBadge.draft.textColor,
                },
            };
        default:
            return null;
    }
}

/**
 * Extracts the core Transaction fields from a TransactionListItemType
 * This removes UI-specific fields like formattedFrom, hash, violations, etc.
 */
function getTransactionFromTransactionListItem(item: TransactionListItemType): OnyxTypes.Transaction {
    // Extract only the core Transaction fields, excluding UI-specific and search-specific fields
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {
        keyForList,
        action,
        allActions,
        report,
        from,
        to,
        formattedFrom,
        formattedTo,
        formattedTotal,
        formattedMerchant,
        date,
        shouldShowMerchant,
        shouldShowYear: shouldTransactionShowYear,
        isAmountColumnWide,
        isTaxAmountColumnWide,
        violations,
        hash,
        accountID,
        policyID,
        ...transaction
    } = item;

    return transaction as OnyxTypes.Transaction;
}

function getTableMinWidth(columns: SearchColumnType[], type?: SearchDataTypes, isActionColumnWide?: boolean) {
    // Starts at 24px to account for the checkbox width
    let minWidth = 24;

    for (const column of columns) {
        if (column === CONST.SEARCH.TABLE_COLUMNS.COMMENTS) {
            minWidth += 36;
        } else if (column === CONST.SEARCH.TABLE_COLUMNS.RECEIPT) {
            minWidth += 28;
        } else if (column === CONST.SEARCH.TABLE_COLUMNS.AVATAR) {
            minWidth += 28;
        } else if (column === CONST.SEARCH.TABLE_COLUMNS.STATUS) {
            minWidth += 80;
        } else if (column === CONST.SEARCH.TABLE_COLUMNS.ACTION) {
            minWidth += (isActionColumnWide ?? type === CONST.SEARCH.DATA_TYPES.TASK) ? 80 : 68;
        } else if (column === CONST.SEARCH.TABLE_COLUMNS.DATE) {
            minWidth += 48;
        } else if (
            column === CONST.SEARCH.TABLE_COLUMNS.SUBMITTED ||
            column === CONST.SEARCH.TABLE_COLUMNS.APPROVED ||
            column === CONST.SEARCH.TABLE_COLUMNS.POSTED ||
            column === CONST.SEARCH.TABLE_COLUMNS.WITHDRAWN ||
            column === CONST.SEARCH.TABLE_COLUMNS.GROUP_WITHDRAWN
        ) {
            minWidth += 72;
        } else if (column === CONST.SEARCH.TABLE_COLUMNS.TYPE) {
            minWidth += 16;
        } else if (column === CONST.SEARCH.TABLE_COLUMNS.REIMBURSABLE || column === CONST.SEARCH.TABLE_COLUMNS.BILLABLE) {
            minWidth += 80;
        } else {
            minWidth += 200;
        }
    }
    return minWidth;
}

/**
 * Determine policyID based on selected transactions:
 * - If all selected transactions belong to the same policy, use that policy
 * - Otherwise, fall back to the user's active workspace policy
 */
function getSearchBulkEditPolicyID(
    selectedTransactionIDs: string[],
    activePolicyID: string | undefined,
    allTransactions: OnyxCollection<OnyxTypes.Transaction> | undefined,
    allReports: OnyxCollection<OnyxTypes.Report> | undefined,
): string | undefined {
    if (selectedTransactionIDs.length === 0) {
        return activePolicyID;
    }

    const policyIDs = selectedTransactionIDs.map((transactionID) => {
        const transaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
        if (!transaction?.reportID) {
            return undefined;
        }
        const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transaction.reportID}`];
        return report?.policyID;
    });

    const firstPolicyID = policyIDs.at(0);
    const allSamePolicy = policyIDs.every((policyID) => policyID === firstPolicyID);

    if (allSamePolicy && firstPolicyID) {
        return firstPolicyID;
    }

    return activePolicyID;
}

function filterValidHasValues(hasValues: HasFilterValues | undefined, type: SearchDataTypes | undefined, translate: LocalizedTranslate): HasFilterValues | undefined {
    if (!hasValues || !type) {
        return undefined;
    }

    const validHasOptions = getHasOptions(translate, type);
    const validHasValues = new Set(validHasOptions.map((option) => option.value));
    const filteredHasValues = hasValues.filter((hasValue) => validHasValues.has(hasValue));

    return filteredHasValues.length > 0 ? filteredHasValues : undefined;
}

function navigateToSearchRHP(route: {route: string; getRoute: (backTo?: string) => Route}, fallbackRoute?: Route) {
    if (isSearchTopmostFullScreenRoute()) {
        Navigation.navigate(route.getRoute(Navigation.getActiveRoute()));
    } else {
        Navigation.navigate(fallbackRoute ?? route.getRoute());
    }
}

function shouldShowDeleteOption(
    selectedTransactions: Record<string, SelectedTransactionInfo>,
    currentSearchResults: SearchResults['data'] | undefined,
    selectedReports: SelectedReports[] = [],
    searchDataType?: SearchDataTypes,
) {
    const selectedTransactionsKeys = Object.keys(selectedTransactions);

    return selectedReports.length && searchDataType !== CONST.SEARCH.DATA_TYPES.EXPENSE
        ? selectedReports.every((selectedReport) => {
              const fullReport = currentSearchResults?.[`${ONYXKEYS.COLLECTION.REPORT}${selectedReport.reportID}`];
              if (!fullReport) {
                  return false;
              }
              const reportActionsData = currentSearchResults?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${selectedReport.reportID}`];
              const reportActionsArray = Object.values(reportActionsData ?? {});
              const reportTransactions: OnyxTypes.Transaction[] = [];
              const searchData = currentSearchResults ?? {};
              for (const key of Object.keys(searchData)) {
                  if (!key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION)) {
                      continue;
                  }
                  const item = searchData[key as keyof typeof searchData] as OnyxTypes.Transaction | undefined;
                  if (item && 'transactionID' in item && 'reportID' in item && item.reportID === selectedReport.reportID) {
                      reportTransactions.push(item);
                  }
              }
              return canDeleteMoneyRequestReport(fullReport, reportTransactions, reportActionsArray);
          })
        : selectedTransactionsKeys.every((id) => {
              const transaction = currentSearchResults?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${id}`] ?? selectedTransactions[id]?.transaction;
              if (!transaction) {
                  return false;
              }
              const parentReportID = transaction.reportID;
              const parentReport = currentSearchResults?.[`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`] ?? selectedTransactions[id].report;
              const reportActions = currentSearchResults?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`];
              const parentReportAction =
                  Object.values(reportActions ?? {}).find((action) => (isMoneyRequestAction(action) ? getOriginalMessage(action)?.IOUTransactionID : undefined) === id) ??
                  selectedTransactions[id].reportAction;

              return canDeleteMoneyRequestReport(parentReport, [transaction], parentReportAction ? [parentReportAction] : []);
          });
}

function applySelectionToItem(
    item: SearchListItem,
    canSelectMultiple: boolean,
    selectedTransactions: SelectedTransactions,
): {originalItem: SearchListItem; itemWithSelection: SearchListItem; isSelected: boolean} {
    // Simple items without transactions
    if (!('transactions' in item) || !item.transactions) {
        const isSelected = !!(canSelectMultiple && item.keyForList && selectedTransactions[item.keyForList]?.isSelected);
        const itemWithSelection = !!item.isSelected !== isSelected ? {...item, isSelected} : item;
        return {originalItem: item, itemWithSelection, isSelected};
    }

    // Single-select mode: group items are never selected via selectedTransactions
    if (!canSelectMultiple) {
        const itemWithSelection = item.isSelected ? {...item, isSelected: false} : item;
        return {originalItem: item, itemWithSelection, isSelected: false};
    }

    const isEmptyReportSelected = item.transactions.length === 0 && isTransactionReportGroupListItemType(item) && !!(item.keyForList && selectedTransactions[item.keyForList]?.isSelected);

    const hasAnySelected = item.transactions.some((t) => t.keyForList && selectedTransactions[t.keyForList]?.isSelected) || isEmptyReportSelected;

    // Item thinks it's selected but nothing actually is → deselect
    if (!hasAnySelected && item.isSelected) {
        return {originalItem: item, itemWithSelection: {...item, isSelected: false}, isSelected: false};
    }

    // Empty report is selected
    if (isEmptyReportSelected) {
        const itemWithSelection = !item.isSelected ? {...item, isSelected: true} : item;
        return {originalItem: item, itemWithSelection, isSelected: true};
    }

    // Map individual transactions and derive group selection state
    let allNonDeletedSelected = true;
    let hasNonDeletedTransactions = false;
    let hasTransactionSelectionChanged = false;

    const mappedTransactions = item.transactions.map((transaction) => {
        const isTransactionSelected = !!(transaction.keyForList && selectedTransactions[transaction.keyForList]?.isSelected);

        if (transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            hasNonDeletedTransactions = true;
            if (!isTransactionSelected) {
                allNonDeletedSelected = false;
            }
        }

        if (!!transaction.isSelected !== isTransactionSelected) {
            hasTransactionSelectionChanged = true;
        }

        return isTransactionSelected === !!transaction.isSelected ? transaction : {...transaction, isSelected: isTransactionSelected};
    });

    const isSelected = hasNonDeletedTransactions && allNonDeletedSelected;

    if (!hasTransactionSelectionChanged && !!item.isSelected === isSelected) {
        return {originalItem: item, itemWithSelection: item, isSelected};
    }

    const transactions = hasTransactionSelectionChanged ? mappedTransactions : item.transactions;
    return {originalItem: item, itemWithSelection: {...item, isSelected, transactions}, isSelected};
}

export {
    getSearchBulkEditPolicyID,
    getSuggestedSearches,
    getListItem,
    getSections,
    getSuggestedSearchesVisibility,
    getSortedSections,
    isTransactionGroupListItemType,
    isTransactionReportGroupListItemType,
    isTransactionMemberGroupListItemType,
    isTransactionCardGroupListItemType,
    isTransactionWithdrawalIDGroupListItemType,
    isTransactionCategoryGroupListItemType,
    isTransactionMerchantGroupListItemType,
    isTransactionTagGroupListItemType,
    isTransactionMonthGroupListItemType,
    isTransactionWeekGroupListItemType,
    isTransactionYearGroupListItemType,
    isTransactionQuarterGroupListItemType,
    isGroupedItemArray,
    isSearchResultsEmpty,
    isTransactionListItemType,
    isReportActionListItemType,
    shouldShowYear,
    getOverflowMenu,
    isCorrectSearchUserName,
    isReportActionEntry,
    isTaskListItemType,
    getActions,
    createTypeMenuSections,
    formatBadgeText,
    getItemBadgeText,
    createBaseSavedSearchMenuItem,
    shouldShowEmptyState,
    compareValues,
    isSearchDataLoaded,
    getValidGroupBy,
    getStatusOptions,
    getTypeOptions,
    getGroupByOptions,
    getSortByOptions,
    getSortOrderOptions,
    getGroupBySections,
    getViewOptions,
    getCurrencyOptions,
    getFeedOptions,
    getWideAmountIndicators,
    hasDeletedTransactionInData,
    isTransactionAmountTooLong,
    isTransactionTaxAmountTooLong,
    getDatePresets,
    getDateRangeForPreset,
    createAndOpenSearchTransactionThread,
    getWithdrawalTypeOptions,
    getActionOptions,
    getColumnsToShow,
    getHasOptions,
    getSettlementStatus,
    getSettlementStatusBadgeProps,
    getTransactionFromTransactionListItem,
    getSearchColumnTranslationKey,
    isColumnSortable,
    getTableMinWidth,
    getCustomColumns,
    getCustomColumnDefault,
    filterValidHasValues,
    navigateToSearchRHP,
    shouldShowDeleteOption,
    getToFieldValueForTransaction,
    getSearchReportAvatarProps,
    isTodoSearch,
    getActiveGroupSearchHashes,
    adjustTimeRangeToDateFilters,
    shouldShowFilter,
    mapFiltersFormToLabelValueList,
    getSingleSelectFilterOptions,
    getMultiSelectFilterOptions,
    isEligibleForApproveSuggestion,
    applySelectionToItem,
    GENERIC_SEARCH_KEYS,
    FILTER_GROUP_MAP,
    FILTER_LABEL_MAP,
    doesSearchItemMatchSort,
    isPolicyEligibleForSpendOverTime,
};
export type {
    SavedSearchMenuItem,
    SearchTypeMenuSection,
    SearchTypeMenuItem,
    SearchDateModifier,
    SearchDateModifierLower,
    SearchKey,
    ArchivedReportsIDSet,
    GroupBySection,
    SearchFilter,
    GetSectionsResult,
};
