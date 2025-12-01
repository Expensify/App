import type {TextStyle, ViewStyle} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {LocaleContextProps, LocalizedTranslate} from '@components/LocaleContextProvider';
import DotLottieAnimations from '@components/LottieAnimations';
import type DotLottieAnimation from '@components/LottieAnimations/types';
import type {MenuItemWithLink} from '@components/MenuItemList';
import type {MultiSelectItem} from '@components/Search/FilterDropdowns/MultiSelectPopup';
import type {SingleSelectItem} from '@components/Search/FilterDropdowns/SingleSelectPopup';
import type {
    SearchAction,
    SearchColumnType,
    SearchDateFilterKeys,
    SearchDatePreset,
    SearchGroupBy,
    SearchQueryJSON,
    SearchStatus,
    SearchWithdrawalType,
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
    TransactionGroupListItemType,
    TransactionListItemType,
    TransactionMemberGroupListItemType,
    TransactionReportGroupListItemType,
    TransactionWithdrawalIDGroupListItemType,
} from '@components/SelectionListWithSections/types';
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
    SearchDataTypes,
    SearchMemberGroup,
    SearchReport,
    SearchTask,
    SearchTransaction,
    SearchTransactionAction,
    SearchWithdrawalIDGroup,
} from '@src/types/onyx/SearchResults';
import type IconAsset from '@src/types/utils/IconAsset';
import {hasSynchronizationErrorMessage} from './actions/connections';
import {canApproveIOU, canIOUBePaid, canSubmitReport} from './actions/IOU';
import {createNewReport, createTransactionThreadReport} from './actions/Report';
import type {TransactionPreviewData} from './actions/Search';
import {setOptimisticDataForTransactionThreadPreview, updateSearchResultsWithTransactionThreadReportID} from './actions/Search';
import type {CardFeedForDisplay} from './CardFeedUtils';
import {getCardFeedsForDisplay} from './CardFeedUtils';
import {convertToDisplayString, getCurrencySymbol} from './CurrencyUtils';
import DateUtils from './DateUtils';
import interceptAnonymousUser from './interceptAnonymousUser';
// eslint-disable-next-line @typescript-eslint/no-deprecated
import {translateLocal} from './Localize';
import Navigation from './Navigation/Navigation';
import Parser from './Parser';
import {getDisplayNameOrDefault} from './PersonalDetailsUtils';
import {arePaymentsEnabled, canSendInvoice, getGroupPaidPoliciesWithExpenseChatEnabled, getPolicy, isPaidGroupPolicy, isPolicyPayer} from './PolicyUtils';
import {
    getOriginalMessage,
    isCreatedAction,
    isDeletedAction,
    isHoldAction,
    isMoneyRequestAction,
    isResolvedActionableWhisper,
    isWhisperActionTargetedToOthers,
    shouldReportActionBeVisible,
} from './ReportActionsUtils';
import {canReview} from './ReportPreviewActionUtils';
import {isExportAction} from './ReportPrimaryActionUtils';
import {
    canUserPerformWriteAction,
    getIcons,
    getPersonalDetailsForAccountID,
    getReportName,
    getReportOrDraftReport,
    getReportStatusTranslation,
    getSearchReportName,
    hasAnyViolations,
    hasInvoiceReports,
    hasOnlyHeldExpenses,
    isAllowedToApproveExpenseReport as isAllowedToApproveExpenseReportUtils,
    isArchivedReport,
    isClosedReport,
    isInvoiceReport,
    isMoneyRequestReport,
    isOpenExpenseReport,
    isOpenReport,
    isSettled,
} from './ReportUtils';
import {buildCannedSearchQuery, buildQueryStringFromFilterFormValues, buildSearchQueryJSON, buildSearchQueryString, getCurrentSearchQueryJSON} from './SearchQueryUtils';
import StringUtils from './StringUtils';
import {shouldRestrictUserBillableActions} from './SubscriptionUtils';
import {getIOUPayerAndReceiver} from './TransactionPreviewUtils';
import {
    getCategory,
    getDescription,
    getTag,
    getTaxAmount,
    getAmount as getTransactionAmount,
    getCreated as getTransactionCreatedDate,
    getMerchant as getTransactionMerchant,
    isPending,
    isScanning,
    isUnreportedAndHasInvalidDistanceRateTransaction,
    isViolationDismissed,
} from './TransactionUtils';
import shouldShowTransactionYear from './TransactionUtils/shouldShowTransactionYear';
import ViolationsUtils from './Violations/ViolationsUtils';

type ColumnSortMapping<T> = Partial<Record<SearchColumnType, keyof T | null>>;
type ColumnVisibility = Partial<Record<SearchColumnType, boolean>>;

type TransactionSorting = ColumnSortMapping<TransactionListItemType>;
type TaskSorting = ColumnSortMapping<TaskListItemType>;
type ExpenseReportSorting = ColumnSortMapping<ExpenseReportListItemType>;

