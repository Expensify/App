/* eslint-disable max-lines */
// TODO: Remove this disable once SearchUIUtils is refactored (see dedicated refactor issue)
import {endOfMonth, format, startOfMonth, startOfYear, subMonths} from 'date-fns';
import type {TextStyle, ViewStyle} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {CurrencyListContextProps} from '@components/CurrencyListContextProvider';
import type {ExpensifyIconName} from '@components/Icon/ExpensifyIconLoader';
import type {LocaleContextProps, LocalizedTranslate} from '@components/LocaleContextProvider';
import type {MenuItemWithLink} from '@components/MenuItemList';
import type {MultiSelectItem} from '@components/Search/FilterDropdowns/MultiSelectPopup';
import type {SingleSelectItem} from '@components/Search/FilterDropdowns/SingleSelectPopup';
import type {
    QueryFilters,
    SearchAction,
    SearchColumnType,
    SearchCustomColumnIds,
    SearchDateFilterKeys,
    SearchDatePreset,
    SearchGroupBy,
    SearchQueryJSON,
    SearchStatus,
    SearchWithdrawalType,
    SelectedTransactionInfo,
    SingularSearchStatus,
    SortOrder,
} from '@components/Search/types';
import ChatListItem from '@components/SelectionListWithSections/ChatListItem';
import ExpenseReportListItem from '@components/SelectionListWithSections/Search/ExpenseReportListItem';
import TaskListItem from '@components/SelectionListWithSections/Search/TaskListItem';
import TransactionGroupListItem from '@components/SelectionListWithSections/Search/TransactionGroupListItem';
import TransactionListItem from '@components/SelectionListWithSections/Search/TransactionListItem';
import type {
    ExpenseReportListItemType,
    ListItem,
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
    TransactionReportGroupListItemType,
    TransactionTagGroupListItemType,
    TransactionWeekGroupListItemType,
    TransactionWithdrawalIDGroupListItemType,
} from '@components/SelectionListWithSections/types';
import type {ThemeColors} from '@styles/theme/types';
import * as Expensicons from '@src/components/Icon/Expensicons';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
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
    SearchTagGroup,
    SearchTask,
    SearchTransactionAction,
    SearchWithdrawalIDGroup,
} from '@src/types/onyx/SearchResults';
import type IconAsset from '@src/types/utils/IconAsset';
import arraysEqual from '@src/utils/arraysEqual';
import {hasSynchronizationErrorMessage} from './actions/connections';
import {canApproveIOU, canIOUBePaid, canSubmitReport, startMoneyRequest} from './actions/IOU';
import {setIsOpenConfirmNavigateExpensifyClassicModalOpen} from './actions/isOpenConfirmNavigateExpensifyClassicModal';
import {createTransactionThreadReport} from './actions/Report';
import type {TransactionPreviewData} from './actions/Search';
import {setOptimisticDataForTransactionThreadPreview} from './actions/Search';
import type {CardFeedForDisplay} from './CardFeedUtils';
import {getCardFeedsForDisplay} from './CardFeedUtils';
import {getCardDescription, getCustomOrFormattedFeedName} from './CardUtils';
import {getDecodedCategoryName} from './CategoryUtils';
import {convertToDisplayString} from './CurrencyUtils';
import DateUtils from './DateUtils';
import interceptAnonymousUser from './interceptAnonymousUser';
import Navigation from './Navigation/Navigation';
import Parser from './Parser';
import {getDisplayNameOrDefault} from './PersonalDetailsUtils';
import {
    arePaymentsEnabled,
    canSendInvoice,
    getCleanedTagName,
    getGroupPaidPoliciesWithExpenseChatEnabled,
    getPolicy,
    getSubmitToAccountID,
    isPaidGroupPolicy,
    isPolicyPayer,
} from './PolicyUtils';
import {
    getIOUActionForReportID,
    getOriginalMessage,
    isCreatedAction,
    isDeletedAction,
    isHoldAction,
    isMoneyRequestAction,
    isResolvedActionableWhisper,
    isWhisperActionTargetedToOthers,
    shouldReportActionBeVisible,
} from './ReportActionsUtils';
import {isExportAction} from './ReportPrimaryActionUtils';
import {
    canDeleteMoneyRequestReport,
    canUserPerformWriteAction,
    findSelfDMReportID,
    generateReportID,
    getIcons,
    getPersonalDetailsForAccountID,
    getPolicyName,
    getReportName,
    getReportOrDraftReport,
    getReportStatusTranslation,
    getSearchReportName,
    hasAnyViolations,
    hasHeldExpenses,
    hasInvoiceReports,
    isAllowedToApproveExpenseReport as isAllowedToApproveExpenseReportUtils,
    isArchivedReport,
    isClosedReport,
    isInvoiceReport,
    isIOUReport as isIOUReportReportUtil,
    isMoneyRequestReport,
    isOneTransactionReport,
    isOpenExpenseReport,
    isOpenReport,
    isSettled,
} from './ReportUtils';
import {buildCannedSearchQuery, buildQueryStringFromFilterFormValues, buildSearchQueryJSON, buildSearchQueryString, getCurrentSearchQueryJSON} from './SearchQueryUtils';
import StringUtils from './StringUtils';
import {getIOUPayerAndReceiver} from './TransactionPreviewUtils';
import {
    getCategory,
    getDescription,
    getExchangeRate,
    getOriginalAmountForDisplay,
    getTag,
    getTaxAmount,
    getTaxName,
    getAmount as getTransactionAmount,
    getCreated as getTransactionCreatedDate,
    getMerchant as getTransactionMerchant,
    isPending,
    isScanning,
    isViolationDismissed,
} from './TransactionUtils';
import ViolationsUtils from './Violations/ViolationsUtils';

type ColumnSortMapping<T> = Partial<Record<SearchColumnType, keyof T | null>>;
type ColumnVisibility = Partial<Record<SearchColumnType, boolean>>;

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

const expenseStatusActionMapping = {
    [CONST.SEARCH.STATUS.EXPENSE.DRAFTS]: (expenseReport?: OnyxTypes.Report) =>
        expenseReport?.stateNum === CONST.REPORT.STATE_NUM.OPEN && expenseReport.statusNum === CONST.REPORT.STATUS_NUM.OPEN,
    [CONST.SEARCH.STATUS.EXPENSE.OUTSTANDING]: (expenseReport?: OnyxTypes.Report) =>
        expenseReport?.stateNum === CONST.REPORT.STATE_NUM.SUBMITTED && expenseReport.statusNum === CONST.REPORT.STATUS_NUM.SUBMITTED,
    [CONST.SEARCH.STATUS.EXPENSE.APPROVED]: (expenseReport?: OnyxTypes.Report) =>
        expenseReport?.stateNum === CONST.REPORT.STATE_NUM.APPROVED && expenseReport.statusNum === CONST.REPORT.STATUS_NUM.APPROVED,
    [CONST.SEARCH.STATUS.EXPENSE.PAID]: (expenseReport?: OnyxTypes.Report) =>
        (expenseReport?.stateNum ?? 0) >= CONST.REPORT.STATE_NUM.APPROVED && expenseReport?.statusNum === CONST.REPORT.STATUS_NUM.REIMBURSED,
    [CONST.SEARCH.STATUS.EXPENSE.DONE]: (expenseReport?: OnyxTypes.Report) =>
        expenseReport?.stateNum === CONST.REPORT.STATE_NUM.APPROVED && expenseReport.statusNum === CONST.REPORT.STATUS_NUM.CLOSED,
    [CONST.SEARCH.STATUS.EXPENSE.UNREPORTED]: (expenseReport?: OnyxTypes.Report) => !expenseReport,
    [CONST.SEARCH.STATUS.EXPENSE.ALL]: () => true,
};

function isValidExpenseStatus(status: unknown): status is ValueOf<typeof CONST.SEARCH.STATUS.EXPENSE> {
    return typeof status === 'string' && status in expenseStatusActionMapping;
}

function formatBadgeText(count: number): string {
    return count > CONST.SEARCH.TODO_BADGE_MAX_COUNT ? `${CONST.SEARCH.TODO_BADGE_MAX_COUNT}+` : count.toString();
}

function getExpenseStatusOptions(translate: LocalizedTranslate): Array<MultiSelectItem<SingularSearchStatus>> {
    return [
        {text: translate('common.unreported'), value: CONST.SEARCH.STATUS.EXPENSE.UNREPORTED},
        {text: translate('common.draft'), value: CONST.SEARCH.STATUS.EXPENSE.DRAFTS},
        {text: translate('common.outstanding'), value: CONST.SEARCH.STATUS.EXPENSE.OUTSTANDING},
        {text: translate('iou.approved'), value: CONST.SEARCH.STATUS.EXPENSE.APPROVED},
        {text: translate('iou.settledExpensify'), value: CONST.SEARCH.STATUS.EXPENSE.PAID},
        {text: translate('iou.done'), value: CONST.SEARCH.STATUS.EXPENSE.DONE},
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

type PolicyKey = `${typeof ONYXKEYS.COLLECTION.POLICY}${string}`;

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
    icon?: IconAsset | Extract<ExpensifyIconName, 'Receipt' | 'ChatBubbles' | 'MoneyBag' | 'CreditCard' | 'MoneyHourglass' | 'CreditCardHourglass' | 'Bank' | 'User' | 'Folder' | 'Basket'>;
    searchQuery: string;
    searchQueryJSON: SearchQueryJSON | undefined;
    hash: number;
    similarSearchHash: number;
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
    allTransactionViolations?: OnyxCollection<OnyxTypes.TransactionViolation[]>;
    allReportMetadata: OnyxCollection<OnyxTypes.ReportMetadata>;
};

/**
 * Creates a top search menu item with common structure for TOP_SPENDERS, TOP_CATEGORIES, and TOP_MERCHANTS
 */
function createTopSearchMenuItem(
    key: SearchKey,
    translationPath: TranslationPaths,
    icon: IconAsset | Extract<ExpensifyIconName, 'Receipt' | 'ChatBubbles' | 'MoneyBag' | 'CreditCard' | 'MoneyHourglass' | 'CreditCardHourglass' | 'Bank' | 'User' | 'Folder' | 'Basket'>,
    groupBy: ValueOf<typeof CONST.SEARCH.GROUP_BY>,
    limit?: number,
): SearchTypeMenuItem {
    const searchQuery = buildQueryStringFromFilterFormValues(
        {
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            groupBy,
            dateOn: CONST.SEARCH.DATE_PRESETS.LAST_MONTH,
        },
        {
            sortBy: CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL,
            sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
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
function getSuggestedSearches(
    accountID: number = CONST.DEFAULT_NUMBER_ID,
    defaultFeedID?: string,
    icons?: Record<'Document' | 'Pencil' | 'ThumbsUp', IconAsset>,
): Record<ValueOf<typeof CONST.SEARCH.SEARCH_KEYS>, SearchTypeMenuItem> {
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
        },
        [CONST.SEARCH.SEARCH_KEYS.REPORTS]: {
            key: CONST.SEARCH.SEARCH_KEYS.REPORTS,
            translationPath: 'common.reports',
            type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
            icon: icons?.Document,
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
        },
        [CONST.SEARCH.SEARCH_KEYS.SUBMIT]: {
            key: CONST.SEARCH.SEARCH_KEYS.SUBMIT,
            translationPath: 'common.submit',
            type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
            icon: icons?.Pencil,
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
        },
        [CONST.SEARCH.SEARCH_KEYS.APPROVE]: {
            key: CONST.SEARCH.SEARCH_KEYS.APPROVE,
            translationPath: 'search.bulkActions.approve',
            type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
            icon: icons?.ThumbsUp,
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
        },
        [CONST.SEARCH.SEARCH_KEYS.EXPORT]: {
            key: CONST.SEARCH.SEARCH_KEYS.EXPORT,
            translationPath: 'common.export',
            type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
            icon: Expensicons.CheckCircle,
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
        },
        [CONST.SEARCH.SEARCH_KEYS.STATEMENTS]: {
            key: CONST.SEARCH.SEARCH_KEYS.STATEMENTS,
            translationPath: 'search.statements',
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
                status: [CONST.SEARCH.STATUS.EXPENSE.DRAFTS, CONST.SEARCH.STATUS.EXPENSE.OUTSTANDING],
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
        },
        [CONST.SEARCH.SEARCH_KEYS.RECONCILIATION]: {
            key: CONST.SEARCH.SEARCH_KEYS.RECONCILIATION,
            translationPath: 'search.reconciliation',
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            icon: 'Bank',
            searchQuery: buildQueryStringFromFilterFormValues({
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                withdrawalType: CONST.SEARCH.WITHDRAWAL_TYPE.REIMBURSEMENT,
                withdrawnOn: CONST.SEARCH.DATE_PRESETS.LAST_MONTH,
                groupBy: CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID,
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
        },
        [CONST.SEARCH.SEARCH_KEYS.TOP_SPENDERS]: createTopSearchMenuItem(CONST.SEARCH.SEARCH_KEYS.TOP_SPENDERS, 'search.topSpenders', 'User', CONST.SEARCH.GROUP_BY.FROM),
        [CONST.SEARCH.SEARCH_KEYS.TOP_CATEGORIES]: createTopSearchMenuItem(
            CONST.SEARCH.SEARCH_KEYS.TOP_CATEGORIES,
            'search.topCategories',
            'Folder',
            CONST.SEARCH.GROUP_BY.CATEGORY,
            CONST.SEARCH.TOP_SEARCH_LIMIT,
        ),
        [CONST.SEARCH.SEARCH_KEYS.TOP_MERCHANTS]: createTopSearchMenuItem(
            CONST.SEARCH.SEARCH_KEYS.TOP_MERCHANTS,
            'search.topMerchants',
            'Basket',
            CONST.SEARCH.GROUP_BY.MERCHANT,
            CONST.SEARCH.TOP_SEARCH_LIMIT,
        ),
    };
}

function getDefaultActionableSearchMenuItem(menuItems: SearchTypeMenuItem[]) {
    return menuItems.find((item) => item.key === CONST.SEARCH.SEARCH_KEYS.APPROVE) ?? menuItems.find((item) => item.key === CONST.SEARCH.SEARCH_KEYS.SUBMIT);
}

function getSuggestedSearchesVisibility(
    currentUserEmail: string | undefined,
    cardFeedsByPolicy: Record<string, CardFeedForDisplay[]>,
    policies: OnyxCollection<OnyxTypes.Policy>,
    defaultExpensifyCard: CardFeedForDisplay | undefined,
): Record<ValueOf<typeof CONST.SEARCH.SEARCH_KEYS>, boolean> {
    let shouldShowSubmitSuggestion = false;
    let shouldShowPaySuggestion = false;
    let shouldShowApproveSuggestion = false;
    let shouldShowExportSuggestion = false;
    let shouldShowStatementsSuggestion = false;
    let shouldShowUnapprovedCashSuggestion = false;
    let shouldShowUnapprovedCardSuggestion = false;
    let shouldShowReconciliationSuggestion = false;
    let shouldShowTopSpendersSuggestion = false;
    let shouldShowTopCategoriesSuggestion = false;
    let shouldShowTopMerchantsSuggestion = false;

    const hasCardFeed = Object.values(cardFeedsByPolicy ?? {}).some((feeds) => feeds.length > 0);

    Object.values(policies ?? {}).some((policy) => {
        if (!policy) {
            return false;
        }

        const isPaidPolicy = isPaidGroupPolicy(policy);
        const isPayer = isPolicyPayer(policy, currentUserEmail);
        const isAdmin = policy.role === CONST.POLICY.ROLE.ADMIN;
        const isExporter = policy.exporter === currentUserEmail;
        const isApprover = policy.approver === currentUserEmail;
        const isApprovalEnabled = policy.approvalMode ? policy.approvalMode !== CONST.POLICY.APPROVAL_MODE.OPTIONAL : false;

        const hasExportError = (Object.keys(policy.connections ?? {}) as ConnectionName[]).some((connection) => {
            return hasSynchronizationErrorMessage(policy, connection, false);
        });
        const isPaymentEnabled = arePaymentsEnabled(policy);
        const hasVBBA = !!policy.achAccount?.bankAccountID && policy.achAccount.state === CONST.BANK_ACCOUNT.STATE.OPEN;
        const hasReimburser = !!policy.achAccount?.reimburser;
        const isECardEnabled = !!policy.areExpensifyCardsEnabled;
        const isSubmittedTo = Object.values(policy.employeeList ?? {}).some((employee) => {
            return employee.submitsTo === currentUserEmail || employee.forwardsTo === currentUserEmail;
        });

        const isEligibleForSubmitSuggestion = isPaidPolicy;
        const isEligibleForPaySuggestion = isPaidPolicy && isPayer;
        const isEligibleForApproveSuggestion = isPaidPolicy && isApprovalEnabled && (isApprover || isSubmittedTo);
        const isEligibleForExportSuggestion = isExporter && !hasExportError;
        const isEligibleForStatementsSuggestion = isPaidPolicy && !!policy.areCompanyCardsEnabled && hasCardFeed;
        const isEligibleForUnapprovedCashSuggestion = isPaidPolicy && isAdmin && isApprovalEnabled && isPaymentEnabled;
        const isEligibleForUnapprovedCardSuggestion = isPaidPolicy && isAdmin && isApprovalEnabled && (hasCardFeed || !!defaultExpensifyCard);
        const isEligibleForReconciliationSuggestion = isPaidPolicy && isAdmin && ((isPaymentEnabled && hasVBBA && hasReimburser) || isECardEnabled);
        const isAuditor = policy.role === CONST.POLICY.ROLE.AUDITOR;
        const isEligibleForTopSpendersSuggestion = isPaidPolicy && (isAdmin || isAuditor || isApprover);
        const isEligibleForTopCategoriesSuggestion = isPaidPolicy;
        const isEligibleForTopMerchantsSuggestion = isPaidPolicy;

        shouldShowSubmitSuggestion ||= isEligibleForSubmitSuggestion;
        shouldShowPaySuggestion ||= isEligibleForPaySuggestion;
        shouldShowApproveSuggestion ||= isEligibleForApproveSuggestion;
        shouldShowExportSuggestion ||= isEligibleForExportSuggestion;
        shouldShowStatementsSuggestion ||= isEligibleForStatementsSuggestion;
        shouldShowUnapprovedCashSuggestion ||= isEligibleForUnapprovedCashSuggestion;
        shouldShowUnapprovedCardSuggestion ||= isEligibleForUnapprovedCardSuggestion;
        shouldShowReconciliationSuggestion ||= isEligibleForReconciliationSuggestion;
        shouldShowTopSpendersSuggestion ||= isEligibleForTopSpendersSuggestion;
        shouldShowTopCategoriesSuggestion ||= isEligibleForTopCategoriesSuggestion;
        shouldShowTopMerchantsSuggestion ||= isEligibleForTopMerchantsSuggestion;

        // We don't need to check the rest of the policies if we already determined that all suggestions should be displayed
        return (
            shouldShowSubmitSuggestion &&
            shouldShowPaySuggestion &&
            shouldShowApproveSuggestion &&
            shouldShowExportSuggestion &&
            shouldShowStatementsSuggestion &&
            shouldShowUnapprovedCashSuggestion &&
            shouldShowUnapprovedCardSuggestion &&
            shouldShowReconciliationSuggestion &&
            shouldShowTopSpendersSuggestion &&
            shouldShowTopCategoriesSuggestion &&
            shouldShowTopMerchantsSuggestion
        );
    });

    return {
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
        [CONST.SEARCH.SEARCH_KEYS.RECONCILIATION]: shouldShowReconciliationSuggestion,
        [CONST.SEARCH.SEARCH_KEYS.TOP_SPENDERS]: shouldShowTopSpendersSuggestion,
        [CONST.SEARCH.SEARCH_KEYS.TOP_CATEGORIES]: shouldShowTopCategoriesSuggestion,
        [CONST.SEARCH.SEARCH_KEYS.TOP_MERCHANTS]: shouldShowTopMerchantsSuggestion,
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
    const formattedTotal = getTransactionAmount(transactionItem, isExpenseReport);
    const date = transactionItem?.modifiedCreated ? transactionItem.modifiedCreated : transactionItem?.created;
    const merchant = getTransactionMerchant(transactionItem, policy);
    const formattedMerchant = merchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT || merchant === CONST.TRANSACTION.DEFAULT_MERCHANT ? '' : merchant;
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

/**
 * @private
 */
function isPolicyEntry(key: string): key is PolicyKey {
    return key.startsWith(ONYXKEYS.COLLECTION.POLICY);
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
 * Determines whether to display the merchant field based on the transactions in the search results.
 */
function getShouldShowMerchant(data: OnyxTypes.SearchResults['data']): boolean {
    return Object.keys(data).some((key) => {
        if (isTransactionEntry(key)) {
            const item = data[key];
            const merchant = item.modifiedMerchant ? item.modifiedMerchant : (item.merchant ?? '');
            return merchant !== '' && merchant !== CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT && merchant !== CONST.TRANSACTION.DEFAULT_MERCHANT;
        }
        return false;
    });
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

type ShouldShowYearResult = {
    shouldShowYearCreated: boolean;
    shouldShowYearSubmitted: boolean;
    shouldShowYearApproved: boolean;
    shouldShowYearPosted: boolean;
    shouldShowYearExported: boolean;
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
): ShouldShowYearResult {
    const result: ShouldShowYearResult = {
        shouldShowYearCreated: false,
        shouldShowYearSubmitted: false,
        shouldShowYearApproved: false,
        shouldShowYearPosted: false,
        shouldShowYearExported: false,
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

    const lastExportedActionByReportID = buildLastExportedActionByReportIDMap(data);

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

            if (item.created && DateUtils.doesDateBelongToAPastYear(item.created)) {
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
        }

        // Early exit if all flags are true
        if (result.shouldShowYearCreated && result.shouldShowYearSubmitted && result.shouldShowYearApproved && result.shouldShowYearPosted && result.shouldShowYearExported) {
            return result;
        }
    }

    return result;
}

/**
 * @private
 * Extracts all transaction violations from the search data.
 */
function getViolations(data: OnyxTypes.SearchResults['data']): OnyxCollection<OnyxTypes.TransactionViolation[]> {
    const violations: OnyxCollection<OnyxTypes.TransactionViolation[]> = {};

    for (const key in data) {
        if (isViolationEntry(key)) {
            violations[key] = data[key];
        }
    }

    return violations;
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

/**
 * @private
 * Organizes data into List Sections for display, for the TransactionListItemType of Search Results.
 *
 * Do not use directly, use only via `getSections()` facade.
 */
function getTransactionsSections(
    data: OnyxTypes.SearchResults['data'],
    currentSearch: SearchKey,
    currentAccountID: number,
    currentUserEmail: string,
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'],
    isActionLoadingSet: ReadonlySet<string> | undefined,
    bankAccountList: OnyxEntry<OnyxTypes.BankAccountList>,
    allReportMetadata: OnyxCollection<OnyxTypes.ReportMetadata>,
    reportActions: Record<string, OnyxTypes.ReportAction[]> = {},
    queryJSON?: SearchQueryJSON,
): [TransactionListItemType[], number] {
    const shouldShowMerchant = getShouldShowMerchant(data);
    const {shouldShowYearCreated, shouldShowYearSubmitted, shouldShowYearApproved, shouldShowYearPosted, shouldShowYearExported} = shouldShowYear(data);
    const {shouldShowAmountInWideColumn, shouldShowTaxAmountInWideColumn} = getWideAmountIndicators(data);

    // Pre-filter transaction keys to avoid repeated checks
    const transactionKeys = Object.keys(data).filter(isTransactionEntry);
    // Get violations - optimize by using a Map for faster lookups
    const allViolations = getViolations(data);

    // Use Map for faster lookups of personal details and reportActions
    const personalDetailsMap = new Map(Object.entries(data.personalDetailsList ?? {}));
    const {moneyRequestReportActionsByTransactionID, holdReportActionsByTransactionID} = createReportActionsLookupMaps(data);

    const transactionsSections: TransactionListItemType[] = [];

    const lastExportedActionByReportID = buildLastExportedActionByReportIDMap(data);

    // Use the provided queryJSON if available, otherwise fall back to getCurrentSearchQueryJSON()
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
                        return isValidExpenseStatus(expenseStatus) ? expenseStatusActionMapping[expenseStatus](report) : false;
                    });
                } else {
                    shouldShow = isValidExpenseStatus(status) ? expenseStatusActionMapping[status](report) : false;
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
            const transactionSection: TransactionListItemType = {
                ...transactionItem,
                keyForList: transactionItem.transactionID,
                action: allActions.at(0) ?? CONST.SEARCH.ACTION_TYPES.VIEW,
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
                violations: transactionViolations,
                category: isIOUReport ? '' : transactionItem?.category,
            };

            transactionsSections.push(transactionSection);
        }
    }
    return [transactionsSections, transactionsSections.length];
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
        allReportTransactions = getTransactionsForReport(data, report.reportID);
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
    const shouldOnlyShowElsewhere = !canBePaid && canIOUBePaid(report, chatReport, policy, bankAccountList, allReportTransactions, true, chatReportRNVP, invoiceReceiverPolicy);

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

    if (reportNVP?.exportFailedTime) {
        return allActions.length > 0 ? allActions : [CONST.SEARCH.ACTION_TYPES.VIEW];
    }

    return allActions.length > 0 ? allActions : [CONST.SEARCH.ACTION_TYPES.VIEW];
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
    archivedReportsIDList?: ArchivedReportsIDSet,
): [TaskListItemType[], number] {
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
            const parentReport = getReportOrDraftReport(taskItem.parentReportID);

            const {shouldShowYearCreated} = shouldShowYear(data);
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
                // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                const policy = getPolicy(parentReport.policyID);
                const isParentReportArchived = archivedReportsIDList?.has(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${parentReport?.reportID}`);
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                const parentReportName = getReportName(parentReport, policy, undefined, undefined, undefined, undefined, undefined, isParentReportArchived);
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
    backTo: string,
    IOUTransactionID?: string,
    transactionPreviewData?: TransactionPreviewData,
    shouldNavigate = true,
) {
    const isFromSelfDM = item.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
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
    } else {
        // For legacy transactions without an IOU action in the backend, pass transaction data
        // This allows OpenReport to create the IOU action and transaction thread on the backend
        const reportActionID = moneyRequestReportActionID ?? iouReportAction?.reportActionID;
        // Pass transaction data when there's no reportActionID OR when the item is from self DM
        // (unreported transactions have a valid reportActionID but still need transaction data for proper detection)
        const shouldPassTransactionData = !reportActionID || isFromSelfDM;
        const transaction = shouldPassTransactionData ? getTransactionFromTransactionListItem(item) : undefined;
        const transactionViolations = shouldPassTransactionData ? item.violations : undefined;
        // Use the full reportAction to preserve originalMessage.type (e.g., "track") for proper expense type detection
        const reportActionToPass = iouReportAction ?? item.reportAction ?? ({reportActionID} as OnyxTypes.ReportAction);
        transactionThreadReport = createTransactionThreadReport(item.report, reportActionToPass, transaction, transactionViolations);
    }

    if (shouldNavigate) {
        // Navigate to transaction thread if there are multiple transactions in the report, or to the parent report if it's the only transaction
        const isFromOneTransactionReport = isOneTransactionReport(item.report);
        const shouldNavigateToTransactionThread = (!isFromOneTransactionReport || isFromSelfDM) && transactionThreadReport?.reportID !== CONST.REPORT.UNREPORTED_REPORT_ID;
        const targetReportID = shouldNavigateToTransactionThread ? transactionThreadReport?.reportID : item.reportID;

        Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID: targetReportID, backTo})));
    }
}

/**
 * @private
 * Organizes data into List Sections for display, for the ReportActionListItemType of Search Results.
 *
 * Do not use directly, use only via `getSections()` facade.
 */
function getReportActionsSections(data: OnyxTypes.SearchResults['data']): [ReportActionListItemType[], number] {
    const reportActionItems: ReportActionListItemType[] = [];

    const transactions = Object.keys(data)
        .filter(isTransactionEntry)
        .map((key) => data[key]);

    const reports = Object.keys(data)
        .filter(isReportEntry)
        .map((key) => data[key]);

    const policies = Object.keys(data)
        .filter(isPolicyEntry)
        .map((key) => data[key]);

    let n = 0;

    for (const key in data) {
        if (isReportActionEntry(key)) {
            const reportActions = Object.values(data[key]);
            n += reportActions.length;
            for (const reportAction of reportActions) {
                const from = reportAction.accountID ? (data.personalDetailsList?.[reportAction.accountID] ?? emptyPersonalDetails) : emptyPersonalDetails;
                const report = data[`${ONYXKEYS.COLLECTION.REPORT}${reportAction.reportID}`] ?? {};
                const policy = data[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`] ?? {};
                const originalMessage = isMoneyRequestAction(reportAction) ? getOriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.IOU>(reportAction) : undefined;
                const isSendingMoney = isMoneyRequestAction(reportAction) && originalMessage?.type === CONST.IOU.REPORT_ACTION_TYPE.PAY && originalMessage?.IOUDetails;
                const isReportArchived = isArchivedReport(data[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`]);
                const invoiceReceiverPolicy: OnyxTypes.Policy | undefined =
                    report?.invoiceReceiver?.type === CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS ? data[`${ONYXKEYS.COLLECTION.POLICY}${report.invoiceReceiver.policyID}`] : undefined;
                if (
                    !shouldReportActionBeVisible(reportAction, reportAction.reportActionID, canUserPerformWriteAction(report, isReportArchived)) ||
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
                    from,
                    // eslint-disable-next-line @typescript-eslint/no-deprecated
                    reportName: getSearchReportName({report, policy, personalDetails: data.personalDetailsList, transactions, invoiceReceiverPolicy, reports, policies, isReportArchived}),
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
}: GetReportSectionsParams): [TransactionGroupListItemType[], number] {
    const shouldShowMerchant = getShouldShowMerchant(data);

    const {
        shouldShowYearCreated: shouldShowYearCreatedTransaction,
        shouldShowYearSubmitted: shouldShowYearSubmittedTransaction,
        shouldShowYearApproved: shouldShowYearApprovedTransaction,
        shouldShowYearPosted: shouldShowYearPostedTransaction,
        shouldShowYearExported: shouldShowYearExportedTransaction,
    } = shouldShowYear(data);
    const {shouldShowAmountInWideColumn, shouldShowTaxAmountInWideColumn} = getWideAmountIndicators(data);
    const {moneyRequestReportActionsByTransactionID, holdReportActionsByTransactionID} = createReportActionsLookupMaps(data);

    // Get violations - optimize by using a Map for faster lookups
    const allViolations = getViolations(data);

    const queryJSON = getCurrentSearchQueryJSON();
    const reportIDToTransactions: Record<string, TransactionReportGroupListItemType> = {};

    const {reportKeys, transactionKeys} = Object.keys(data).reduce(
        (acc, key) => {
            if (isReportEntry(key)) {
                acc.reportKeys.push(key);
            } else if (isTransactionEntry(key)) {
                acc.transactionKeys.push(key);
            }
            return acc;
        },
        {reportKeys: [] as string[], transactionKeys: [] as string[]},
    );

    const orderedKeys: string[] = [...reportKeys, ...transactionKeys];
    const {
        shouldShowYearCreated: shouldShowYearCreatedReport,
        shouldShowYearSubmitted: shouldShowYearSubmittedReport,
        shouldShowYearApproved: shouldShowYearApprovedReport,
        shouldShowYearExported: shouldShowYearExportedReport,
    } = shouldShowYear(data, true);

    const lastExportedActionByReportID = buildLastExportedActionByReportIDMap(data);

    for (const key of orderedKeys) {
        if (isReportEntry(key) && (data[key].type === CONST.REPORT.TYPE.IOU || data[key].type === CONST.REPORT.TYPE.EXPENSE || data[key].type === CONST.REPORT.TYPE.INVOICE)) {
            const reportItem = {...data[key]} as OnyxTypes.Report;
            const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${reportItem.reportID}`;
            const transactions = reportIDToTransactions[reportKey]?.transactions ?? [];
            const isIOUReport = reportItem.type === CONST.REPORT.TYPE.IOU;
            const actions = reportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportItem.reportID}`];

            let shouldShow = true;

            const isActionLoading = isActionLoadingSet?.has(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportItem.reportID}`);
            if (queryJSON && !isActionLoading) {
                if (queryJSON.type === CONST.SEARCH.DATA_TYPES.EXPENSE) {
                    const status = queryJSON.status;

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
                const allActions = getActions(data, allViolations, key, currentSearch, currentUserEmail, currentAccountID, bankAccountList, reportMetadata, actions);

                const fromDetails =
                    data.personalDetailsList?.[reportItem.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID] ??
                    getPersonalDetailsForAccountID(reportItem.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID) ??
                    emptyPersonalDetails;
                const toDetails = !shouldShowBlankTo && reportItem.managerID ? data.personalDetailsList?.[reportItem.managerID] : emptyPersonalDetails;

                const formattedFrom = formatPhoneNumber(getDisplayNameOrDefault(fromDetails));
                const formattedTo = !shouldShowBlankTo ? formatPhoneNumber(getDisplayNameOrDefault(toDetails)) : '';

                const formattedStatus = getReportStatusTranslation({stateNum: reportItem.stateNum, statusNum: reportItem.statusNum, translate});

                const allReportTransactions = getTransactionsForReport(data, reportItem.reportID);
                const policyFromKey = getPolicyFromKey(data, reportItem);
                const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${reportItem?.policyID ?? String(CONST.DEFAULT_NUMBER_ID)}`] ?? policyFromKey;

                const shouldShowStatusAsPending = !!isOffline && reportItem?.pendingFields?.nextStep === CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE;

                const hasAnyViolationsForReport = hasAnyViolations(
                    reportItem.reportID,
                    allTransactionViolations ?? allViolations,
                    currentAccountID ?? CONST.DEFAULT_NUMBER_ID,
                    currentUserEmail,
                    allReportTransactions,
                    reportItem,
                    policy,
                );
                const hasVisibleViolationsForReport =
                    hasAnyViolationsForReport &&
                    ViolationsUtils.hasVisibleViolationsForUser(
                        reportItem,
                        allTransactionViolations ?? allViolations,
                        currentUserEmail,
                        currentAccountID ?? CONST.DEFAULT_NUMBER_ID,
                        policy,
                        allReportTransactions,
                    );

                reportIDToTransactions[reportKey] = {
                    ...reportItem,
                    action: allActions.at(0) ?? CONST.SEARCH.ACTION_TYPES.VIEW,
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
            const from = reportAction?.actorAccountID ? (data.personalDetailsList?.[reportAction.actorAccountID] ?? emptyPersonalDetails) : emptyPersonalDetails;
            const to = getToFieldValueForTransaction(transactionItem, report, data.personalDetailsList, reportAction);
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
            const transaction = {
                ...transactionItem,
                action: allActions.at(0) ?? CONST.SEARCH.ACTION_TYPES.VIEW,
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
                shouldShowYear: shouldShowYearCreatedTransaction,
                shouldShowYearSubmitted: shouldShowYearSubmittedTransaction,
                shouldShowYearApproved: shouldShowYearApprovedTransaction,
                shouldShowYearPosted: shouldShowYearPostedTransaction,
                shouldShowYearExported: shouldShowYearExportedTransaction,
                keyForList: transactionItem.transactionID,
                violations: transactionViolations,
                isAmountColumnWide: shouldShowAmountInWideColumn,
                isTaxAmountColumnWide: shouldShowTaxAmountInWideColumn,
                category: isIOUReport ? '' : transactionItem?.category,
            };
            if (reportIDToTransactions[reportKey]?.transactions) {
                reportIDToTransactions[reportKey].transactions.push(transaction);
                reportIDToTransactions[reportKey].from = data?.personalDetailsList?.[data?.[reportKey as ReportKey]?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID] ?? emptyPersonalDetails;
            } else if (reportIDToTransactions[reportKey]) {
                reportIDToTransactions[reportKey].transactions = [transaction];
                reportIDToTransactions[reportKey].from = data?.personalDetailsList?.[data?.[reportKey as ReportKey]?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID] ?? emptyPersonalDetails;
            }
        }
    }

    const reportIDToTransactionsValues = Object.values(reportIDToTransactions);
    return [reportIDToTransactionsValues, reportIDToTransactionsValues.length];
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
): [TransactionMemberGroupListItemType[], number] {
    const memberSections: Record<string, TransactionMemberGroupListItemType> = {};

    for (const key in data) {
        if (isGroupEntry(key)) {
            const memberGroup = data[key] as SearchMemberGroup;

            const personalDetails = data.personalDetailsList?.[memberGroup.accountID] ?? emptyPersonalDetails;
            let transactionsQueryJSON: SearchQueryJSON | undefined;
            if (queryJSON && memberGroup.accountID) {
                const newFlatFilters = queryJSON.flatFilters.filter((filter) => filter.key !== CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM);
                newFlatFilters.push({key: CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM, filters: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: memberGroup.accountID}]});

                const newQueryJSON: SearchQueryJSON = {...queryJSON, groupBy: undefined, flatFilters: newFlatFilters};
                const newQuery = buildSearchQueryString(newQueryJSON);

                transactionsQueryJSON = buildSearchQueryJSON(newQuery);
            }

            memberSections[key] = {
                groupedBy: CONST.SEARCH.GROUP_BY.FROM,
                transactions: [],
                transactionsQueryJSON,
                ...personalDetails,
                ...memberGroup,
                formattedFrom: formatPhoneNumber(getDisplayNameOrDefault(personalDetails)),
            };
        }
    }

    const memberSectionsValues = Object.values(memberSections);
    return [memberSectionsValues, memberSectionsValues.length];
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
): [TransactionCardGroupListItemType[], number] {
    const cardSections: Record<string, TransactionCardGroupListItemType> = {};

    for (const key in data) {
        if (isGroupEntry(key)) {
            const cardGroup = data[key] as SearchCardGroup;
            const personalDetails = data.personalDetailsList?.[cardGroup.accountID] ?? emptyPersonalDetails;
            let transactionsQueryJSON: SearchQueryJSON | undefined;
            if (queryJSON && cardGroup.cardID) {
                const newFlatFilters = queryJSON.flatFilters.filter((filter) => filter.key !== CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID);
                newFlatFilters.push({key: CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID, filters: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: cardGroup.cardID}]});
                const newQueryJSON: SearchQueryJSON = {...queryJSON, groupBy: undefined, flatFilters: newFlatFilters};
                const newQuery = buildSearchQueryString(newQueryJSON);
                transactionsQueryJSON = buildSearchQueryJSON(newQuery);
            }

            if (!cardGroup.cardID) {
                continue;
            }

            // Find the custom feed name from all card feeds
            let customFeedName: string | undefined;
            if (cardFeeds) {
                for (const feedData of Object.values(cardFeeds)) {
                    const nickname = feedData?.settings?.companyCardNicknames?.[cardGroup.bank as OnyxTypes.CompanyCardFeed];
                    if (nickname) {
                        customFeedName = nickname;
                        break;
                    }
                }
            }

            cardSections[key] = {
                groupedBy: CONST.SEARCH.GROUP_BY.CARD,
                transactions: [],
                transactionsQueryJSON,
                ...personalDetails,
                ...cardGroup,
                formattedCardName: getCardDescription(
                    {
                        cardID: cardGroup.cardID,
                        bank: cardGroup.bank,
                        cardName: cardGroup.cardName,
                        lastFourPAN: cardGroup.lastFourPAN,
                    } as OnyxTypes.Card,
                    translate,
                ),
                formattedFeedName: getCustomOrFormattedFeedName(translate, cardGroup.bank as OnyxTypes.CompanyCardFeed, customFeedName) ?? '',
            };
        }
    }

    const cardSectionsValues = Object.values(cardSections);
    return [cardSectionsValues, cardSectionsValues.length];
}

/**
 * @private
 * Organizes data into List Sections grouped by card for display, for the TransactionWithdrawalIDGroupListItemType of Search Results.
 *
 * Do not use directly, use only via `getSections()` facade.
 */
function getWithdrawalIDSections(data: OnyxTypes.SearchResults['data'], queryJSON: SearchQueryJSON | undefined): [TransactionWithdrawalIDGroupListItemType[], number] {
    const withdrawalIDSections: Record<string, TransactionWithdrawalIDGroupListItemType> = {};

    for (const key in data) {
        if (isGroupEntry(key)) {
            const withdrawalIDGroup = data[key] as SearchWithdrawalIDGroup;
            let transactionsQueryJSON: SearchQueryJSON | undefined;
            if (queryJSON && withdrawalIDGroup.entryID) {
                const newFlatFilters = queryJSON.flatFilters.filter((filter) => filter.key !== CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_ID);
                newFlatFilters.push({key: CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_ID, filters: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: withdrawalIDGroup.entryID}]});
                const newQueryJSON: SearchQueryJSON = {...queryJSON, groupBy: undefined, flatFilters: newFlatFilters};
                const newQuery = buildSearchQueryString(newQueryJSON);
                transactionsQueryJSON = buildSearchQueryJSON(newQuery);
            }

            if (!withdrawalIDGroup.accountNumber) {
                continue;
            }

            withdrawalIDSections[key] = {
                groupedBy: CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID,
                transactions: [],
                transactionsQueryJSON,
                ...withdrawalIDGroup,
                formattedWithdrawalID: String(withdrawalIDGroup.entryID),
            };
        }
    }

    const withdrawalIDSectionsValues = Object.values(withdrawalIDSections);
    return [withdrawalIDSectionsValues, withdrawalIDSectionsValues.length];
}

/**
 * @private
 * Organizes data into List Sections grouped by category for display, for the TransactionGroupListItemType of Search Results.
 *
 * Do not use directly, use only via `getSections()` facade.
 */
function getCategorySections(data: OnyxTypes.SearchResults['data'], queryJSON: SearchQueryJSON | undefined): [TransactionCategoryGroupListItemType[], number] {
    const categorySections: Record<string, TransactionCategoryGroupListItemType> = {};

    for (const key in data) {
        if (isGroupEntry(key)) {
            const categoryGroup = data[key] as SearchCategoryGroup;

            let transactionsQueryJSON: SearchQueryJSON | undefined;
            if (queryJSON && categoryGroup.category !== undefined) {
                // Normalize empty category to CATEGORY_EMPTY_VALUE to avoid invalid query like "category:"
                const categoryValue = categoryGroup.category === '' ? CONST.SEARCH.CATEGORY_EMPTY_VALUE : categoryGroup.category;

                const newFlatFilters = queryJSON.flatFilters.filter((filter) => filter.key !== CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY);
                newFlatFilters.push({key: CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY, filters: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: categoryValue}]});

                const newQueryJSON: SearchQueryJSON = {...queryJSON, groupBy: undefined, flatFilters: newFlatFilters};

                const newQuery = buildSearchQueryString(newQueryJSON);

                transactionsQueryJSON = buildSearchQueryJSON(newQuery);
            }

            // Format the category name - decode HTML entities for display, keep empty/none values as-is
            const rawCategory = categoryGroup.category;
            const formattedCategory = !rawCategory || rawCategory === CONST.SEARCH.CATEGORY_EMPTY_VALUE ? rawCategory : getDecodedCategoryName(rawCategory);

            categorySections[key] = {
                groupedBy: CONST.SEARCH.GROUP_BY.CATEGORY,
                transactions: [],
                transactionsQueryJSON,
                ...categoryGroup,
                formattedCategory,
            };
        }
    }

    const categorySectionsValues = Object.values(categorySections);
    return [categorySectionsValues, categorySectionsValues.length];
}

/**
 * @private
 * Organizes data into List Sections grouped by merchant for display, for the TransactionGroupListItemType of Search Results.
 *
 * Do not use directly, use only via `getSections()` facade.
 */
function getMerchantSections(data: OnyxTypes.SearchResults['data'], queryJSON: SearchQueryJSON | undefined, translate: LocalizedTranslate): [TransactionMerchantGroupListItemType[], number] {
    const merchantSections: Record<string, TransactionMerchantGroupListItemType> = {};

    for (const key in data) {
        if (isGroupEntry(key)) {
            const merchantGroup = data[key] as SearchMerchantGroup;

            let transactionsQueryJSON: SearchQueryJSON | undefined;
            if (queryJSON && merchantGroup.merchant !== undefined) {
                // Normalize empty merchant to MERCHANT_EMPTY_VALUE to avoid invalid query like "merchant:"
                const merchantValue = merchantGroup.merchant === '' ? CONST.SEARCH.MERCHANT_EMPTY_VALUE : merchantGroup.merchant;

                const newFlatFilters = queryJSON.flatFilters.filter((filter) => filter.key !== CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT);
                newFlatFilters.push({key: CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT, filters: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: merchantValue}]});

                const newQueryJSON: SearchQueryJSON = {...queryJSON, groupBy: undefined, flatFilters: newFlatFilters};

                const newQuery = buildSearchQueryString(newQueryJSON);

                transactionsQueryJSON = buildSearchQueryJSON(newQuery);
            }

            // Format the merchant name - use translated "No merchant" for empty values so it sorts alphabetically
            // Handle all known empty merchant values:
            // - Empty string or falsy
            // - MERCHANT_EMPTY_VALUE ('none') - used in search queries
            // - DEFAULT_MERCHANT ('Expense') - system default for expenses without merchant
            // - PARTIAL_TRANSACTION_MERCHANT ('(none)') - used for partial/incomplete transactions
            // - UNKNOWN_MERCHANT ('Unknown Merchant') - used when merchant cannot be determined
            const rawMerchant = merchantGroup.merchant;
            const isEmptyMerchant =
                !rawMerchant ||
                rawMerchant === CONST.SEARCH.MERCHANT_EMPTY_VALUE ||
                rawMerchant === CONST.TRANSACTION.DEFAULT_MERCHANT ||
                rawMerchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT ||
                rawMerchant === CONST.TRANSACTION.UNKNOWN_MERCHANT;
            const formattedMerchant = isEmptyMerchant ? translate('search.noMerchant') : rawMerchant;

            merchantSections[key] = {
                groupedBy: CONST.SEARCH.GROUP_BY.MERCHANT,
                transactions: [],
                transactionsQueryJSON,
                ...merchantGroup,
                formattedMerchant,
            };
        }
    }

    const merchantSectionsValues = Object.values(merchantSections);
    return [merchantSectionsValues, merchantSectionsValues.length];
}

/**
 * @private
 * Organizes data into List Sections grouped by tag for display, for the TransactionGroupListItemType of Search Results.
 *
 * Do not use directly, use only via `getSections()` facade.
 */
function getTagSections(data: OnyxTypes.SearchResults['data'], queryJSON: SearchQueryJSON | undefined, translate: LocalizedTranslate): [TransactionTagGroupListItemType[], number] {
    const tagSections: Record<string, TransactionTagGroupListItemType> = {};

    for (const key in data) {
        if (isGroupEntry(key)) {
            const tagGroup = data[key] as SearchTagGroup;

            let transactionsQueryJSON: SearchQueryJSON | undefined;
            if (queryJSON && tagGroup.tag !== undefined) {
                // Normalize empty tag or "(untagged)" to TAG_EMPTY_VALUE to avoid invalid query like "tag:"
                const tagValue = tagGroup.tag === '' || tagGroup.tag === '(untagged)' ? CONST.SEARCH.TAG_EMPTY_VALUE : tagGroup.tag;

                const newFlatFilters = queryJSON.flatFilters.filter((filter) => filter.key !== CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG);
                newFlatFilters.push({key: CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG, filters: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: tagValue}]});

                const newQueryJSON: SearchQueryJSON = {...queryJSON, groupBy: undefined, flatFilters: newFlatFilters};

                const newQuery = buildSearchQueryString(newQueryJSON);

                transactionsQueryJSON = buildSearchQueryJSON(newQuery);
            }

            // Format the tag name - use translated "No tag" for empty values so it sorts alphabetically
            const rawTag = tagGroup.tag;
            const isEmptyTag = !rawTag || rawTag === CONST.SEARCH.TAG_EMPTY_VALUE || rawTag === '(untagged)';
            const formattedTag = isEmptyTag ? translate('search.noTag') : getCleanedTagName(rawTag);

            tagSections[key] = {
                groupedBy: CONST.SEARCH.GROUP_BY.TAG,
                transactions: [],
                transactionsQueryJSON,
                ...tagGroup,
                formattedTag,
            };
        }
    }

    const tagSectionsValues = Object.values(tagSections);
    return [tagSectionsValues, tagSectionsValues.length];
}

/**
 * @private
 * Organizes data into List Sections grouped by month for display, for the TransactionGroupListItemType of Search Results.
 *
 * Do not use directly, use only via `getSections()` facade.
 */
function getMonthSections(data: OnyxTypes.SearchResults['data'], queryJSON: SearchQueryJSON | undefined): [TransactionMonthGroupListItemType[], number] {
    const monthSections: Record<string, TransactionMonthGroupListItemType> = {};
    for (const key in data) {
        if (isGroupEntry(key)) {
            const monthGroup = data[key];
            // Check if this is a month group by checking for year and month properties
            if (!('year' in monthGroup) || !('month' in monthGroup)) {
                continue;
            }
            let transactionsQueryJSON: SearchQueryJSON | undefined;
            if (queryJSON && monthGroup.year && monthGroup.month) {
                // Create date range for the month (first day to last day of the month)
                const {start: monthStart, end: monthEnd} = DateUtils.getMonthDateRange(monthGroup.year, monthGroup.month);
                const newFlatFilters = queryJSON.flatFilters.filter((filter) => filter.key !== CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE);
                newFlatFilters.push({
                    key: CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE,
                    filters: [
                        {operator: CONST.SEARCH.SYNTAX_OPERATORS.GREATER_THAN_OR_EQUAL_TO, value: monthStart},
                        {operator: CONST.SEARCH.SYNTAX_OPERATORS.LOWER_THAN_OR_EQUAL_TO, value: monthEnd},
                    ],
                });
                const newQueryJSON: SearchQueryJSON = {...queryJSON, groupBy: undefined, flatFilters: newFlatFilters};
                const newQuery = buildSearchQueryString(newQueryJSON);
                transactionsQueryJSON = buildSearchQueryJSON(newQuery);
            }

            // Format month display: "January 2026"
            const monthDate = new Date(monthGroup.year, monthGroup.month - 1, 1);
            const formattedMonth = format(monthDate, 'MMMM yyyy');

            monthSections[key] = {
                groupedBy: CONST.SEARCH.GROUP_BY.MONTH,
                transactions: [],
                transactionsQueryJSON,
                ...monthGroup,
                formattedMonth,
                sortKey: monthGroup.year * 100 + monthGroup.month,
            };
        }
    }

    const monthSectionsValues = Object.values(monthSections);
    return [monthSectionsValues, monthSectionsValues.length];
}

/**
 * Returns sections for week-grouped search results.
 * Do not use directly, use only via `getSections()` facade.
 */
function getWeekSections(data: OnyxTypes.SearchResults['data'], queryJSON: SearchQueryJSON | undefined): [TransactionWeekGroupListItemType[], number] {
    const weekSections: Record<string, TransactionWeekGroupListItemType> = {};
    for (const key in data) {
        if (isGroupEntry(key)) {
            const weekGroup = data[key];
            // Check if this is a week group by checking for week property
            if (!('week' in weekGroup)) {
                continue;
            }
            let transactionsQueryJSON: SearchQueryJSON | undefined;
            const {start: weekStart, end: weekEnd} = adjustTimeRangeToDateFilters(
                DateUtils.getWeekDateRange(weekGroup.week),
                queryJSON?.flatFilters.find((filter) => filter.key === CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE),
            );
            if (queryJSON && weekGroup.week) {
                const newFlatFilters = queryJSON.flatFilters.filter((filter) => filter.key !== CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE);
                newFlatFilters.push({
                    key: CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE,
                    filters: [
                        {operator: CONST.SEARCH.SYNTAX_OPERATORS.GREATER_THAN_OR_EQUAL_TO, value: weekStart},
                        {operator: CONST.SEARCH.SYNTAX_OPERATORS.LOWER_THAN_OR_EQUAL_TO, value: weekEnd},
                    ],
                });
                const newQueryJSON: SearchQueryJSON = {...queryJSON, groupBy: undefined, flatFilters: newFlatFilters};
                const newQuery = buildSearchQueryString(newQueryJSON);
                transactionsQueryJSON = buildSearchQueryJSON(newQuery);
            }
            const formattedWeek = DateUtils.getFormattedDateRangeForSearch(weekStart, weekEnd);

            weekSections[key] = {
                groupedBy: CONST.SEARCH.GROUP_BY.WEEK,
                transactions: [],
                transactionsQueryJSON,
                ...weekGroup,
                formattedWeek,
            };
        }
    }

    const weekSectionsValues = Object.values(weekSections);
    return [weekSectionsValues, weekSectionsValues.length];
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
    allTransactionViolations,
    allReportMetadata,
}: GetSectionsParams) {
    if (type === CONST.SEARCH.DATA_TYPES.CHAT) {
        return getReportActionsSections(data);
    }
    if (type === CONST.SEARCH.DATA_TYPES.TASK) {
        return getTaskSections(data, formatPhoneNumber, archivedReportsIDList);
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
        });
    }

    if (groupBy) {
        // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
        // eslint-disable-next-line default-case
        switch (groupBy) {
            case CONST.SEARCH.GROUP_BY.FROM:
                return getMemberSections(data, queryJSON, formatPhoneNumber);
            case CONST.SEARCH.GROUP_BY.CARD:
                return getCardSections(data, queryJSON, translate, cardFeeds);
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
        }
    }

    return getTransactionsSections(
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
    );
}

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
        // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
        // eslint-disable-next-line default-case
        switch (groupBy) {
            case CONST.SEARCH.GROUP_BY.FROM:
                return getSortedMemberData(data as TransactionMemberGroupListItemType[], localeCompare, sortBy, sortOrder);
            case CONST.SEARCH.GROUP_BY.CARD:
                return getSortedCardData(data as TransactionCardGroupListItemType[], localeCompare, sortBy, sortOrder);
            case CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID:
                return getSortedWithdrawalIDData(data as TransactionWithdrawalIDGroupListItemType[], localeCompare, sortBy, sortOrder);
            case CONST.SEARCH.GROUP_BY.CATEGORY:
                return getSortedCategoryData(data as TransactionCategoryGroupListItemType[], localeCompare, sortBy, sortOrder);
            case CONST.SEARCH.GROUP_BY.MERCHANT:
                return getSortedMerchantData(data as TransactionMerchantGroupListItemType[], localeCompare, sortBy, sortOrder);
            case CONST.SEARCH.GROUP_BY.TAG:
                return getSortedTagData(data as TransactionTagGroupListItemType[], localeCompare, sortBy, sortOrder);
            case CONST.SEARCH.GROUP_BY.MONTH:
                return getSortedMonthData(data as TransactionMonthGroupListItemType[], localeCompare, sortBy, sortOrder);
            case CONST.SEARCH.GROUP_BY.WEEK:
                return getSortedWeekData(data as TransactionWeekGroupListItemType[], localeCompare, sortBy, sortOrder);
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

            const aValue = !aIsUnreported ? getPolicyName({report: a.report}) : '';
            const bValue = !bIsUnreported ? getPolicyName({report: b.report}) : '';
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
            aValue = a.type === CONST.REPORT.TYPE.IOU ? aValue : -(aValue as number);
            bValue = b.type === CONST.REPORT.TYPE.IOU ? bValue : -(bValue as number);
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
 * Sorts member sections based on a specified column and sort order.
 */
function getSortedMemberData(data: TransactionMemberGroupListItemType[], localeCompare: LocaleContextProps['localeCompare'], sortBy?: SearchColumnType, sortOrder?: SortOrder) {
    return getSortedData(data, localeCompare, transactionMemberGroupColumnNamesToSortingProperty, (a, b) => localeCompare(a.formattedFrom ?? '', b.formattedFrom ?? ''), sortBy, sortOrder);
}

/**
 * @private
 * Sorts card sections based on a specified column and sort order.
 */
function getSortedCardData(data: TransactionCardGroupListItemType[], localeCompare: LocaleContextProps['localeCompare'], sortBy?: SearchColumnType, sortOrder?: SortOrder) {
    return getSortedData(
        data,
        localeCompare,
        transactionCardGroupColumnNamesToSortingProperty,
        (a, b) => localeCompare(a.formattedCardName ?? '', b.formattedCardName ?? ''),
        sortBy,
        sortOrder,
    );
}

/**
 * @private
 * Sorts withdrawal ID sections based on a specified column and sort order.
 */
function getSortedWithdrawalIDData(data: TransactionWithdrawalIDGroupListItemType[], localeCompare: LocaleContextProps['localeCompare'], sortBy?: SearchColumnType, sortOrder?: SortOrder) {
    return getSortedData(data, localeCompare, transactionWithdrawalIDGroupColumnNamesToSortingProperty, (a, b) => localeCompare(a.debitPosted, b.debitPosted), sortBy, sortOrder);
}

/**
 * @private
 * Sorts category sections based on a specified column and sort order.
 */
function getSortedCategoryData(data: TransactionCategoryGroupListItemType[], localeCompare: LocaleContextProps['localeCompare'], sortBy?: SearchColumnType, sortOrder?: SortOrder) {
    return getSortedData(
        data,
        localeCompare,
        transactionCategoryGroupColumnNamesToSortingProperty,
        (a, b) => localeCompare(a.formattedCategory ?? '', b.formattedCategory ?? ''),
        sortBy,
        sortOrder,
    );
}

/**
 * @private
 * Sorts merchant sections based on a specified column and sort order.
 */
function getSortedMerchantData(data: TransactionMerchantGroupListItemType[], localeCompare: LocaleContextProps['localeCompare'], sortBy?: SearchColumnType, sortOrder?: SortOrder) {
    return getSortedData(
        data,
        localeCompare,
        transactionMerchantGroupColumnNamesToSortingProperty,
        (a, b) => localeCompare(a.formattedMerchant ?? '', b.formattedMerchant ?? ''),
        sortBy,
        sortOrder,
    );
}

/**
 * @private
 * Sorts tag sections based on a specified column and sort order.
 */
function getSortedTagData(data: TransactionTagGroupListItemType[], localeCompare: LocaleContextProps['localeCompare'], sortBy?: SearchColumnType, sortOrder?: SortOrder) {
    return getSortedData(data, localeCompare, transactionTagGroupColumnNamesToSortingProperty, (a, b) => localeCompare(a.formattedTag ?? '', b.formattedTag ?? ''), sortBy, sortOrder);
}

/**
 * @private
 * Sorts month sections based on a specified column and sort order.
 */
function getSortedMonthData(data: TransactionMonthGroupListItemType[], localeCompare: LocaleContextProps['localeCompare'], sortBy?: SearchColumnType, sortOrder?: SortOrder) {
    return getSortedData(data, localeCompare, transactionMonthGroupColumnNamesToSortingProperty, (a, b) => a.sortKey - b.sortKey, sortBy, sortOrder);
}

/**
 * Sorts week group data based on a specified column and sort order.
 */
function getSortedWeekData(data: TransactionWeekGroupListItemType[], localeCompare: LocaleContextProps['localeCompare'], sortBy?: SearchColumnType, sortOrder?: SortOrder) {
    return getSortedData(data, localeCompare, transactionWeekGroupColumnNamesToSortingProperty, (a, b) => localeCompare(a.week, b.week), sortBy, sortOrder);
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
        default:
            return [];
    }
}

function getSearchColumnTranslationKey(columnId: SearchCustomColumnIds): TranslationPaths {
    // eslint-disable-next-line default-case
    switch (columnId) {
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
    }
}

type OverflowMenuIconsType = Record<'Pencil', IconAsset>;

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
            icon: Expensicons.Trashcan,
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

function isTodoSearch(hash: number, suggestedSearches: Record<string, SearchTypeMenuItem>) {
    const TODO_KEYS: SearchKey[] = [CONST.SEARCH.SEARCH_KEYS.SUBMIT, CONST.SEARCH.SEARCH_KEYS.APPROVE, CONST.SEARCH.SEARCH_KEYS.PAY, CONST.SEARCH.SEARCH_KEYS.EXPORT];
    const matchedSearchKey = Object.values(suggestedSearches).find((search) => search.hash === hash)?.key;
    return !!matchedSearchKey && TODO_KEYS.includes(matchedSearchKey);
}

// eslint-disable-next-line @typescript-eslint/max-params
function createTypeMenuSections(
    icons: Record<'Document' | 'Pencil' | 'ThumbsUp', IconAsset>,
    currentUserEmail: string | undefined,
    currentUserAccountID: number | undefined,
    cardFeedsByPolicy: Record<string, CardFeedForDisplay[]>,
    defaultCardFeed: CardFeedForDisplay | undefined,
    policies: OnyxCollection<OnyxTypes.Policy>,
    savedSearches: OnyxEntry<OnyxTypes.SaveSearch>,
    isOffline: boolean,
    defaultExpensifyCard: CardFeedForDisplay | undefined,
    shouldRedirectToExpensifyClassic: boolean,
    draftTransactions: OnyxCollection<OnyxTypes.Transaction>,
    reportCounts: {[CONST.SEARCH.SEARCH_KEYS.SUBMIT]: number; [CONST.SEARCH.SEARCH_KEYS.APPROVE]: number; [CONST.SEARCH.SEARCH_KEYS.PAY]: number; [CONST.SEARCH.SEARCH_KEYS.EXPORT]: number},
): SearchTypeMenuSection[] {
    const typeMenuSections: SearchTypeMenuSection[] = [];

    const suggestedSearches = getSuggestedSearches(currentUserAccountID, defaultCardFeed?.id, icons);
    const suggestedSearchesVisibility = getSuggestedSearchesVisibility(currentUserEmail, cardFeedsByPolicy, policies, defaultExpensifyCard);

    // Todo section
    {
        const todoSection: SearchTypeMenuSection = {
            translationPath: 'common.todo',
            menuItems: [],
        };

        if (suggestedSearchesVisibility[CONST.SEARCH.SEARCH_KEYS.SUBMIT]) {
            const groupPoliciesWithChatEnabled = getGroupPaidPoliciesWithExpenseChatEnabled(policies);
            todoSection.menuItems.push({
                ...suggestedSearches[CONST.SEARCH.SEARCH_KEYS.SUBMIT],
                badgeText: formatBadgeText(reportCounts[CONST.SEARCH.SEARCH_KEYS.SUBMIT]),
                emptyState: {
                    title: 'search.searchResults.emptySubmitResults.title',
                    subtitle: 'search.searchResults.emptySubmitResults.subtitle',
                    buttons:
                        groupPoliciesWithChatEnabled.length > 0
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

                                              startMoneyRequest(CONST.IOU.TYPE.CREATE, generateReportID(), CONST.IOU.REQUEST_TYPE.SCAN, false, undefined, draftTransactions);
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
                badgeText: formatBadgeText(reportCounts[CONST.SEARCH.SEARCH_KEYS.APPROVE]),
                emptyState: {
                    title: 'search.searchResults.emptyApproveResults.title',
                    subtitle: 'search.searchResults.emptyApproveResults.subtitle',
                },
            });
        }
        if (suggestedSearchesVisibility[CONST.SEARCH.SEARCH_KEYS.PAY]) {
            todoSection.menuItems.push({
                ...suggestedSearches[CONST.SEARCH.SEARCH_KEYS.PAY],
                badgeText: formatBadgeText(reportCounts[CONST.SEARCH.SEARCH_KEYS.PAY]),
                emptyState: {
                    title: 'search.searchResults.emptyPayResults.title',
                    subtitle: 'search.searchResults.emptyPayResults.subtitle',
                },
            });
        }
        if (suggestedSearchesVisibility[CONST.SEARCH.SEARCH_KEYS.EXPORT]) {
            todoSection.menuItems.push({
                ...suggestedSearches[CONST.SEARCH.SEARCH_KEYS.EXPORT],
                badgeText: formatBadgeText(reportCounts[CONST.SEARCH.SEARCH_KEYS.EXPORT]),
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

    // Accounting section
    {
        const accountingSection: SearchTypeMenuSection = {
            translationPath: 'workspace.common.accounting',
            menuItems: [],
        };

        if (suggestedSearchesVisibility[CONST.SEARCH.SEARCH_KEYS.STATEMENTS]) {
            accountingSection.menuItems.push({
                ...suggestedSearches[CONST.SEARCH.SEARCH_KEYS.STATEMENTS],
                emptyState: {
                    title: 'search.searchResults.emptyStatementsResults.title',
                    subtitle: 'search.searchResults.emptyStatementsResults.subtitle',
                },
            });
        }
        if (suggestedSearchesVisibility[CONST.SEARCH.SEARCH_KEYS.UNAPPROVED_CASH]) {
            accountingSection.menuItems.push({
                ...suggestedSearches[CONST.SEARCH.SEARCH_KEYS.UNAPPROVED_CASH],
                emptyState: {
                    title: 'search.searchResults.emptyUnapprovedResults.title',
                    subtitle: 'search.searchResults.emptyUnapprovedResults.subtitle',
                },
            });
        }
        if (suggestedSearchesVisibility[CONST.SEARCH.SEARCH_KEYS.UNAPPROVED_CARD]) {
            accountingSection.menuItems.push({
                ...suggestedSearches[CONST.SEARCH.SEARCH_KEYS.UNAPPROVED_CARD],
                emptyState: {
                    title: 'search.searchResults.emptyUnapprovedResults.title',
                    subtitle: 'search.searchResults.emptyUnapprovedResults.subtitle',
                },
            });
        }
        if (suggestedSearchesVisibility[CONST.SEARCH.SEARCH_KEYS.RECONCILIATION]) {
            accountingSection.menuItems.push({
                ...suggestedSearches[CONST.SEARCH.SEARCH_KEYS.RECONCILIATION],
                emptyState: {
                    title: 'search.searchResults.emptyStatementsResults.title',
                    subtitle: 'search.searchResults.emptyStatementsResults.subtitle',
                },
            });
        }

        if (accountingSection.menuItems.length > 0) {
            typeMenuSections.push(accountingSection);
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

        const insightsSearchKeys = [CONST.SEARCH.SEARCH_KEYS.TOP_SPENDERS, CONST.SEARCH.SEARCH_KEYS.TOP_CATEGORIES, CONST.SEARCH.SEARCH_KEYS.TOP_MERCHANTS];

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

    // Explore section
    {
        const exploreSection: SearchTypeMenuSection = {
            translationPath: 'common.explore',
            menuItems: [],
        };

        if (suggestedSearchesVisibility[CONST.SEARCH.SEARCH_KEYS.EXPENSES]) {
            exploreSection.menuItems.push(suggestedSearches[CONST.SEARCH.SEARCH_KEYS.EXPENSES]);
        }
        if (suggestedSearchesVisibility[CONST.SEARCH.SEARCH_KEYS.REPORTS]) {
            exploreSection.menuItems.push(suggestedSearches[CONST.SEARCH.SEARCH_KEYS.REPORTS]);
        }
        if (suggestedSearchesVisibility[CONST.SEARCH.SEARCH_KEYS.CHATS]) {
            exploreSection.menuItems.push(suggestedSearches[CONST.SEARCH.SEARCH_KEYS.CHATS]);
        }

        if (exploreSection.menuItems.length > 0) {
            typeMenuSections.push(exploreSection);
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
    const isDataLoaded = searchResults?.data !== undefined && searchResults?.search?.type === queryJSON?.type && sortedSearchResultStatus === sortedQueryJSONStatus;

    return isDataLoaded;
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

function getGroupCurrencyOptions(currencyList: OnyxTypes.CurrencyList, getCurrencySymbol: CurrencyListContextProps['getCurrencySymbol']) {
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

function getFeedOptions(allCardFeeds: OnyxCollection<OnyxTypes.CardFeeds>, allCards: OnyxTypes.CardList | undefined) {
    return Object.values(getCardFeedsForDisplay(allCardFeeds, allCards)).map<SingleSelectItem<string>>((cardFeed) => ({
        text: cardFeed.name,
        value: cardFeed.id,
    }));
}

function getDatePresets(filterKey: SearchDateFilterKeys, hasFeed: boolean): SearchDatePreset[] {
    const defaultPresets = [CONST.SEARCH.DATE_PRESETS.THIS_MONTH, CONST.SEARCH.DATE_PRESETS.LAST_MONTH, CONST.SEARCH.DATE_PRESETS.NEVER] as SearchDatePreset[];

    if (filterKey.startsWith(CONST.SEARCH.REPORT_FIELD.GLOBAL_PREFIX)) {
        return [CONST.SEARCH.DATE_PRESETS.THIS_MONTH, CONST.SEARCH.DATE_PRESETS.LAST_MONTH];
    }

    switch (filterKey) {
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.POSTED:
            return [CONST.SEARCH.DATE_PRESETS.THIS_MONTH, CONST.SEARCH.DATE_PRESETS.LAST_MONTH, ...(hasFeed ? [CONST.SEARCH.DATE_PRESETS.LAST_STATEMENT] : [])];
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE:
            return [CONST.SEARCH.DATE_PRESETS.THIS_MONTH, CONST.SEARCH.DATE_PRESETS.LAST_MONTH, CONST.SEARCH.DATE_PRESETS.YEAR_TO_DATE];
        default:
            return defaultPresets;
    }
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
function getColumnsToShow(
    currentAccountID: number | undefined,
    data: OnyxTypes.SearchResults['data'] | OnyxTypes.Transaction[],
    visibleColumns: SearchCustomColumnIds[] = [],
    isExpenseReportView = false,
    type?: SearchDataTypes,
    groupBy?: SearchGroupBy,
    isExpenseReportViewFromIOUReport = false,
    shouldShowBillableColumn = false,
    shouldShowReimbursableColumn = false,
): SearchColumnType[] {
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
        }[groupBy];

        const filteredVisibleColumns = customColumns ? visibleColumns.filter((column) => Object.values(customColumns).includes(column as ValueOf<typeof customColumns>)) : [];
        const columnsToShow: SearchColumnType[] = filteredVisibleColumns.length ? filteredVisibleColumns : (defaultCustomColumns ?? []);

        if (groupBy === CONST.SEARCH.GROUP_BY.FROM) {
            const requiredColumns = new Set<SearchColumnType>([CONST.SEARCH.TABLE_COLUMNS.AVATAR, CONST.SEARCH.TABLE_COLUMNS.GROUP_FROM]);
            const result: SearchColumnType[] = [];

            for (const col of requiredColumns) {
                if (!columnsToShow.includes(col)) {
                    result.push(col);
                }
            }

            for (const col of columnsToShow ?? []) {
                result.push(col);
            }

            return result;
        }

        if (groupBy === CONST.SEARCH.GROUP_BY.CARD) {
            const requiredColumns = new Set<SearchColumnType>([CONST.SEARCH.TABLE_COLUMNS.AVATAR, CONST.SEARCH.TABLE_COLUMNS.GROUP_CARD]);
            const result: SearchColumnType[] = [];

            for (const col of requiredColumns) {
                if (!columnsToShow.includes(col)) {
                    result.push(col);
                }
            }

            for (const col of columnsToShow ?? []) {
                result.push(col);
            }

            return result;
        }

        if (groupBy === CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID) {
            const requiredColumns = new Set<SearchColumnType>([CONST.SEARCH.TABLE_COLUMNS.AVATAR, CONST.SEARCH.TABLE_COLUMNS.GROUP_WITHDRAWAL_ID]);
            const result: SearchColumnType[] = [];

            for (const col of requiredColumns) {
                if (!columnsToShow.includes(col)) {
                    result.push(col);
                }
            }

            for (const col of columnsToShow ?? []) {
                result.push(col);
            }

            return result;
        }

        if (groupBy === CONST.SEARCH.GROUP_BY.CATEGORY) {
            const requiredColumns = new Set<SearchColumnType>([CONST.SEARCH.TABLE_COLUMNS.GROUP_CATEGORY]);
            const result: SearchColumnType[] = [];

            for (const col of requiredColumns) {
                if (!columnsToShow.includes(col)) {
                    result.push(col);
                }
            }

            for (const col of columnsToShow ?? []) {
                result.push(col);
            }

            return result;
        }

        if (groupBy === CONST.SEARCH.GROUP_BY.MERCHANT) {
            const requiredColumns = new Set<SearchColumnType>([CONST.SEARCH.TABLE_COLUMNS.GROUP_MERCHANT]);
            const result: SearchColumnType[] = [];

            for (const col of requiredColumns) {
                if (!columnsToShow.includes(col as SearchCustomColumnIds)) {
                    result.push(col);
                }
            }

            for (const col of columnsToShow) {
                result.push(col);
            }

            return result;
        }

        if (groupBy === CONST.SEARCH.GROUP_BY.TAG) {
            const requiredColumns = new Set<SearchColumnType>([CONST.SEARCH.TABLE_COLUMNS.GROUP_TAG]);
            const result: SearchColumnType[] = [];

            for (const col of requiredColumns) {
                if (!columnsToShow.includes(col as SearchCustomColumnIds)) {
                    result.push(col);
                }
            }

            for (const col of columnsToShow) {
                result.push(col);
            }

            return result;
        }

        if (groupBy === CONST.SEARCH.GROUP_BY.MONTH) {
            const requiredColumns = new Set<SearchColumnType>([CONST.SEARCH.TABLE_COLUMNS.GROUP_MONTH]);
            const result: SearchColumnType[] = [];

            for (const col of requiredColumns) {
                if (!columnsToShow.includes(col)) {
                    result.push(col);
                }
            }

            for (const col of columnsToShow ?? []) {
                result.push(col);
            }

            return result;
        }

        if (groupBy === CONST.SEARCH.GROUP_BY.WEEK) {
            const requiredColumns = new Set<SearchColumnType>([CONST.SEARCH.TABLE_COLUMNS.GROUP_WEEK]);
            const result: SearchColumnType[] = [];

            for (const col of requiredColumns) {
                if (!columnsToShow.includes(col)) {
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
              [CONST.SEARCH.TABLE_COLUMNS.REIMBURSABLE]: shouldShowReimbursableColumn,
              [CONST.SEARCH.TABLE_COLUMNS.BILLABLE]: shouldShowBillableColumn,
              [CONST.SEARCH.TABLE_COLUMNS.COMMENTS]: true,
              [CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT]: true,
          }
        : {
              [CONST.SEARCH.TABLE_COLUMNS.RECEIPT]: true,
              [CONST.SEARCH.TABLE_COLUMNS.TYPE]: true,
              [CONST.SEARCH.TABLE_COLUMNS.DATE]: true,
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
              [CONST.SEARCH.TABLE_COLUMNS.STATUS]: false,
              [CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT]: true,
              [CONST.SEARCH.TABLE_COLUMNS.ACTION]: true,
          };

    // If the user has set custom columns for the search, we need to respect their preference and order
    const filteredVisibleColumns = visibleColumns.filter((column) => {
        return Object.values(CONST.SEARCH.TYPE_CUSTOM_COLUMNS.EXPENSE).includes(column as ValueOf<typeof CONST.SEARCH.TYPE_CUSTOM_COLUMNS.EXPENSE>);
    });

    if (!arraysEqual(Object.values(CONST.SEARCH.TYPE_DEFAULT_COLUMNS.EXPENSE), filteredVisibleColumns) && filteredVisibleColumns.length > 0) {
        const requiredColumns = new Set<SearchColumnType>([CONST.SEARCH.TABLE_COLUMNS.AVATAR, CONST.SEARCH.TABLE_COLUMNS.TYPE, CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT]);
        const result: SearchColumnType[] = [];

        // Add required columns that aren't in visibleColumns at the start
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

    const {moneyRequestReportActionsByTransactionID} = Array.isArray(data) ? {} : createReportActionsLookupMaps(data);
    const updateColumns = (transaction: OnyxTypes.Transaction) => {
        const merchant = transaction.modifiedMerchant ? transaction.modifiedMerchant : (transaction.merchant ?? '');
        if ((merchant !== '' && merchant !== CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT && merchant !== CONST.TRANSACTION.DEFAULT_MERCHANT) || isScanning(transaction)) {
            columns[CONST.SEARCH.TABLE_COLUMNS.MERCHANT] = true;
        }

        if (getDescription(transaction) !== '') {
            columns[CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION] = true;
        }

        const category = getCategory(transaction);
        if (category !== '' && category !== CONST.SEARCH.CATEGORY_EMPTY_VALUE) {
            columns[CONST.SEARCH.TABLE_COLUMNS.CATEGORY] = !isExpenseReportViewFromIOUReport;
        }

        const tag = getTag(transaction);
        if (tag !== '' && tag !== CONST.SEARCH.TAG_EMPTY_VALUE) {
            columns[CONST.SEARCH.TABLE_COLUMNS.TAG] = !isExpenseReportViewFromIOUReport;
        }

        if (isExpenseReportView) {
            return;
        }

        // The From/To columns display logic depends on the passed report/reportAction i.e. if data is SearchResults and not an array (Transaction[])
        if (!Array.isArray(data)) {
            const report = data[`${ONYXKEYS.COLLECTION.REPORT}${transaction.reportID}`] as OnyxTypes.Report | undefined;
            const reportAction = moneyRequestReportActionsByTransactionID?.get(transaction.transactionID);

            // Handle From&To columns that are only shown in the Reports page
            // if From or To differ from current user in any transaction, show the columns
            const accountID = reportAction?.actorAccountID;
            if (accountID && accountID !== currentAccountID) {
                columns[CONST.SEARCH.TABLE_COLUMNS.FROM] = true;
            }

            columns[CONST.SEARCH.TABLE_COLUMNS.CATEGORY] = columns[CONST.SEARCH.TABLE_COLUMNS.CATEGORY] && !isIOUReportReportUtil(report);
            columns[CONST.SEARCH.TABLE_COLUMNS.TAG] = columns[CONST.SEARCH.TABLE_COLUMNS.TAG] && !isIOUReportReportUtil(report);

            // eslint-disable-next-line @typescript-eslint/no-deprecated
            const toFieldValue = getToFieldValueForTransaction(transaction, report, data.personalDetailsList, reportAction);
            if (toFieldValue.accountID && toFieldValue.accountID !== currentAccountID && !columns[CONST.SEARCH.TABLE_COLUMNS.TO]) {
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

    return (Object.keys(columns) as SearchColumnType[]).filter((col) => columns[col]);
}

/**
 * Maps numeric state value to settlement status
 * State mapping confirmed by backend team (@JS00001):
 * - 5, 6, 7: Failed
 * - 8: Cleared (succeeded and complete)
 * - All others: Pending (processing)
 */
const settlementStatusMap = new Map<number, ValueOf<typeof CONST.SEARCH.SETTLEMENT_STATUS>>([
    [5, CONST.SEARCH.SETTLEMENT_STATUS.FAILED],
    [6, CONST.SEARCH.SETTLEMENT_STATUS.FAILED],
    [7, CONST.SEARCH.SETTLEMENT_STATUS.FAILED],
    [8, CONST.SEARCH.SETTLEMENT_STATUS.CLEARED],
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

function getTableMinWidth(columns: SearchColumnType[]) {
    // Starts at 24px to account for the checkbox width
    let minWidth = 24;

    for (const column of columns) {
        if (column === CONST.SEARCH.TABLE_COLUMNS.RECEIPT || column === CONST.SEARCH.TABLE_COLUMNS.COMMENTS) {
            minWidth += 36;
        } else if (column === CONST.SEARCH.TABLE_COLUMNS.AVATAR) {
            minWidth += 40;
        } else if (column === CONST.SEARCH.TABLE_COLUMNS.STATUS || column === CONST.SEARCH.TABLE_COLUMNS.ACTION) {
            minWidth += 80;
        } else if (column === CONST.SEARCH.TABLE_COLUMNS.DATE) {
            minWidth += 48;
        } else if (column === CONST.SEARCH.TABLE_COLUMNS.SUBMITTED || column === CONST.SEARCH.TABLE_COLUMNS.APPROVED || column === CONST.SEARCH.TABLE_COLUMNS.POSTED) {
            minWidth += 72;
        } else if (column === CONST.SEARCH.TABLE_COLUMNS.TYPE) {
            minWidth += 20;
        } else if (column === CONST.SEARCH.TABLE_COLUMNS.REIMBURSABLE || column === CONST.SEARCH.TABLE_COLUMNS.BILLABLE) {
            minWidth += 92;
        } else {
            minWidth += 200;
        }
    }
    return minWidth;
}

function shouldShowDeleteOption(selectedTransactions: Record<string, SelectedTransactionInfo>, currentSearchResults: SearchResults['data'] | undefined, isOffline: boolean) {
    const selectedTransactionsKeys = Object.keys(selectedTransactions);

    return (
        !isOffline &&
        selectedTransactionsKeys.every((id) => {
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
        })
    );
}

/**
 * Converts a date preset string to actual date range
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
        default:
            // For other presets or unknown values, return empty range (will be ignored)
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

function adjustTimeRangeToDateFilters(timeRange: {start: string; end: string}, dateFilter: QueryFilters[0] | undefined): {start: string; end: string} {
    if (!dateFilter?.filters) {
        return timeRange;
    }

    const {start: timeRangeStart, end: timeRangeEnd} = timeRange;
    const startLimitFilter = dateFilter.filters.find((filter) => filter.operator === CONST.SEARCH.SYNTAX_OPERATORS.GREATER_THAN_OR_EQUAL_TO);
    const endLimitFilter = dateFilter.filters.find((filter) => filter.operator === CONST.SEARCH.SYNTAX_OPERATORS.LOWER_THAN_OR_EQUAL_TO);
    const equalToFilter = dateFilter.filters.find((filter) => filter.operator === CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO);

    // Check if any filter value is a date preset and convert it to actual date range
    let limitsStart: string | undefined;
    let limitsEnd: string | undefined;

    // Handle GREATER_THAN_OR_EQUAL_TO operator
    if (startLimitFilter?.value) {
        const value = String(startLimitFilter.value);
        if (isDatePreset(value)) {
            const presetRange = getDateRangeForPreset(value);
            limitsStart = presetRange.start || undefined;
        } else {
            limitsStart = value;
        }
    }

    // Handle LOWER_THAN_OR_EQUAL_TO operator
    if (endLimitFilter?.value) {
        const value = String(endLimitFilter.value);
        if (isDatePreset(value)) {
            const presetRange = getDateRangeForPreset(value);
            limitsEnd = presetRange.end || undefined;
        } else {
            limitsEnd = value;
        }
    }

    // Handle EQUAL_TO operator (for presets like "this-month", "last-month", "year-to-date")
    if (equalToFilter?.value) {
        const value = String(equalToFilter.value);
        if (isDatePreset(value)) {
            const presetRange = getDateRangeForPreset(value);
            if (presetRange.start && presetRange.end) {
                // If we don't have start/end limits yet, use the preset range
                if (!limitsStart) {
                    limitsStart = presetRange.start;
                }
                if (!limitsEnd) {
                    limitsEnd = presetRange.end;
                }
                // If we have both limits, use the intersection (max start, min end)
                if (limitsStart && presetRange.start > limitsStart) {
                    limitsStart = presetRange.start;
                }
                if (limitsEnd && presetRange.end < limitsEnd) {
                    limitsEnd = presetRange.end;
                }
            }
        }
    }

    // Adjust the start date: use max(timeRangeStart, limitsStart) if limitsStart exists
    // Dates are in YYYY-MM-DD format, so lexicographic comparison works correctly
    let adjustedStart = timeRangeStart;
    if (limitsStart && limitsStart > timeRangeStart) {
        adjustedStart = limitsStart;
    }

    // Adjust the end date: use min(timeRangeEnd, limitsEnd) if limitsEnd exists
    let adjustedEnd = timeRangeEnd;
    if (limitsEnd && limitsEnd < timeRangeEnd) {
        adjustedEnd = limitsEnd;
    }

    return {
        start: adjustedStart,
        end: adjustedEnd,
    };
}

export {
    getSuggestedSearches,
    getDefaultActionableSearchMenuItem,
    getListItem,
    getSections,
    getSuggestedSearchesVisibility,
    getShouldShowMerchant,
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
    createBaseSavedSearchMenuItem,
    shouldShowEmptyState,
    compareValues,
    isSearchDataLoaded,
    getStatusOptions,
    getTypeOptions,
    getGroupByOptions,
    getGroupCurrencyOptions,
    getFeedOptions,
    getWideAmountIndicators,
    isTransactionAmountTooLong,
    isTransactionTaxAmountTooLong,
    getDatePresets,
    createAndOpenSearchTransactionThread,
    getWithdrawalTypeOptions,
    getActionOptions,
    getColumnsToShow,
    getHasOptions,
    getSettlementStatus,
    getSettlementStatusBadgeProps,
    getTransactionFromTransactionListItem,
    getSearchColumnTranslationKey,
    getTableMinWidth,
    getCustomColumns,
    getCustomColumnDefault,
    shouldShowDeleteOption,
    getToFieldValueForTransaction,
    isTodoSearch,
    adjustTimeRangeToDateFilters,
};
export type {SavedSearchMenuItem, SearchTypeMenuSection, SearchTypeMenuItem, SearchDateModifier, SearchDateModifierLower, SearchKey, ArchivedReportsIDSet};