const transactionColumnNamesToSortingProperty: TransactionSorting = {
    [CONST.SEARCH.TABLE_COLUMNS.TO]: 'formattedTo' as const,
    [CONST.SEARCH.TABLE_COLUMNS.FROM]: 'formattedFrom' as const,
    [CONST.SEARCH.TABLE_COLUMNS.DATE]: 'date' as const,
    [CONST.SEARCH.TABLE_COLUMNS.TAG]: 'tag' as const,
    [CONST.SEARCH.TABLE_COLUMNS.MERCHANT]: 'formattedMerchant' as const,
    [CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT]: 'formattedTotal' as const,
    [CONST.SEARCH.TABLE_COLUMNS.CATEGORY]: 'category' as const,
    [CONST.SEARCH.TABLE_COLUMNS.TYPE]: null,
    [CONST.SEARCH.TABLE_COLUMNS.ACTION]: 'action' as const,
    [CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION]: 'comment' as const,
    [CONST.SEARCH.TABLE_COLUMNS.TAX_AMOUNT]: null,
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
    [CONST.SEARCH.TABLE_COLUMNS.STATUS]: 'formattedStatus' as const,
    [CONST.SEARCH.TABLE_COLUMNS.TITLE]: 'reportName' as const,
    [CONST.SEARCH.TABLE_COLUMNS.FROM]: 'formattedFrom' as const,
    [CONST.SEARCH.TABLE_COLUMNS.TO]: 'formattedTo' as const,
    [CONST.SEARCH.TABLE_COLUMNS.TOTAL]: 'total' as const,
    [CONST.SEARCH.TABLE_COLUMNS.ACTION]: 'action' as const,
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
    icon?: IconAsset;
    searchQuery: string;
    searchQueryJSON: SearchQueryJSON | undefined;
    hash: number;
    similarSearchHash: number;
    emptyState?: {
        headerMedia: DotLottieAnimation;
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
    currentAccountID: number | undefined;
    currentUserEmail: string;
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'];
    groupBy?: SearchGroupBy;
    reportActions?: Record<string, OnyxTypes.ReportAction[]>;
    currentSearch?: SearchKey;
    archivedReportsIDList?: ArchivedReportsIDSet;
    queryJSON?: SearchQueryJSON;
    isActionLoadingSet?: ReadonlySet<string>;
};

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
    icons?: Record<'Document', IconAsset>,
): Record<ValueOf<typeof CONST.SEARCH.SEARCH_KEYS>, SearchTypeMenuItem> {
    return {
        [CONST.SEARCH.SEARCH_KEYS.EXPENSES]: {
            key: CONST.SEARCH.SEARCH_KEYS.EXPENSES,
            translationPath: 'common.expenses',
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            icon: Expensicons.Receipt,
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
            icon: Expensicons.ChatBubbles,
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
            icon: Expensicons.Pencil,
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
            icon: Expensicons.ThumbsUp,
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
            icon: Expensicons.MoneyBag,
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
            icon: Expensicons.CreditCard,
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
            icon: Expensicons.MoneyHourglass,
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
            icon: Expensicons.CreditCardHourglass,
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
            icon: Expensicons.Bank,
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
    };
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

        shouldShowSubmitSuggestion ||= isEligibleForSubmitSuggestion;
        shouldShowPaySuggestion ||= isEligibleForPaySuggestion;
        shouldShowApproveSuggestion ||= isEligibleForApproveSuggestion;
        shouldShowExportSuggestion ||= isEligibleForExportSuggestion;
        shouldShowStatementsSuggestion ||= isEligibleForStatementsSuggestion;
        shouldShowUnapprovedCashSuggestion ||= isEligibleForUnapprovedCashSuggestion;
        shouldShowUnapprovedCardSuggestion ||= isEligibleForUnapprovedCardSuggestion;
        shouldShowReconciliationSuggestion ||= isEligibleForReconciliationSuggestion;

        // We don't need to check the rest of the policies if we already determined that all suggestions should be displayed
        return (
            shouldShowSubmitSuggestion &&
            shouldShowPaySuggestion &&
            shouldShowApproveSuggestion &&
            shouldShowExportSuggestion &&
            shouldShowStatementsSuggestion &&
            shouldShowUnapprovedCashSuggestion &&
            shouldShowUnapprovedCardSuggestion &&
            shouldShowReconciliationSuggestion
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
    };
}

/**
 * @private
 *
 * Returns a list of properties that are common to every Search ListItem
 */
function getTransactionItemCommonFormattedProperties(
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    transactionItem: SearchTransaction,
    from: OnyxTypes.PersonalDetails,
    to: OnyxTypes.PersonalDetails,
    policy: OnyxTypes.Policy,
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'],
    report: OnyxTypes.Report | undefined,
): Pick<TransactionListItemType, 'formattedFrom' | 'formattedTo' | 'formattedTotal' | 'formattedMerchant' | 'date'> {
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
    const formattedMerchant = merchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT ? '' : merchant;

    return {
        formattedFrom,
        formattedTo,
        date,
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
            return merchant !== '' && merchant !== CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT;
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

// eslint-disable-next-line @typescript-eslint/no-deprecated
function isTransactionAmountTooLong(transactionItem: TransactionListItemType | SearchTransaction | OnyxTypes.Transaction) {
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const amount = Math.abs(transactionItem.modifiedAmount || transactionItem.amount);
    return isAmountTooLong(amount);
}

// eslint-disable-next-line @typescript-eslint/no-deprecated
function isTransactionTaxAmountTooLong(transactionItem: TransactionListItemType | SearchTransaction | OnyxTypes.Transaction) {
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

    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const processTransaction = (transaction: TransactionListItemType | SearchTransaction) => {
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

/**
 * Checks if the date of transactions or reports indicate the need to display the year because they are from a past year.
 * @param data - The search results data (array or object)
 * @param checkOnlyReports - When true and data is an object, only check report dates (skip transactions and report actions)
 */
function shouldShowYear(data: TransactionListItemType[] | TransactionGroupListItemType[] | TaskListItemType[] | OnyxTypes.SearchResults['data'], checkOnlyReports = false) {
    const currentYear = new Date().getFullYear();

    if (Array.isArray(data)) {
        return data.some((item: TransactionListItemType | TransactionGroupListItemType | TaskListItemType) => {
            if (isTaskListItemType(item)) {
                const taskYear = new Date(item.created).getFullYear();
                return taskYear !== currentYear;
            }

            if (isTransactionGroupListItemType(item)) {
                // If the item is a TransactionGroupListItemType, iterate over its transactions and check them
                return item.transactions.some((transaction) => {
                    const transactionYear = new Date(getTransactionCreatedDate(transaction)).getFullYear();
                    return transactionYear !== currentYear;
                });
            }

            const createdYear = new Date(item?.modifiedCreated ? item.modifiedCreated : item?.created || '').getFullYear();
            return createdYear !== currentYear;
        });
    }

    for (const key in data) {
        if (!checkOnlyReports && isTransactionEntry(key)) {
            const item = data[key];
            if (shouldShowTransactionYear(item)) {
                return true;
            }
        } else if (!checkOnlyReports && isReportActionEntry(key)) {
            const item = data[key];
            for (const action of Object.values(item)) {
                const date = action.created;

                if (DateUtils.doesDateBelongToAPastYear(date)) {
                    return true;
                }
            }
        } else if (isReportEntry(key)) {
            const item = data[key];
            const date = item.created;

            if (date && DateUtils.doesDateBelongToAPastYear(date)) {
                return true;
            }
        }
    }
    return false;
}

/**
 * @private
 * Extracts all transaction violations from the search data.
 */
function getViolations(data: OnyxTypes.SearchResults['data']): OnyxCollection<OnyxTypes.TransactionViolation[]> {
    return Object.fromEntries(Object.entries(data).filter(([key]) => isViolationEntry(key))) as OnyxCollection<OnyxTypes.TransactionViolation[]>;
}

/**
 * @private
 * Generates a display name for IOU reports considering the personal details of the payer and the transaction details.
 */
function getIOUReportName(data: OnyxTypes.SearchResults['data'], reportItem: TransactionReportGroupListItemType) {
    const payerPersonalDetails = reportItem.managerID ? data.personalDetailsList?.[reportItem.managerID] : emptyPersonalDetails;
    // For cases where the data personal detail for manager ID do not exist in search data.personalDetailsList
    // we fallback to the display name of the personal detail data from onyx.
    const payerName = payerPersonalDetails?.displayName ?? payerPersonalDetails?.login ?? getDisplayNameOrDefault(getPersonalDetailsForAccountID(reportItem.managerID));
    const formattedAmount = convertToDisplayString(reportItem.total ?? 0, reportItem.currency ?? CONST.CURRENCY.USD);
    if (reportItem.action === CONST.SEARCH.ACTION_TYPES.PAID) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('iou.payerPaidAmount', {
            payer: payerName,
            amount: formattedAmount,
        });
    }
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return translateLocal('iou.payerOwesAmount', {
        payer: payerName,
        amount: formattedAmount,
    });
}

function getTransactionViolations(
    allViolations: OnyxCollection<OnyxTypes.TransactionViolation[]>,
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    transaction: SearchTransaction,
    currentUserEmail: string,
    report: OnyxEntry<OnyxTypes.Report>,
    policy: OnyxEntry<OnyxTypes.Policy>,
): OnyxTypes.TransactionViolation[] {
    const transactionViolations = allViolations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`];
    if (!transactionViolations) {
        return [];
    }
    return transactionViolations.filter((violation) => !isViolationDismissed(transaction, violation, currentUserEmail, report, policy));
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
    personalDetailsList: OnyxTypes.PersonalDetailsList,
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
                getIOUPayerAndReceiver(report?.managerID ?? CONST.DEFAULT_NUMBER_ID, report?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID, personalDetailsList, transactionItem.amount)?.to ??
                emptyPersonalDetails
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
    currentAccountID: number | undefined,
    currentUserEmail: string,
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'],
    isActionLoadingSet: ReadonlySet<string> | undefined,
): [TransactionListItemType[], number] {
    const shouldShowMerchant = getShouldShowMerchant(data);
    const doesDataContainAPastYearTransaction = shouldShowYear(data);
    const {shouldShowAmountInWideColumn, shouldShowTaxAmountInWideColumn} = getWideAmountIndicators(data);

    // Pre-filter transaction keys to avoid repeated checks
    const transactionKeys = Object.keys(data).filter(isTransactionEntry);
    // Get violations - optimize by using a Map for faster lookups
    const allViolations = getViolations(data);

    // Use Map for faster lookups of personal details and reportActions
    const personalDetailsMap = new Map(Object.entries(data.personalDetailsList || {}));
    const {moneyRequestReportActionsByTransactionID, holdReportActionsByTransactionID} = createReportActionsLookupMaps(data);

    const transactionsSections: TransactionListItemType[] = [];

    const queryJSON = getCurrentSearchQueryJSON();

    for (const key of transactionKeys) {
        const transactionItem = data[key];
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        const report = data[`${ONYXKEYS.COLLECTION.REPORT}${transactionItem.reportID}`] as SearchReport | undefined;

        let shouldShow = true;

        const isActionLoading = isActionLoadingSet?.has(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${transactionItem.reportID}`);
        if (queryJSON && !isActionLoading) {
            if (queryJSON.type === CONST.SEARCH.DATA_TYPES.EXPENSE) {
                const status = queryJSON.status;
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
            const transactionViolations = getTransactionViolations(allViolations, transactionItem, currentUserEmail, report, policy);
            // Use Map.get() for faster lookups with default values
            const from = reportAction?.actorAccountID ? (personalDetailsMap.get(reportAction.actorAccountID.toString()) ?? emptyPersonalDetails) : emptyPersonalDetails;
            const to = getToFieldValueForTransaction(transactionItem, report, data.personalDetailsList, reportAction);

            const {formattedFrom, formattedTo, formattedTotal, formattedMerchant, date} = getTransactionItemCommonFormattedProperties(
                transactionItem,
                from,
                to,
                policy,
                formatPhoneNumber,
                report,
            );
            const allActions = getActions(data, allViolations, key, currentSearch, currentAccountID, currentUserEmail);
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
                shouldShowMerchant,
                shouldShowYear: doesDataContainAPastYearTransaction,
                isAmountColumnWide: shouldShowAmountInWideColumn,
                isTaxAmountColumnWide: shouldShowTaxAmountInWideColumn,
                violations: transactionViolations,
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
// eslint-disable-next-line @typescript-eslint/no-deprecated
function getTransactionsForReport(data: OnyxTypes.SearchResults['data'], reportID: string): SearchTransaction[] {
    return (
        Object.entries(data)
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            .filter(([key, value]) => isTransactionEntry(key) && (value as SearchTransaction)?.reportID === reportID)
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            .map(([, value]) => value as SearchTransaction)
    );
}

/**
 * @private
 * Retrieves a report from the search data based on the provided key.
 */
function getReportFromKey(data: OnyxTypes.SearchResults['data'], key: string): OnyxTypes.Report | undefined {
    if (isTransactionEntry(key)) {
        const transaction = data[key];
        return data[`${ONYXKEYS.COLLECTION.REPORT}${transaction?.reportID}`] as OnyxTypes.Report;
    }
    if (isReportEntry(key)) {
        return data[key] as OnyxTypes.Report;
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
 * @private
 * Determines the permission flags for a user reviewing a report.
 */
function getReviewerPermissionFlags(
    report: OnyxTypes.Report,
    policy: OnyxTypes.Policy,
    currentAccountID: number | undefined,
): {
    isSubmitter: boolean;
    isAdmin: boolean;
    isApprover: boolean;
} {
    return {
        isSubmitter: report.ownerAccountID === currentAccountID,
        isAdmin: policy.role === CONST.POLICY.ROLE.ADMIN,
        isApprover: report.managerID === currentAccountID,
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
    currentAccountID: number | undefined,
    currentUserEmail: string,
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
    if (isUnreportedAndHasInvalidDistanceRateTransaction(transaction)) {
        return [CONST.SEARCH.ACTION_TYPES.REVIEW];
    }
    // Tracked and unreported expenses don't have a report, so we return early.
    if (!report) {
        return [CONST.SEARCH.ACTION_TYPES.VIEW];
    }

    const policy = getPolicyFromKey(data, report);
    const isExportAvailable = isExportAction(report, policy, reportActions) && !isTransaction;

    if (isSettled(report) && !isExportAvailable) {
        return [CONST.SEARCH.ACTION_TYPES.PAID];
    }

    // We need to check both options for a falsy value since the transaction might not have an error but the report associated with it might. We return early if there are any errors for performance reasons, so we don't need to compute any other possible actions.
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    if (transaction?.errors || report?.errors) {
        return [CONST.SEARCH.ACTION_TYPES.REVIEW];
    }

    // We don't need to run the logic if this is not a transaction or iou/expense report, so let's shortcut the logic for performance reasons
    if (!isMoneyRequestReport(report) && !isInvoiceReport(report)) {
        return [CONST.SEARCH.ACTION_TYPES.VIEW];
    }

    const allActions: SearchTransactionAction[] = [];
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    let allReportTransactions: SearchTransaction[];
    if (isReportEntry(key)) {
        allReportTransactions = getTransactionsForReport(data, report.reportID);
    } else {
        allReportTransactions = transaction ? [transaction] : [];
    }

    const {isSubmitter, isAdmin, isApprover} = getReviewerPermissionFlags(report, policy, currentAccountID);

    const reportNVP = getReportNameValuePairsFromKey(data, report);
    const isIOUReportArchived = isArchivedReport(reportNVP);

    const chatReportRNVP = data[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.chatReportID}`] ?? undefined;
    const isChatReportArchived = isArchivedReport(chatReportRNVP);

    const hasAnyViolationsForReport = hasAnyViolations(report.reportID, allViolations, allReportTransactions, currentUserEmail, report, policy);
    const hasVisibleViolationsForReport = hasAnyViolationsForReport && ViolationsUtils.hasVisibleViolationsForUser(report, allViolations, currentUserEmail, policy, allReportTransactions);

    // Only check for violations if we need to (when user has permission to review)
    if ((isSubmitter || isApprover || isAdmin) && hasVisibleViolationsForReport) {
        if (isSubmitter && !isApprover && !isAdmin && !canReview(report, allViolations, isIOUReportArchived || isChatReportArchived, currentUserEmail, policy, allReportTransactions)) {
            allActions.push(CONST.SEARCH.ACTION_TYPES.VIEW);
        } else {
            allActions.push(CONST.SEARCH.ACTION_TYPES.REVIEW);
        }
    }
    // Submit/Approve/Pay can only be taken on transactions if the transaction is the only one on the report, otherwise `View` is the only option.
    // If this condition is not met, return early for performance reasons
    if (isTransaction && !transaction?.isFromOneTransactionReport) {
        return allActions.length > 0 ? allActions : [CONST.SEARCH.ACTION_TYPES.VIEW];
    }

    const invoiceReceiverPolicy: OnyxTypes.Policy | undefined =
        isInvoiceReport(report) && report?.invoiceReceiver?.type === CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS
            ? data[`${ONYXKEYS.COLLECTION.POLICY}${report?.invoiceReceiver?.policyID}`]
            : undefined;

    const chatReport = getChatReport(data, report);
    const canBePaid = canIOUBePaid(report, chatReport, policy, allReportTransactions, false, chatReportRNVP, invoiceReceiverPolicy);
    const shouldOnlyShowElsewhere = !canBePaid && canIOUBePaid(report, chatReport, policy, allReportTransactions, true, chatReportRNVP, invoiceReceiverPolicy);

    if ((canBePaid || shouldOnlyShowElsewhere) && !hasOnlyHeldExpenses(report.reportID, allReportTransactions)) {
        allActions.push(CONST.SEARCH.ACTION_TYPES.PAY);
    }

    if (isExportAvailable) {
        allActions.push(CONST.SEARCH.ACTION_TYPES.EXPORT_TO_ACCOUNTING);
    }

    if (isClosedReport(report)) {
        return allActions.length > 0 ? allActions : [CONST.SEARCH.ACTION_TYPES.DONE];
    }

    const hasOnlyPendingCardOrScanningTransactions = allReportTransactions.length > 0 && allReportTransactions.every((t) => isScanning(t) || isPending(t));

    const isAllowedToApproveExpenseReport = isAllowedToApproveExpenseReportUtils(report, undefined, policy);
    if (
        canApproveIOU(report, policy, allReportTransactions) &&
        isAllowedToApproveExpenseReport &&
        !hasOnlyPendingCardOrScanningTransactions &&
        !hasOnlyHeldExpenses(report.reportID, allReportTransactions)
    ) {
        allActions.push(CONST.SEARCH.ACTION_TYPES.APPROVE);
    }

    // We check for isAllowedToApproveExpenseReport because if the policy has preventSelfApprovals enabled, we disable the Submit action and in that case we want to show the View action instead
    if (canSubmitReport(report, policy, allReportTransactions, allViolations, isIOUReportArchived || isChatReportArchived, currentUserEmail) && isAllowedToApproveExpenseReport) {
        allActions.push(CONST.SEARCH.ACTION_TYPES.SUBMIT);
    }

    if (reportNVP?.exportFailedTime) {
        return allActions.length > 0 ? allActions : [CONST.SEARCH.ACTION_TYPES.REVIEW];
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

            const doesDataContainAPastYearTransaction = shouldShowYear(data);
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
                shouldShowYear: doesDataContainAPastYearTransaction,
            };

            if (parentReport && personalDetails) {
                // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                const policy = getPolicy(parentReport.policyID);
                const isParentReportArchived = archivedReportsIDList?.has(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${parentReport?.reportID}`);
                const parentReportName = getReportName(parentReport, policy, undefined, undefined, undefined, undefined, undefined, isParentReportArchived);
                const icons = getIcons(parentReport, personalDetails, null, '', -1, policy, undefined, isParentReportArchived);
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
function createAndOpenSearchTransactionThread(item: TransactionListItemType, hash: number, backTo: string, transactionPreviewData?: TransactionPreviewData, shouldNavigate = true) {
    const previewData = transactionPreviewData
        ? {...transactionPreviewData, hasTransactionThreadReport: true}
        : {hasTransaction: false, hasParentReport: false, hasParentReportAction: false, hasTransactionThreadReport: true};
    setOptimisticDataForTransactionThreadPreview(item, previewData);

    const transactionThreadReport = createTransactionThreadReport(item.report, {reportActionID: item.moneyRequestReportActionID} as OnyxTypes.ReportAction);
    if (transactionThreadReport?.reportID) {
        updateSearchResultsWithTransactionThreadReportID(hash, item.transactionID, transactionThreadReport?.reportID);
    }

    if (shouldNavigate) {
        Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID: transactionThreadReport?.reportID, backTo}));
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
function getReportSections(
    data: OnyxTypes.SearchResults['data'],
    currentSearch: SearchKey,
    currentAccountID: number | undefined,
    currentUserEmail: string,
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'],
    isActionLoadingSet: ReadonlySet<string> | undefined,
    reportActions: Record<string, OnyxTypes.ReportAction[]> = {},
): [TransactionGroupListItemType[], number] {
    const shouldShowMerchant = getShouldShowMerchant(data);

    const doesDataContainAPastYearTransaction = shouldShowYear(data);
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
    const doesDataContainAPastYearReport = shouldShowYear(data, true);

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
                const allActions = getActions(data, allViolations, key, currentSearch, currentAccountID, currentUserEmail, actions);

                const fromDetails =
                    data.personalDetailsList?.[reportItem.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID] ??
                    getPersonalDetailsForAccountID(reportItem.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID) ??
                    emptyPersonalDetails;
                const toDetails = !shouldShowBlankTo && reportItem.managerID ? data.personalDetailsList?.[reportItem.managerID] : emptyPersonalDetails;

                const formattedFrom = formatPhoneNumber(getDisplayNameOrDefault(fromDetails));
                const formattedTo = !shouldShowBlankTo ? formatPhoneNumber(getDisplayNameOrDefault(toDetails)) : '';

                // eslint-disable-next-line @typescript-eslint/no-deprecated
                const formattedStatus = getReportStatusTranslation({stateNum: reportItem.stateNum, statusNum: reportItem.statusNum, translate: translateLocal});

                reportIDToTransactions[reportKey] = {
                    ...reportItem,
                    action: allActions.at(0) ?? CONST.SEARCH.ACTION_TYPES.VIEW,
                    allActions,
                    keyForList: String(reportItem.reportID),
                    groupedBy: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
                    from: fromDetails,
                    to: toDetails,
                    formattedFrom,
                    formattedTo,
                    formattedStatus,
                    transactions,
                    ...(reportPendingAction ? {pendingAction: reportPendingAction} : {}),
                    shouldShowYear: doesDataContainAPastYearReport,
                };

                if (isIOUReport) {
                    reportIDToTransactions[reportKey].reportName = getIOUReportName(data, reportIDToTransactions[reportKey]);
                }
            }
        } else if (isTransactionEntry(key)) {
            const transactionItem = {...data[key]};
            const reportAction = moneyRequestReportActionsByTransactionID.get(transactionItem.transactionID);
            const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${transactionItem.reportID}`;
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            const report = data[`${ONYXKEYS.COLLECTION.REPORT}${transactionItem.reportID}`] as SearchReport | undefined;
            const policy = data[`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`];
            const shouldShowBlankTo = !report || isOpenExpenseReport(report);
            const transactionViolations = getTransactionViolations(allViolations, transactionItem, currentUserEmail, report, policy);
            const actions = Object.values(reportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionItem.reportID}`] ?? {});
            const from = reportAction?.actorAccountID ? (data.personalDetailsList?.[reportAction.actorAccountID] ?? emptyPersonalDetails) : emptyPersonalDetails;
            const to = getToFieldValueForTransaction(transactionItem, report, data.personalDetailsList, reportAction);

            const {formattedFrom, formattedTo, formattedTotal, formattedMerchant, date} = getTransactionItemCommonFormattedProperties(
                transactionItem,
                from,
                to,
                policy,
                formatPhoneNumber,
                report,
            );

            const allActions = getActions(data, allViolations, key, currentSearch, currentAccountID, currentUserEmail, actions);
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
                shouldShowMerchant,
                shouldShowYear: doesDataContainAPastYearTransaction,
                keyForList: transactionItem.transactionID,
                violations: transactionViolations,
                isAmountColumnWide: shouldShowAmountInWideColumn,
                isTaxAmountColumnWide: shouldShowTaxAmountInWideColumn,
            };
            if (reportIDToTransactions[reportKey]?.transactions) {
                reportIDToTransactions[reportKey].transactions.push(transaction);
                reportIDToTransactions[reportKey].from = data.personalDetailsList[data?.[reportKey as ReportKey]?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID];
            } else if (reportIDToTransactions[reportKey]) {
                reportIDToTransactions[reportKey].transactions = [transaction];
                reportIDToTransactions[reportKey].from = data.personalDetailsList[data?.[reportKey as ReportKey]?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID];
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
function getMemberSections(data: OnyxTypes.SearchResults['data'], queryJSON: SearchQueryJSON | undefined): [TransactionMemberGroupListItemType[], number] {
    const memberSections: Record<string, TransactionMemberGroupListItemType> = {};

    for (const key in data) {
        if (isGroupEntry(key)) {
            const memberGroup = data[key] as SearchMemberGroup;
            const personalDetails = data.personalDetailsList[memberGroup.accountID];
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
function getCardSections(data: OnyxTypes.SearchResults['data'], queryJSON: SearchQueryJSON | undefined): [TransactionCardGroupListItemType[], number] {
    const cardSections: Record<string, TransactionCardGroupListItemType> = {};

    for (const key in data) {
        if (isGroupEntry(key)) {
            const cardGroup = data[key] as SearchCardGroup;
            const personalDetails = data.personalDetailsList[cardGroup.accountID];

            let transactionsQueryJSON: SearchQueryJSON | undefined;
            if (queryJSON && cardGroup.cardID) {
                const newFlatFilters = queryJSON.flatFilters.filter((filter) => filter.key !== CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID);
                newFlatFilters.push({key: CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID, filters: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: cardGroup.cardID}]});
                const newQueryJSON: SearchQueryJSON = {...queryJSON, groupBy: undefined, flatFilters: newFlatFilters};
                const newQuery = buildSearchQueryString(newQueryJSON);
                transactionsQueryJSON = buildSearchQueryJSON(newQuery);
            }

            cardSections[key] = {
                groupedBy: CONST.SEARCH.GROUP_BY.CARD,
                transactions: [],
                transactionsQueryJSON,
                ...personalDetails,
                ...cardGroup,
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
            };
        }
    }

    const withdrawalIDSectionsValues = Object.values(withdrawalIDSections);
    return [withdrawalIDSectionsValues, withdrawalIDSectionsValues.length];
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
    currentAccountID,
    currentUserEmail,
    formatPhoneNumber,
    groupBy,
    reportActions = {},
    currentSearch = CONST.SEARCH.SEARCH_KEYS.EXPENSES,
    archivedReportsIDList,
    queryJSON,
    isActionLoadingSet,
}: GetSectionsParams) {
    if (type === CONST.SEARCH.DATA_TYPES.CHAT) {
        return getReportActionsSections(data);
    }
    if (type === CONST.SEARCH.DATA_TYPES.TASK) {
        return getTaskSections(data, formatPhoneNumber, archivedReportsIDList);
    }

    if (type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT) {
        return getReportSections(data, currentSearch, currentAccountID, currentUserEmail, formatPhoneNumber, isActionLoadingSet, reportActions);
    }

    if (groupBy) {
        // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
        // eslint-disable-next-line default-case
        switch (groupBy) {
            case CONST.SEARCH.GROUP_BY.FROM:
                return getMemberSections(data, queryJSON);
            case CONST.SEARCH.GROUP_BY.CARD:
                return getCardSections(data, queryJSON);
            case CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID:
                return getWithdrawalIDSections(data, queryJSON);
        }
    }

    return getTransactionsSections(data, currentSearch, currentAccountID, currentUserEmail, formatPhoneNumber, isActionLoadingSet);
}

/**
 * Sorts sections of data based on a specified column and sort order for displaying sorted results.
 */
function getSortedSections(
    type: SearchDataTypes,
    status: SearchStatus,
    data: ListItemDataType<typeof type, typeof status>,
    localeCompare: LocaleContextProps['localeCompare'],
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
        return getSortedReportData(data as TransactionReportGroupListItemType[], localeCompare, sortBy, sortOrder);
    }

    if (groupBy) {
        // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
        // eslint-disable-next-line default-case
        switch (groupBy) {
            case CONST.SEARCH.GROUP_BY.FROM:
                return getSortedMemberData(data as TransactionMemberGroupListItemType[], localeCompare);
            case CONST.SEARCH.GROUP_BY.CARD:
                return getSortedCardData(data as TransactionCardGroupListItemType[], localeCompare);
            case CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID:
                return getSortedWithdrawalIDData(data as TransactionWithdrawalIDGroupListItemType[], localeCompare);
        }
    }

    return getSortedTransactionData(data as TransactionListItemType[], localeCompare, sortBy, sortOrder);
}

/**
 * Compares two values based on a specified sorting order and column.
 * Handles both string and numeric comparisons.
 */
function compareValues(a: unknown, b: unknown, sortOrder: SortOrder, sortBy: string, localeCompare: LocaleContextProps['localeCompare'], shouldCompareOriginalValue = false): number {
    const isAsc = sortOrder === CONST.SEARCH.SORT_ORDER.ASC;

    if (a === undefined || b === undefined) {
        return 0;
    }

    if (typeof a === 'string' && typeof b === 'string') {
        return isAsc ? localeCompare(a, b) : localeCompare(b, a);
    }

    if (typeof a === 'number' && typeof b === 'number') {
        const aValue = sortBy === CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT && !shouldCompareOriginalValue ? Math.abs(a) : a;
        const bValue = sortBy === CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT && !shouldCompareOriginalValue ? Math.abs(b) : b;
        return isAsc ? aValue - bValue : bValue - aValue;
    }

    return 0;
}

/**
 * @private
 * Sorts transaction sections based on a specified column and sort order.
 */
function getSortedTransactionData(data: TransactionListItemType[], localeCompare: LocaleContextProps['localeCompare'], sortBy?: SearchColumnType, sortOrder?: SortOrder) {
    if (!sortBy || !sortOrder) {
        return data;
    }

    const sortingProperty = transactionColumnNamesToSortingProperty[sortBy];

    if (!sortingProperty) {
        return data;
    }

    return data.sort((a, b) => {
        const aValue = sortingProperty === 'comment' ? a.comment?.comment : a[sortingProperty as keyof TransactionListItemType];
        const bValue = sortingProperty === 'comment' ? b.comment?.comment : b[sortingProperty as keyof TransactionListItemType];

        return compareValues(aValue, bValue, sortOrder, sortingProperty, localeCompare);
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
function getSortedReportData(data: TransactionReportGroupListItemType[], localeCompare: LocaleContextProps['localeCompare'], sortBy?: SearchColumnType, sortOrder?: SortOrder) {
    for (const report of data) {
        report.transactions = getSortedTransactionData(report.transactions, localeCompare, CONST.SEARCH.TABLE_COLUMNS.DATE, CONST.SEARCH.SORT_ORDER.DESC);
    }

    if (!sortBy || !sortOrder) {
        return data.sort((a, b) => {
            if (!a.created || !b.created) {
                return 0;
            }

            return localeCompare(b.created.toLowerCase(), a.created.toLowerCase());
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
 * Sorts member sections based on a specified column and sort order.
 */
function getSortedMemberData(data: TransactionMemberGroupListItemType[], localeCompare: LocaleContextProps['localeCompare']) {
    return data.sort((a, b) => localeCompare(a.displayName ?? a.login ?? '', b.displayName ?? b.login ?? ''));
}

/**
 * @private
 * Sorts card sections based on a specified column and sort order.
 */
function getSortedCardData(data: TransactionCardGroupListItemType[], localeCompare: LocaleContextProps['localeCompare']) {
    return data.sort((a, b) => localeCompare(a.displayName ?? a.login ?? '', b.displayName ?? b.login ?? ''));
}

/**
 * @private
 * Sorts withdrawal ID sections based on a specified column and sort order.
 */
function getSortedWithdrawalIDData(data: TransactionWithdrawalIDGroupListItemType[], localeCompare: LocaleContextProps['localeCompare']) {
    return data.sort((a, b) => localeCompare(b.debitPosted, a.debitPosted));
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
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            (searchResults?.data[key as keyof typeof searchResults.data] as SearchTransaction)?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
    );
}

/**
 * Returns the corresponding translation key for expense type
 */
function getExpenseTypeTranslationKey(expenseType: ValueOf<typeof CONST.SEARCH.TRANSACTION_TYPE>): TranslationPaths {
    // eslint-disable-next-line default-case
    switch (expenseType) {
        case CONST.SEARCH.TRANSACTION_TYPE.DISTANCE:
            return 'common.distance';
        case CONST.SEARCH.TRANSACTION_TYPE.CARD:
            return 'common.card';
        case CONST.SEARCH.TRANSACTION_TYPE.CASH:
            return 'iou.cash';
        case CONST.SEARCH.TRANSACTION_TYPE.PER_DIEM:
            return 'common.perDiem';
    }
}

/**
 * Constructs and configures the overflow menu for search items, handling interactions such as renaming or deleting items.
 */
function getOverflowMenu(itemName: string, hash: number, inputQuery: string, showDeleteModal: (hash: number) => void, isMobileMenu?: boolean, closeMenu?: () => void) {
    return [
        {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            text: translateLocal('common.rename'),
            onSelected: () => {
                if (isMobileMenu && closeMenu) {
                    closeMenu();
                }
                Navigation.navigate(ROUTES.SEARCH_SAVED_SEARCH_RENAME.getRoute({name: encodeURIComponent(itemName), jsonQuery: inputQuery}));
            },
            icon: Expensicons.Pencil,
            shouldShowRightIcon: false,
            shouldShowRightComponent: false,
            shouldCallAfterModalHide: true,
        },
        {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            text: translateLocal('common.delete'),
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

// eslint-disable-next-line @typescript-eslint/max-params
function createTypeMenuSections(
    icons: Record<'Document', IconAsset>,
    currentUserEmail: string | undefined,
    currentUserAccountID: number | undefined,
    cardFeedsByPolicy: Record<string, CardFeedForDisplay[]>,
    defaultCardFeed: CardFeedForDisplay | undefined,
    policies: OnyxCollection<OnyxTypes.Policy>,
    activePolicyID: string | undefined,
    savedSearches: OnyxEntry<OnyxTypes.SaveSearch>,
    isOffline: boolean,
    defaultExpensifyCard: CardFeedForDisplay | undefined,
    isASAPSubmitBetaEnabled: boolean,
    hasViolations: boolean,
    createReportWithConfirmation?: (params: {policyID: string; policyName?: string; onSuccess: (reportID: string) => void; personalDetails?: OnyxTypes.PersonalDetails}) => void,
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
                emptyState: {
                    headerMedia: DotLottieAnimations.Fireworks,
                    title: 'search.searchResults.emptySubmitResults.title',
                    subtitle: 'search.searchResults.emptySubmitResults.subtitle',
                    buttons:
                        groupPoliciesWithChatEnabled.length > 0
                            ? [
                                  {
                                      success: true,
                                      buttonText: 'report.newReport.createReport',
                                      buttonAction: () => {
                                          interceptAnonymousUser(() => {
                                              const activePolicy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`];
                                              const personalDetails = getPersonalDetailsForAccountID(currentUserAccountID) as OnyxTypes.PersonalDetails;

                                              let workspaceIDForReportCreation: string | undefined;

                                              // If the user's default workspace is a paid group workspace with chat enabled, we create a report with it by default
                                              if (activePolicy && activePolicy.isPolicyExpenseChatEnabled && isPaidGroupPolicy(activePolicy)) {
                                                  workspaceIDForReportCreation = activePolicy.id;
                                              } else if (groupPoliciesWithChatEnabled.length === 1) {
                                                  workspaceIDForReportCreation = groupPoliciesWithChatEnabled.at(0)?.id;
                                              }

                                              if (workspaceIDForReportCreation && !shouldRestrictUserBillableActions(workspaceIDForReportCreation) && personalDetails) {
                                                  const policyForCreation =
                                                      policies?.[`${ONYXKEYS.COLLECTION.POLICY}${workspaceIDForReportCreation}`] ??
                                                      groupPoliciesWithChatEnabled.find((policy) => policy?.id === workspaceIDForReportCreation);
                                                  const policyName = policyForCreation?.name ?? activePolicy?.name ?? groupPoliciesWithChatEnabled.at(0)?.name ?? '';

                                                  if (createReportWithConfirmation) {
                                                      createReportWithConfirmation({
                                                          policyID: workspaceIDForReportCreation,
                                                          policyName,
                                                          personalDetails,
                                                          onSuccess: (createdReportID) => {
                                                              Navigation.setNavigationActionToMicrotaskQueue(() => {
                                                                  Navigation.navigate(
                                                                      ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: createdReportID, backTo: Navigation.getActiveRoute()}),
                                                                  );
                                                              });
                                                          },
                                                      });
                                                  } else {
                                                      const {reportID: createdReportID} = createNewReport(
                                                          personalDetails,
                                                          isASAPSubmitBetaEnabled,
                                                          hasViolations,
                                                          workspaceIDForReportCreation,
                                                      );
                                                      Navigation.setNavigationActionToMicrotaskQueue(() => {
                                                          Navigation.navigate(ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: createdReportID, backTo: Navigation.getActiveRoute()}));
                                                      });
                                                  }
                                                  return;
                                              }

                                              if (
                                                  workspaceIDForReportCreation &&
                                                  shouldRestrictUserBillableActions(workspaceIDForReportCreation) &&
                                                  groupPoliciesWithChatEnabled.length === 1
                                              ) {
                                                  Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(workspaceIDForReportCreation));
                                                  return;
                                              }

                                              // If the user's default workspace is personal and the user has more than one group workspace, which is paid and has chat enabled, or a chosen workspace is past the grace period, we need to redirect them to the workspace selection screen
                                              Navigation.navigate(ROUTES.NEW_REPORT_WORKSPACE_SELECTION.getRoute());
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
                    headerMedia: DotLottieAnimations.Fireworks,
                    title: 'search.searchResults.emptyApproveResults.title',
                    subtitle: 'search.searchResults.emptyApproveResults.subtitle',
                },
            });
        }
        if (suggestedSearchesVisibility[CONST.SEARCH.SEARCH_KEYS.PAY]) {
            todoSection.menuItems.push({
                ...suggestedSearches[CONST.SEARCH.SEARCH_KEYS.PAY],
                emptyState: {
                    headerMedia: DotLottieAnimations.Fireworks,
                    title: 'search.searchResults.emptyPayResults.title',
                    subtitle: 'search.searchResults.emptyPayResults.subtitle',
                },
            });
        }
        if (suggestedSearchesVisibility[CONST.SEARCH.SEARCH_KEYS.EXPORT]) {
            todoSection.menuItems.push({
                ...suggestedSearches[CONST.SEARCH.SEARCH_KEYS.EXPORT],
                emptyState: {
                    headerMedia: DotLottieAnimations.Fireworks,
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
                    headerMedia: DotLottieAnimations.Fireworks,
                    title: 'search.searchResults.emptyStatementsResults.title',
                    subtitle: 'search.searchResults.emptyStatementsResults.subtitle',
                },
            });
        }
        if (suggestedSearchesVisibility[CONST.SEARCH.SEARCH_KEYS.UNAPPROVED_CASH]) {
            accountingSection.menuItems.push({
                ...suggestedSearches[CONST.SEARCH.SEARCH_KEYS.UNAPPROVED_CASH],
                emptyState: {
                    headerMedia: DotLottieAnimations.Fireworks,
                    title: 'search.searchResults.emptyUnapprovedResults.title',
                    subtitle: 'search.searchResults.emptyUnapprovedResults.subtitle',
                },
            });
        }
        if (suggestedSearchesVisibility[CONST.SEARCH.SEARCH_KEYS.UNAPPROVED_CARD]) {
            accountingSection.menuItems.push({
                ...suggestedSearches[CONST.SEARCH.SEARCH_KEYS.UNAPPROVED_CARD],
                emptyState: {
                    headerMedia: DotLottieAnimations.Fireworks,
                    title: 'search.searchResults.emptyUnapprovedResults.title',
                    subtitle: 'search.searchResults.emptyUnapprovedResults.subtitle',
                },
            });
        }
        if (suggestedSearchesVisibility[CONST.SEARCH.SEARCH_KEYS.RECONCILIATION]) {
            accountingSection.menuItems.push({
                ...suggestedSearches[CONST.SEARCH.SEARCH_KEYS.RECONCILIATION],
                emptyState: {
                    headerMedia: DotLottieAnimations.Fireworks,
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
function shouldShowEmptyState(isDataLoaded: boolean, dataLength: number, type: SearchDataTypes) {
    return !isDataLoaded || dataLength === 0 || !Object.values(CONST.SEARCH.DATA_TYPES).includes(type);
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

function getHasOptions(type: SearchDataTypes) {
    switch (type) {
        case CONST.SEARCH.DATA_TYPES.EXPENSE:
            return [
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                {text: translateLocal('common.receipt'), value: CONST.SEARCH.HAS_VALUES.RECEIPT},
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                {text: translateLocal('common.attachment'), value: CONST.SEARCH.HAS_VALUES.ATTACHMENT},
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                {text: translateLocal('common.tag'), value: CONST.SEARCH.HAS_VALUES.TAG},
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                {text: translateLocal('common.category'), value: CONST.SEARCH.HAS_VALUES.CATEGORY},
            ];
        case CONST.SEARCH.DATA_TYPES.CHAT:
            return [
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                {text: translateLocal('common.link'), value: CONST.SEARCH.HAS_VALUES.LINK},
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                {text: translateLocal('common.attachment'), value: CONST.SEARCH.HAS_VALUES.ATTACHMENT},
            ];
        default:
            return [];
    }
}

function getTypeOptions(policies: OnyxCollection<OnyxTypes.Policy>, currentUserLogin?: string) {
    const typeOptions: Array<SingleSelectItem<SearchDataTypes>> = [
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        {text: translateLocal('common.expense'), value: CONST.SEARCH.DATA_TYPES.EXPENSE},
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        {text: translateLocal('common.expenseReport'), value: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT},
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        {text: translateLocal('common.chat'), value: CONST.SEARCH.DATA_TYPES.CHAT},
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        {text: translateLocal('common.invoice'), value: CONST.SEARCH.DATA_TYPES.INVOICE},
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        {text: translateLocal('common.trip'), value: CONST.SEARCH.DATA_TYPES.TRIP},
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        {text: translateLocal('common.task'), value: CONST.SEARCH.DATA_TYPES.TASK},
    ];
    const shouldHideInvoiceOption = !canSendInvoice(policies, currentUserLogin) && !hasInvoiceReports();

    // Remove the invoice option if the user is not allowed to send invoices
    return shouldHideInvoiceOption ? typeOptions.filter((typeOption) => typeOption.value !== CONST.SEARCH.DATA_TYPES.INVOICE) : typeOptions;
}

function getGroupByOptions() {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return Object.values(CONST.SEARCH.GROUP_BY).map<SingleSelectItem<SearchGroupBy>>((value) => ({text: translateLocal(`search.filters.groupBy.${value}`), value}));
}

function getGroupCurrencyOptions(currencyList: OnyxTypes.CurrencyList) {
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

function getFeedOptions(allCardFeeds: OnyxCollection<OnyxTypes.CardFeeds>, allCards: OnyxTypes.CardList) {
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
            return [CONST.SEARCH.DATE_PRESETS.THIS_MONTH, CONST.SEARCH.DATE_PRESETS.LAST_MONTH];
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
 */
function getColumnsToShow(
    currentAccountID: number | undefined,
    data: OnyxTypes.SearchResults['data'] | OnyxTypes.Transaction[],
    isExpenseReportView = false,
    type?: SearchDataTypes,
): ColumnVisibility {
    if (type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT) {
        return {
            [CONST.SEARCH.TABLE_COLUMNS.AVATAR]: true,
            [CONST.SEARCH.TABLE_COLUMNS.DATE]: true,
            [CONST.SEARCH.TABLE_COLUMNS.STATUS]: true,
            [CONST.SEARCH.TABLE_COLUMNS.TITLE]: true,
            [CONST.SEARCH.TABLE_COLUMNS.FROM]: true,
            [CONST.SEARCH.TABLE_COLUMNS.TO]: true,
            [CONST.SEARCH.TABLE_COLUMNS.TOTAL]: true,
            [CONST.SEARCH.TABLE_COLUMNS.ACTION]: true,
        };
    }

    if (type === CONST.SEARCH.DATA_TYPES.TASK) {
        return {
            [CONST.SEARCH.TABLE_COLUMNS.DATE]: true,
            [CONST.SEARCH.TABLE_COLUMNS.TITLE]: true,
            [CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION]: true,
            [CONST.SEARCH.TABLE_COLUMNS.FROM]: true,
            [CONST.SEARCH.TABLE_COLUMNS.IN]: true,
            [CONST.SEARCH.TABLE_COLUMNS.ASSIGNEE]: true,
            [CONST.SEARCH.TABLE_COLUMNS.ACTION]: true,
            [CONST.SEARCH.TABLE_COLUMNS.RECEIPT]: false,
            [CONST.SEARCH.TABLE_COLUMNS.MERCHANT]: false,
            [CONST.SEARCH.TABLE_COLUMNS.TO]: false,
            [CONST.SEARCH.TABLE_COLUMNS.CATEGORY]: false,
            [CONST.SEARCH.TABLE_COLUMNS.TAG]: false,
            [CONST.SEARCH.TABLE_COLUMNS.TAX_AMOUNT]: false,
            [CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT]: false,
            [CONST.SEARCH.TABLE_COLUMNS.COMMENTS]: false,
            [CONST.SEARCH.TABLE_COLUMNS.TYPE]: false,
            [CONST.SEARCH.TABLE_COLUMNS.CARD]: false,
            [CONST.SEARCH.TABLE_COLUMNS.WITHDRAWAL_ID]: false,
        };
    }

    const columns: ColumnVisibility = isExpenseReportView
        ? {
              [CONST.REPORT.TRANSACTION_LIST.COLUMNS.RECEIPT]: true,
              [CONST.REPORT.TRANSACTION_LIST.COLUMNS.TYPE]: true,
              [CONST.REPORT.TRANSACTION_LIST.COLUMNS.DATE]: true,
              [CONST.REPORT.TRANSACTION_LIST.COLUMNS.MERCHANT]: false,
              [CONST.REPORT.TRANSACTION_LIST.COLUMNS.DESCRIPTION]: false,
              [CONST.REPORT.TRANSACTION_LIST.COLUMNS.CATEGORY]: false,
              [CONST.REPORT.TRANSACTION_LIST.COLUMNS.TAG]: false,
              [CONST.REPORT.TRANSACTION_LIST.COLUMNS.COMMENTS]: true,
              [CONST.REPORT.TRANSACTION_LIST.COLUMNS.TOTAL_AMOUNT]: true,
          }
        : {
              [CONST.SEARCH.TABLE_COLUMNS.RECEIPT]: true,
              [CONST.SEARCH.TABLE_COLUMNS.TYPE]: true,
              [CONST.SEARCH.TABLE_COLUMNS.DATE]: true,
              [CONST.SEARCH.TABLE_COLUMNS.MERCHANT]: false,
              [CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION]: false,
              [CONST.SEARCH.TABLE_COLUMNS.FROM]: false,
              [CONST.SEARCH.TABLE_COLUMNS.TO]: false,
              [CONST.SEARCH.TABLE_COLUMNS.CATEGORY]: false,
              [CONST.SEARCH.TABLE_COLUMNS.TAG]: false,
              [CONST.SEARCH.TABLE_COLUMNS.TAX_AMOUNT]: false,
              [CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT]: true,
              [CONST.SEARCH.TABLE_COLUMNS.ACTION]: true,
              [CONST.SEARCH.TABLE_COLUMNS.TITLE]: true,
          };

    const {moneyRequestReportActionsByTransactionID} = Array.isArray(data) ? {} : createReportActionsLookupMaps(data);
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const updateColumns = (transaction: OnyxTypes.Transaction | SearchTransaction) => {
        const merchant = transaction.modifiedMerchant ? transaction.modifiedMerchant : (transaction.merchant ?? '');
        if ((merchant !== '' && merchant !== CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT) || isScanning(transaction)) {
            columns[CONST.REPORT.TRANSACTION_LIST.COLUMNS.MERCHANT] = true;
        }

        if (getDescription(transaction) !== '') {
            columns[CONST.REPORT.TRANSACTION_LIST.COLUMNS.DESCRIPTION] = true;
        }

        const category = getCategory(transaction);
        const categoryEmptyValues = CONST.SEARCH.CATEGORY_EMPTY_VALUE.split(',');
        if (category !== '' && !categoryEmptyValues.includes(category)) {
            columns[CONST.REPORT.TRANSACTION_LIST.COLUMNS.CATEGORY] = true;
        }

        const tag = getTag(transaction);
        if (tag !== '' && tag !== CONST.SEARCH.TAG_EMPTY_VALUE) {
            columns[CONST.REPORT.TRANSACTION_LIST.COLUMNS.TAG] = true;
        }

        if (isExpenseReportView) {
            return;
        }

        // The From/To columns display logic depends on the passed report/reportAction i.e. if data is SearchResults and not an array (Transaction[])
        if (!Array.isArray(data)) {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            const report = data[`${ONYXKEYS.COLLECTION.REPORT}${transaction.reportID}`] as SearchReport | undefined;
            const reportAction = moneyRequestReportActionsByTransactionID?.get(transaction.transactionID);

            // Handle From&To columns that are only shown in the Reports page
            // if From or To differ from current user in any transaction, show the columns
            const accountID = reportAction?.actorAccountID;
            if (accountID && accountID !== currentAccountID) {
                columns[CONST.REPORT.TRANSACTION_LIST.COLUMNS.FROM] = true;
            }

            // eslint-disable-next-line @typescript-eslint/no-deprecated
            const toFieldValue = getToFieldValueForTransaction(transaction as SearchTransaction, report, data.personalDetailsList, reportAction);
            if (toFieldValue.accountID && toFieldValue.accountID !== currentAccountID && !columns[CONST.REPORT.TRANSACTION_LIST.COLUMNS.TO]) {
                columns[CONST.REPORT.TRANSACTION_LIST.COLUMNS.TO] = !!report && !isOpenReport(report);
            }
        }
    };

    if (Array.isArray(data)) {
        // eslint-disable-next-line unicorn/no-array-for-each
        data.forEach(updateColumns);
    } else {
        for (const key of Object.keys(data)) {
            if (!isTransactionEntry(key)) {
                continue;
            }
            updateColumns(data[key]);
        }
    }

    return columns;
}

export {
    getSuggestedSearches,
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
    isSearchResultsEmpty,
    isTransactionListItemType,
    isReportActionListItemType,
    shouldShowYear,
    getExpenseTypeTranslationKey,
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
};
export type {SavedSearchMenuItem, SearchTypeMenuSection, SearchTypeMenuItem, SearchDateModifier, SearchDateModifierLower, SearchKey, ArchivedReportsIDSet};
