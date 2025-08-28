import type {TextStyle, ViewStyle} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import DotLottieAnimations from '@components/LottieAnimations';
import type DotLottieAnimation from '@components/LottieAnimations/types';
import type {MenuItemWithLink} from '@components/MenuItemList';
import type {MultiSelectItem} from '@components/Search/FilterDropdowns/MultiSelectPopup';
import type {SingleSelectItem} from '@components/Search/FilterDropdowns/SingleSelectPopup';
import type {
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
import ChatListItem from '@components/SelectionList/ChatListItem';
import TaskListItem from '@components/SelectionList/Search/TaskListItem';
import TransactionGroupListItem from '@components/SelectionList/Search/TransactionGroupListItem';
import TransactionListItem from '@components/SelectionList/Search/TransactionListItem';
import type {
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
} from '@components/SelectionList/types';
import * as Expensicons from '@src/components/Icon/Expensicons';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {SaveSearchItem} from '@src/types/onyx/SaveSearch';
import type SearchResults from '@src/types/onyx/SearchResults';
import type {
    ListItemDataType,
    ListItemType,
    SearchCardGroup,
    SearchDataTypes,
    SearchMemberGroup,
    SearchPersonalDetails,
    SearchPolicy,
    SearchReport,
    SearchTask,
    SearchTransaction,
    SearchTransactionAction,
    SearchWithdrawalIDGroup,
} from '@src/types/onyx/SearchResults';
import type IconAsset from '@src/types/utils/IconAsset';
import {canApproveIOU, canIOUBePaid, canSubmitReport} from './actions/IOU';
import {createNewReport} from './actions/Report';
import type {CardFeedForDisplay} from './CardFeedUtils';
import {getCardFeedsForDisplay} from './CardFeedUtils';
import {convertToDisplayString, getCurrencySymbol} from './CurrencyUtils';
import DateUtils from './DateUtils';
import interceptAnonymousUser from './interceptAnonymousUser';
import {translateLocal} from './Localize';
import Navigation from './Navigation/Navigation';
import Parser from './Parser';
import {getDisplayNameOrDefault} from './PersonalDetailsUtils';
import {arePaymentsEnabled, canSendInvoice, getActivePolicy, getGroupPaidPoliciesWithExpenseChatEnabled, getPolicy, isPaidGroupPolicy, isPolicyPayer} from './PolicyUtils';
import {getOriginalMessage, isCreatedAction, isDeletedAction, isMoneyRequestAction, isResolvedActionableWhisper, isWhisperActionTargetedToOthers} from './ReportActionsUtils';
import {canReview} from './ReportPreviewActionUtils';
import {isExportAction} from './ReportPrimaryActionUtils';
import {
    getIcons,
    getPersonalDetailsForAccountID,
    getReportName,
    getReportOrDraftReport,
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
import {buildCannedSearchQuery, buildQueryStringFromFilterFormValues, buildSearchQueryJSON, getCurrentSearchQueryJSON, getTodoSearchQuery} from './SearchQueryUtils';
import StringUtils from './StringUtils';
import {shouldRestrictUserBillableActions} from './SubscriptionUtils';
import {
    getCategory,
    getDescription,
    getTag,
    getTaxAmount,
    getAmount as getTransactionAmount,
    getCreated as getTransactionCreatedDate,
    getMerchant as getTransactionMerchant,
    isPendingCardOrScanningTransaction,
    isScanning,
    isUnreportedAndHasInvalidDistanceRateTransaction,
    isViolationDismissed,
} from './TransactionUtils';
import shouldShowTransactionYear from './TransactionUtils/shouldShowTransactionYear';

const transactionColumnNamesToSortingProperty = {
    [CONST.SEARCH.TABLE_COLUMNS.TO]: 'formattedTo' as const,
    [CONST.SEARCH.TABLE_COLUMNS.FROM]: 'formattedFrom' as const,
    [CONST.SEARCH.TABLE_COLUMNS.DATE]: 'date' as const,
    [CONST.SEARCH.TABLE_COLUMNS.TAG]: 'tag' as const,
    [CONST.SEARCH.TABLE_COLUMNS.MERCHANT]: 'formattedMerchant' as const,
    [CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT]: 'formattedTotal' as const,
    [CONST.SEARCH.TABLE_COLUMNS.CATEGORY]: 'category' as const,
    [CONST.SEARCH.TABLE_COLUMNS.TYPE]: 'transactionType' as const,
    [CONST.SEARCH.TABLE_COLUMNS.ACTION]: 'action' as const,
    [CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION]: 'comment' as const,
    [CONST.SEARCH.TABLE_COLUMNS.TAX_AMOUNT]: null,
    [CONST.SEARCH.TABLE_COLUMNS.RECEIPT]: null,
    [CONST.SEARCH.TABLE_COLUMNS.IN]: 'parentReportID' as const,
};

const taskColumnNamesToSortingProperty = {
    [CONST.SEARCH.TABLE_COLUMNS.DATE]: 'created' as const,
    [CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION]: 'description' as const,
    [CONST.SEARCH.TABLE_COLUMNS.TITLE]: 'reportName' as const,
    [CONST.SEARCH.TABLE_COLUMNS.FROM]: 'formattedCreatedBy' as const,
    [CONST.SEARCH.TABLE_COLUMNS.ASSIGNEE]: 'formattedAssignee' as const,
    [CONST.SEARCH.TABLE_COLUMNS.IN]: 'parentReportID' as const,
};

const expenseStatusActionMapping = {
    [CONST.SEARCH.STATUS.EXPENSE.DRAFTS]: (expenseReport: SearchReport) =>
        expenseReport?.stateNum === CONST.REPORT.STATE_NUM.OPEN && expenseReport.statusNum === CONST.REPORT.STATUS_NUM.OPEN,
    [CONST.SEARCH.STATUS.EXPENSE.OUTSTANDING]: (expenseReport: SearchReport) =>
        expenseReport?.stateNum === CONST.REPORT.STATE_NUM.SUBMITTED && expenseReport.statusNum === CONST.REPORT.STATUS_NUM.SUBMITTED,
    [CONST.SEARCH.STATUS.EXPENSE.APPROVED]: (expenseReport: SearchReport) =>
        expenseReport?.stateNum === CONST.REPORT.STATE_NUM.APPROVED && expenseReport.statusNum === CONST.REPORT.STATUS_NUM.APPROVED,
    [CONST.SEARCH.STATUS.EXPENSE.PAID]: (expenseReport: SearchReport) =>
        (expenseReport?.stateNum ?? 0) >= CONST.REPORT.STATE_NUM.APPROVED && expenseReport.statusNum === CONST.REPORT.STATUS_NUM.REIMBURSED,
    [CONST.SEARCH.STATUS.EXPENSE.DONE]: (expenseReport: SearchReport) =>
        expenseReport?.stateNum === CONST.REPORT.STATE_NUM.APPROVED && expenseReport.statusNum === CONST.REPORT.STATUS_NUM.CLOSED,
    [CONST.SEARCH.STATUS.EXPENSE.UNREPORTED]: (expenseReport: SearchReport) => !expenseReport,
    [CONST.SEARCH.STATUS.EXPENSE.ALL]: () => true,
};

function isValidExpenseStatus(status: unknown): status is ValueOf<typeof CONST.SEARCH.STATUS.EXPENSE> {
    return typeof status === 'string' && status in expenseStatusActionMapping;
}

function getExpenseStatusOptions(): Array<MultiSelectItem<SingularSearchStatus>> {
    return [
        {text: translateLocal('common.unreported'), value: CONST.SEARCH.STATUS.EXPENSE.UNREPORTED},
        {text: translateLocal('common.draft'), value: CONST.SEARCH.STATUS.EXPENSE.DRAFTS},
        {text: translateLocal('common.outstanding'), value: CONST.SEARCH.STATUS.EXPENSE.OUTSTANDING},
        {text: translateLocal('iou.approved'), value: CONST.SEARCH.STATUS.EXPENSE.APPROVED},
        {text: translateLocal('iou.settledExpensify'), value: CONST.SEARCH.STATUS.EXPENSE.PAID},
        {text: translateLocal('iou.done'), value: CONST.SEARCH.STATUS.EXPENSE.DONE},
    ];
}

function getExpenseReportedStatusOptions(): Array<MultiSelectItem<SingularSearchStatus>> {
    return [
        {text: translateLocal('common.draft'), value: CONST.SEARCH.STATUS.EXPENSE.DRAFTS},
        {text: translateLocal('common.outstanding'), value: CONST.SEARCH.STATUS.EXPENSE.OUTSTANDING},
        {text: translateLocal('iou.approved'), value: CONST.SEARCH.STATUS.EXPENSE.APPROVED},
        {text: translateLocal('iou.settledExpensify'), value: CONST.SEARCH.STATUS.EXPENSE.PAID},
        {text: translateLocal('iou.done'), value: CONST.SEARCH.STATUS.EXPENSE.DONE},
    ];
}

function getChatStatusOptions(): Array<MultiSelectItem<SingularSearchStatus>> {
    return [
        {text: translateLocal('common.unread'), value: CONST.SEARCH.STATUS.CHAT.UNREAD},
        {text: translateLocal('common.sent'), value: CONST.SEARCH.STATUS.CHAT.SENT},
        {text: translateLocal('common.attachments'), value: CONST.SEARCH.STATUS.CHAT.ATTACHMENTS},
        {text: translateLocal('common.links'), value: CONST.SEARCH.STATUS.CHAT.LINKS},
        {text: translateLocal('search.filters.pinned'), value: CONST.SEARCH.STATUS.CHAT.PINNED},
    ];
}

function getInvoiceStatusOptions(): Array<MultiSelectItem<SingularSearchStatus>> {
    return [
        {text: translateLocal('common.outstanding'), value: CONST.SEARCH.STATUS.INVOICE.OUTSTANDING},
        {text: translateLocal('iou.settledExpensify'), value: CONST.SEARCH.STATUS.INVOICE.PAID},
    ];
}

function getTripStatusOptions(): Array<MultiSelectItem<SingularSearchStatus>> {
    return [
        {text: translateLocal('search.filters.current'), value: CONST.SEARCH.STATUS.TRIP.CURRENT},
        {text: translateLocal('search.filters.past'), value: CONST.SEARCH.STATUS.TRIP.PAST},
    ];
}

function getTaskStatusOptions(): Array<MultiSelectItem<SingularSearchStatus>> {
    return [
        {text: translateLocal('common.outstanding'), value: CONST.SEARCH.STATUS.TASK.OUTSTANDING},
        {text: translateLocal('search.filters.completed'), value: CONST.SEARCH.STATUS.TASK.COMPLETED},
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
    icon: IconAsset;
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

/**
 * Returns a list of all possible searches in the LHN, along with their query & hash.
 * *NOTE* When rendering the LHN, you should use the "createTypeMenuSections" method, which
 * contains the conditionals for rendering each of these.
 *
 * If you are updating this function, do not add more params unless absolutely necessary for the searches. The amount of data needed to
 * get the list of searches should be as minimal as possible.
 *
 * These searches should be as static as possible, and should not contain conditionals, or any other logic
 */
function getSuggestedSearches(defaultFeedID: string | undefined, accountID: number = CONST.DEFAULT_NUMBER_ID): Record<ValueOf<typeof CONST.SEARCH.SEARCH_KEYS>, SearchTypeMenuItem> {
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
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            icon: Expensicons.Document,
            searchQuery: buildCannedSearchQuery({groupBy: CONST.SEARCH.GROUP_BY.REPORTS}),
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
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            icon: Expensicons.Pencil,
            searchQuery: getTodoSearchQuery(CONST.SEARCH.SEARCH_KEYS.SUBMIT, accountID),
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
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            icon: Expensicons.ThumbsUp,
            searchQuery: getTodoSearchQuery(CONST.SEARCH.SEARCH_KEYS.APPROVE, accountID),
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
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            icon: Expensicons.MoneyBag,
            searchQuery: getTodoSearchQuery(CONST.SEARCH.SEARCH_KEYS.PAY, accountID),
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
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            icon: Expensicons.CheckCircle,
            searchQuery: getTodoSearchQuery(CONST.SEARCH.SEARCH_KEYS.EXPORT, accountID),
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
): Record<ValueOf<typeof CONST.SEARCH.SEARCH_KEYS>, boolean> {
    let shouldShowSubmitSuggestion = false;
    let shouldShowPaySuggestion = false;
    let shouldShowApproveSuggestion = false;
    let shouldShowExportSuggestion = false;
    let shouldShowStatementsSuggestion = false;
    let shouldShowUnapprovedCashSuggestion = false;
    let shouldShowUnapprovedCardSuggestion = false;
    let shouldShowReconciliationSuggestion = false;

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
        const isPaymentEnabled = arePaymentsEnabled(policy);
        const hasVBBA = !!policy.achAccount?.bankAccountID && policy.achAccount.state === CONST.BANK_ACCOUNT.STATE.OPEN;
        const hasReimburser = !!policy.achAccount?.reimburser;
        const hasCardFeed = cardFeedsByPolicy[policy.id]?.length > 0;
        const isECardEnabled = !!policy.areExpensifyCardsEnabled;
        const isSubmittedTo = Object.values(policy.employeeList ?? {}).some((employee) => {
            return employee.submitsTo === currentUserEmail || employee.forwardsTo === currentUserEmail;
        });

        const isEligibleForSubmitSuggestion = isPaidPolicy;
        const isEligibleForPaySuggestion = isPaidPolicy && isPayer;
        const isEligibleForApproveSuggestion = isPaidPolicy && isApprovalEnabled && (isApprover || isSubmittedTo);
        const isEligibleForExportSuggestion = isExporter;
        const isEligibleForStatementsSuggestion = isPaidPolicy && !!policy.areCompanyCardsEnabled && hasCardFeed;
        const isEligibleForUnapprovedCashSuggestion = isPaidPolicy && isAdmin && isApprovalEnabled && isPaymentEnabled;
        const isEligibleForUnapprovedCardSuggestion = isPaidPolicy && isAdmin && isApprovalEnabled && (hasCardFeed || isECardEnabled);
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
    transactionItem: SearchTransaction,
    from: SearchPersonalDetails,
    to: SearchPersonalDetails,
    policy: SearchPolicy,
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'],
): Pick<TransactionListItemType, 'formattedFrom' | 'formattedTo' | 'formattedTotal' | 'formattedMerchant' | 'date'> {
    const isExpenseReport = transactionItem.reportType === CONST.REPORT.TYPE.EXPENSE;

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
    const merchant = getTransactionMerchant(transactionItem, policy as OnyxTypes.Policy);
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
    return isTransactionGroupListItemType(item) && 'groupedBy' in item && item.groupedBy === CONST.SEARCH.GROUP_BY.REPORTS;
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

function isTransactionAmountTooLong(transactionItem: TransactionListItemType | SearchTransaction | OnyxTypes.Transaction) {
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const amount = Math.abs(transactionItem.modifiedAmount || transactionItem.amount);
    return isAmountTooLong(amount);
}

function isTransactionTaxAmountTooLong(transactionItem: TransactionListItemType | SearchTransaction | OnyxTypes.Transaction) {
    const reportType = (transactionItem as TransactionListItemType)?.reportType;
    const isFromExpenseReport = reportType === CONST.REPORT.TYPE.EXPENSE;
    const taxAmount = getTaxAmount(transactionItem, isFromExpenseReport);
    return isAmountTooLong(taxAmount);
}

function getWideAmountIndicators(data: TransactionListItemType[] | TransactionGroupListItemType[] | TaskListItemType[] | OnyxTypes.SearchResults['data']): {
    shouldShowAmountInWideColumn: boolean;
    shouldShowTaxAmountInWideColumn: boolean;
} {
    let isAmountWide = false;
    let isTaxAmountWide = false;

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
 */
function shouldShowYear(data: TransactionListItemType[] | TransactionGroupListItemType[] | TaskListItemType[] | OnyxTypes.SearchResults['data']) {
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
        if (isTransactionEntry(key)) {
            const item = data[key];
            if (shouldShowTransactionYear(item)) {
                return true;
            }
        } else if (isReportActionEntry(key)) {
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
function getIOUReportName(data: OnyxTypes.SearchResults['data'], reportItem: SearchReport) {
    const payerPersonalDetails = reportItem.managerID ? data.personalDetailsList?.[reportItem.managerID] : emptyPersonalDetails;
    // For cases where the data personal detail for manager ID do not exist in search data.personalDetailsList
    // we fallback to the display name of the personal detail data from onyx.
    const payerName = payerPersonalDetails?.displayName ?? payerPersonalDetails?.login ?? getDisplayNameOrDefault(getPersonalDetailsForAccountID(reportItem.managerID));
    const formattedAmount = convertToDisplayString(reportItem.total ?? 0, reportItem.currency ?? CONST.CURRENCY.USD);
    if (reportItem.action === CONST.SEARCH.ACTION_TYPES.PAID) {
        return translateLocal('iou.payerPaidAmount', {
            payer: payerName,
            amount: formattedAmount,
        });
    }

    return translateLocal('iou.payerOwesAmount', {
        payer: payerName,
        amount: formattedAmount,
    });
}

function getTransactionViolations(allViolations: OnyxCollection<OnyxTypes.TransactionViolation[]>, transaction: SearchTransaction): OnyxTypes.TransactionViolation[] {
    const transactionViolations = allViolations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`];
    if (!transactionViolations) {
        return [];
    }
    return transactionViolations.filter((violation) => !isViolationDismissed(transaction, violation));
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
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'],
): TransactionListItemType[] {
    const shouldShowMerchant = getShouldShowMerchant(data);
    const doesDataContainAPastYearTransaction = shouldShowYear(data);
    const {shouldShowAmountInWideColumn, shouldShowTaxAmountInWideColumn} = getWideAmountIndicators(data);

    // Pre-filter transaction keys to avoid repeated checks
    const transactionKeys = Object.keys(data).filter(isTransactionEntry);
    // Get violations - optimize by using a Map for faster lookups
    const allViolations = getViolations(data);

    // Use Map for faster lookups of personal details
    const personalDetailsMap = new Map(Object.entries(data.personalDetailsList || {}));

    const transactionsSections: TransactionListItemType[] = [];

    const queryJSON = getCurrentSearchQueryJSON();

    for (const key of transactionKeys) {
        const transactionItem = data[key];
        const report = data[`${ONYXKEYS.COLLECTION.REPORT}${transactionItem.reportID}`];

        let shouldShow = true;
        if (queryJSON && !transactionItem.isActionLoading) {
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

        if (shouldShow) {
            const policy = data[`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`];
            const shouldShowBlankTo = !report || isOpenExpenseReport(report);
            const transactionViolations = getTransactionViolations(allViolations, transactionItem);
            // Use Map.get() for faster lookups with default values
            const from = personalDetailsMap.get(transactionItem.accountID.toString()) ?? emptyPersonalDetails;
            const to = transactionItem.managerID && !shouldShowBlankTo ? (personalDetailsMap.get(transactionItem.managerID.toString()) ?? emptyPersonalDetails) : emptyPersonalDetails;

            const {formattedFrom, formattedTo, formattedTotal, formattedMerchant, date} = getTransactionItemCommonFormattedProperties(transactionItem, from, to, policy, formatPhoneNumber);

            const allActions = getActions(data, allViolations, key, currentSearch, currentAccountID);
            const transactionSection: TransactionListItemType = {
                action: allActions.at(0) ?? CONST.SEARCH.ACTION_TYPES.VIEW,
                allActions,
                report,
                from,
                to,
                formattedFrom,
                formattedTo: shouldShowBlankTo ? '' : formattedTo,
                formattedTotal,
                formattedMerchant,
                date,
                shouldShowMerchant,
                keyForList: transactionItem.transactionID,
                shouldShowYear: doesDataContainAPastYearTransaction,
                isAmountColumnWide: shouldShowAmountInWideColumn,
                isTaxAmountColumnWide: shouldShowTaxAmountInWideColumn,
                violations: transactionViolations,
                filename: transactionItem.filename,
                // Manually copying all the properties from transactionItem
                transactionID: transactionItem.transactionID,
                created: transactionItem.created,
                modifiedCreated: transactionItem.modifiedCreated,
                amount: transactionItem.amount,
                canDelete: transactionItem.canDelete,
                canHold: transactionItem.canHold,
                canUnhold: transactionItem.canUnhold,
                modifiedAmount: transactionItem.modifiedAmount,
                currency: transactionItem.currency,
                modifiedCurrency: transactionItem.modifiedCurrency,
                merchant: transactionItem.merchant,
                modifiedMerchant: transactionItem.modifiedMerchant,
                comment: transactionItem.comment,
                category: transactionItem.category,
                transactionType: transactionItem.transactionType,
                reportType: transactionItem.reportType,
                policyID: transactionItem.policyID,
                parentTransactionID: transactionItem.parentTransactionID,
                hasEReceipt: transactionItem.hasEReceipt,
                accountID: transactionItem.accountID,
                managerID: transactionItem.managerID,
                reportID: transactionItem.reportID,
                ...(transactionItem.pendingAction ? {pendingAction: transactionItem.pendingAction} : {}),
                transactionThreadReportID: transactionItem.transactionThreadReportID,
                isFromOneTransactionReport: transactionItem.isFromOneTransactionReport,
                tag: transactionItem.tag,
                receipt: transactionItem.receipt,
                taxAmount: transactionItem.taxAmount,
                description: transactionItem.description,
                mccGroup: transactionItem.mccGroup,
                modifiedMCCGroup: transactionItem.modifiedMCCGroup,
                moneyRequestReportActionID: transactionItem.moneyRequestReportActionID,
                pendingAction: transactionItem.pendingAction,
                errors: transactionItem.errors,
                isActionLoading: transactionItem.isActionLoading,
                hasViolation: transactionItem.hasViolation,
                cardID: transactionItem.cardID,
                cardName: transactionItem.cardName,
            };

            transactionsSections.push(transactionSection);
        }
    }
    return transactionsSections;
}

/**
 * @private
 * Retrieves all transactions associated with a specific report ID from the search data.

 */
function getTransactionsForReport(data: OnyxTypes.SearchResults['data'], reportID: string): SearchTransaction[] {
    return Object.entries(data)
        .filter(([key, value]) => isTransactionEntry(key) && (value as SearchTransaction)?.reportID === reportID)
        .map(([, value]) => value as SearchTransaction);
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

    const policy = getPolicyFromKey(data, report) as OnyxTypes.Policy;
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

    // Only check for violations if we need to (when user has permission to review)
    if ((isSubmitter || isApprover || isAdmin) && hasAnyViolations(report.reportID, allViolations, allReportTransactions)) {
        if (isSubmitter && !isApprover && !isAdmin && !canReview(report, allViolations, isIOUReportArchived || isChatReportArchived, policy, allReportTransactions)) {
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

    const invoiceReceiverPolicy: SearchPolicy | undefined =
        isInvoiceReport(report) && report?.invoiceReceiver?.type === CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS
            ? data[`${ONYXKEYS.COLLECTION.POLICY}${report?.invoiceReceiver?.policyID}`]
            : undefined;

    const chatReport = getChatReport(data, report);
    const canBePaid = canIOUBePaid(report, chatReport, policy, allReportTransactions, false, chatReportRNVP, invoiceReceiverPolicy);

    if (canBePaid && !hasOnlyHeldExpenses(report.reportID, allReportTransactions)) {
        allActions.push(CONST.SEARCH.ACTION_TYPES.PAY);
    }

    if (isExportAvailable) {
        allActions.push(CONST.SEARCH.ACTION_TYPES.EXPORT_TO_ACCOUNTING);
    }

    if (isClosedReport(report)) {
        return allActions.length > 0 ? allActions : [CONST.SEARCH.ACTION_TYPES.DONE];
    }

    const hasOnlyPendingCardOrScanningTransactions = allReportTransactions.length > 0 && allReportTransactions.every(isPendingCardOrScanningTransaction);

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
    if (canSubmitReport(report, policy, allReportTransactions, allViolations, isIOUReportArchived || isChatReportArchived) && isAllowedToApproveExpenseReport) {
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
): TaskListItemType[] {
    return (
        Object.keys(data)
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
                    // eslint-disable-next-line deprecation/deprecation
                    const policy = getPolicy(parentReport.policyID);
                    const parentReportName = getReportName(parentReport, policy, undefined, undefined);
                    const isParentReportArchived = archivedReportsIDList?.has(parentReport?.reportID);
                    const icons = getIcons(parentReport, personalDetails, null, '', -1, policy, undefined, isParentReportArchived);
                    const parentReportIcon = icons?.at(0);

                    result.parentReportName = parentReportName;
                    result.parentReportIcon = parentReportIcon;
                }

                if (report) {
                    result.report = report;
                }

                return result;
            })
    );
}

/**
 * @private
 * Organizes data into List Sections for display, for the ReportActionListItemType of Search Results.
 *
 * Do not use directly, use only via `getSections()` facade.
 */
function getReportActionsSections(data: OnyxTypes.SearchResults['data']): ReportActionListItemType[] {
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

    for (const key in data) {
        if (isReportActionEntry(key)) {
            const reportActions = data[key];
            for (const reportAction of Object.values(reportActions)) {
                const from = data.personalDetailsList?.[reportAction.accountID];
                const report = data[`${ONYXKEYS.COLLECTION.REPORT}${reportAction.reportID}`] ?? {};
                const policy = data[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`] ?? {};
                const originalMessage = isMoneyRequestAction(reportAction) ? getOriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.IOU>(reportAction) : undefined;
                const isSendingMoney = isMoneyRequestAction(reportAction) && originalMessage?.type === CONST.IOU.REPORT_ACTION_TYPE.PAY && originalMessage?.IOUDetails;

                const invoiceReceiverPolicy: SearchPolicy | undefined =
                    report?.invoiceReceiver?.type === CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS ? data[`${ONYXKEYS.COLLECTION.POLICY}${report.invoiceReceiver.policyID}`] : undefined;
                if (
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
                    reportName: getSearchReportName({report, policy, personalDetails: data.personalDetailsList, transactions, invoiceReceiverPolicy, reports, policies}),
                    formattedFrom: from?.displayName ?? from?.login ?? '',
                    date: reportAction.created,
                    keyForList: reportAction.reportActionID,
                });
            }
        }
    }
    return reportActionItems;
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
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'],
    reportActions: Record<string, OnyxTypes.ReportAction[]> = {},
): TransactionGroupListItemType[] {
    const shouldShowMerchant = getShouldShowMerchant(data);

    const doesDataContainAPastYearTransaction = shouldShowYear(data);
    const {shouldShowAmountInWideColumn, shouldShowTaxAmountInWideColumn} = getWideAmountIndicators(data);

    // Get violations - optimize by using a Map for faster lookups
    const allViolations = getViolations(data);

    const queryJSON = getCurrentSearchQueryJSON();
    const reportIDToTransactions: Record<string, TransactionReportGroupListItemType> = {};

    for (const key in data) {
        if (isReportEntry(key) && (data[key].type === CONST.REPORT.TYPE.IOU || data[key].type === CONST.REPORT.TYPE.EXPENSE || data[key].type === CONST.REPORT.TYPE.INVOICE)) {
            const reportItem = {...data[key]};
            const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${reportItem.reportID}`;
            const transactions = reportIDToTransactions[reportKey]?.transactions ?? [];
            const isIOUReport = reportItem.type === CONST.REPORT.TYPE.IOU;
            const actions = reportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportItem.reportID}`];

            let shouldShow = true;
            if (queryJSON && !reportItem.isActionLoading) {
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
                const allActions = getActions(data, allViolations, key, currentSearch, currentAccountID, actions);
                reportIDToTransactions[reportKey] = {
                    ...reportItem,
                    action: allActions.at(0) ?? CONST.SEARCH.ACTION_TYPES.VIEW,
                    allActions,
                    groupedBy: CONST.SEARCH.GROUP_BY.REPORTS,
                    keyForList: reportItem.reportID,
                    from: transactions.length > 0 ? data.personalDetailsList[data?.[reportKey as ReportKey]?.accountID ?? CONST.DEFAULT_NUMBER_ID] : emptyPersonalDetails,
                    to: !shouldShowBlankTo && reportItem.managerID ? data.personalDetailsList?.[reportItem.managerID] : emptyPersonalDetails,
                    transactions,
                    ...(reportPendingAction ? {pendingAction: reportPendingAction} : {}),
                };

                if (isIOUReport) {
                    reportIDToTransactions[reportKey].reportName = getIOUReportName(data, reportIDToTransactions[reportKey]);
                }
            }
        } else if (isTransactionEntry(key)) {
            const transactionItem = {...data[key]};
            const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${transactionItem.reportID}`;
            const report = data[`${ONYXKEYS.COLLECTION.REPORT}${transactionItem.reportID}`];
            const policy = data[`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`];
            const shouldShowBlankTo = !report || isOpenExpenseReport(report);
            const transactionViolations = getTransactionViolations(allViolations, transactionItem);
            const actions = Object.values(reportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionItem.reportID}`] ?? {});

            const from = data.personalDetailsList?.[transactionItem.accountID];
            const to = transactionItem.managerID && !shouldShowBlankTo ? (data.personalDetailsList?.[transactionItem.managerID] ?? emptyPersonalDetails) : emptyPersonalDetails;

            const {formattedFrom, formattedTo, formattedTotal, formattedMerchant, date} = getTransactionItemCommonFormattedProperties(transactionItem, from, to, policy, formatPhoneNumber);

            const allActions = getActions(data, allViolations, key, currentSearch, currentAccountID, actions);
            const transaction = {
                ...transactionItem,
                action: allActions.at(0) ?? CONST.SEARCH.ACTION_TYPES.VIEW,
                allActions,
                report,
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
                reportIDToTransactions[reportKey].from = data.personalDetailsList[data?.[reportKey as ReportKey]?.accountID ?? CONST.DEFAULT_NUMBER_ID];
            } else if (reportIDToTransactions[reportKey]) {
                reportIDToTransactions[reportKey].transactions = [transaction];
                reportIDToTransactions[reportKey].from = data.personalDetailsList[data?.[reportKey as ReportKey]?.accountID ?? CONST.DEFAULT_NUMBER_ID];
            }
        }
    }

    return Object.values(reportIDToTransactions);
}

/**
 * @private
 * Organizes data into List Sections grouped by member for display, for the TransactionGroupListItemType of Search Results.
 *
 * Do not use directly, use only via `getSections()` facade.
 */
function getMemberSections(data: OnyxTypes.SearchResults['data']): TransactionMemberGroupListItemType[] {
    const memberSections: Record<string, TransactionMemberGroupListItemType> = {};

    for (const key in data) {
        if (isGroupEntry(key)) {
            const memberGroup = data[key] as SearchMemberGroup;
            const personalDetails = data.personalDetailsList[memberGroup.accountID];

            memberSections[key] = {
                groupedBy: CONST.SEARCH.GROUP_BY.FROM,
                transactions: [],
                ...personalDetails,
                ...memberGroup,
            };
        }
    }

    return Object.values(memberSections);
}

/**
 * @private
 * Organizes data into List Sections grouped by card for display, for the TransactionGroupListItemType of Search Results.
 *
 * Do not use directly, use only via `getSections()` facade.
 */
function getCardSections(data: OnyxTypes.SearchResults['data']): TransactionCardGroupListItemType[] {
    const cardSections: Record<string, TransactionCardGroupListItemType> = {};

    for (const key in data) {
        if (isGroupEntry(key)) {
            const cardGroup = data[key] as SearchCardGroup;
            const personalDetails = data.personalDetailsList[cardGroup.accountID];

            cardSections[key] = {
                groupedBy: CONST.SEARCH.GROUP_BY.CARD,
                transactions: [],
                ...personalDetails,
                ...cardGroup,
            };
        }
    }

    return Object.values(cardSections);
}

/**
 * @private
 * Organizes data into List Sections grouped by card for display, for the TransactionWithdrawalIDGroupListItemType of Search Results.
 *
 * Do not use directly, use only via `getSections()` facade.
 */
function getWithdrawalIDSections(data: OnyxTypes.SearchResults['data']): TransactionWithdrawalIDGroupListItemType[] {
    const withdrawalIDSections: Record<string, TransactionWithdrawalIDGroupListItemType> = {};

    for (const key in data) {
        if (isGroupEntry(key)) {
            const withdrawalIDGroup = data[key] as SearchWithdrawalIDGroup;

            withdrawalIDSections[key] = {
                groupedBy: CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID,
                transactions: [],
                ...withdrawalIDGroup,
            };
        }
    }

    return Object.values(withdrawalIDSections);
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
    if (groupBy) {
        return TransactionGroupListItem;
    }
    return TransactionListItem;
}

/**
 * Organizes data into appropriate list sections for display based on the type of search results.
 */
function getSections(
    type: SearchDataTypes,
    data: OnyxTypes.SearchResults['data'],
    currentAccountID: number | undefined,
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'],
    groupBy?: SearchGroupBy,
    reportActions: Record<string, OnyxTypes.ReportAction[]> = {},
    currentSearch: SearchKey = CONST.SEARCH.SEARCH_KEYS.EXPENSES,
    archivedReportsIDList?: ArchivedReportsIDSet,
) {
    if (type === CONST.SEARCH.DATA_TYPES.CHAT) {
        return getReportActionsSections(data);
    }
    if (type === CONST.SEARCH.DATA_TYPES.TASK) {
        return getTaskSections(data, formatPhoneNumber, archivedReportsIDList);
    }

    if (groupBy) {
        // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
        // eslint-disable-next-line default-case
        switch (groupBy) {
            case CONST.SEARCH.GROUP_BY.REPORTS:
                return getReportSections(data, currentSearch, currentAccountID, formatPhoneNumber, reportActions);
            case CONST.SEARCH.GROUP_BY.FROM:
                return getMemberSections(data);
            case CONST.SEARCH.GROUP_BY.CARD:
                return getCardSections(data);
            case CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID:
                return getWithdrawalIDSections(data);
        }
    }

    return getTransactionsSections(data, currentSearch, currentAccountID, formatPhoneNumber);
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

    if (groupBy) {
        // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
        // eslint-disable-next-line default-case
        switch (groupBy) {
            case CONST.SEARCH.GROUP_BY.REPORTS:
                return getSortedReportData(data as TransactionReportGroupListItemType[], localeCompare);
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
 * Handles both string and numeric comparisons, with special handling for absolute values when sorting by total amount.
 */
function compareValues(a: unknown, b: unknown, sortOrder: SortOrder, sortBy: string, localeCompare: LocaleContextProps['localeCompare']): number {
    const isAsc = sortOrder === CONST.SEARCH.SORT_ORDER.ASC;

    if (a === undefined || b === undefined) {
        return 0;
    }

    if (typeof a === 'string' && typeof b === 'string') {
        return isAsc ? localeCompare(a, b) : localeCompare(b, a);
    }

    if (typeof a === 'number' && typeof b === 'number') {
        const aValue = sortBy === CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT ? Math.abs(a) : a;
        const bValue = sortBy === CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT ? Math.abs(b) : b;
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

    const sortingProperty = transactionColumnNamesToSortingProperty[sortBy as keyof typeof transactionColumnNamesToSortingProperty];

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

    const sortingProperty = taskColumnNamesToSortingProperty[sortBy as keyof typeof taskColumnNamesToSortingProperty];

    if (!sortingProperty) {
        return data;
    }

    return data.sort((a, b) => {
        const aValue = a[sortingProperty as keyof TaskListItemType];
        const bValue = b[sortingProperty as keyof TaskListItemType];

        return compareValues(aValue, bValue, sortOrder, sortingProperty, localeCompare);
    });
}

/**
 * @private
 * Sorts report sections based on a specified column and sort order.
 */
function getSortedReportData(data: TransactionReportGroupListItemType[], localeCompare: LocaleContextProps['localeCompare']) {
    for (const report of data) {
        report.transactions = getSortedTransactionData(report.transactions, localeCompare, CONST.SEARCH.TABLE_COLUMNS.DATE, CONST.SEARCH.SORT_ORDER.DESC);
    }
    return data.sort((a, b) => {
        const aNewestTransaction = a.transactions?.at(0)?.modifiedCreated ? a.transactions?.at(0)?.modifiedCreated : a.transactions?.at(0)?.created;
        const bNewestTransaction = b.transactions?.at(0)?.modifiedCreated ? b.transactions?.at(0)?.modifiedCreated : b.transactions?.at(0)?.created;

        if (!aNewestTransaction || !bNewestTransaction) {
            return 0;
        }

        return localeCompare(bNewestTransaction.toLowerCase(), aNewestTransaction.toLowerCase());
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
function isSearchResultsEmpty(searchResults: SearchResults) {
    return !Object.keys(searchResults?.data).some((key) => key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION));
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

function createTypeMenuSections(
    currentUserEmail: string | undefined,
    currentUserAccountID: number | undefined,
    cardFeedsByPolicy: Record<string, CardFeedForDisplay[]>,
    defaultCardFeed: CardFeedForDisplay | undefined,
    policies: OnyxCollection<OnyxTypes.Policy>,
    savedSearches: OnyxEntry<OnyxTypes.SaveSearch>,
    isOffline: boolean,
): SearchTypeMenuSection[] {
    const typeMenuSections: SearchTypeMenuSection[] = [];

    const suggestedSearches = getSuggestedSearches(defaultCardFeed?.id, currentUserAccountID);
    const suggestedSearchesVisibility = getSuggestedSearchesVisibility(currentUserEmail, cardFeedsByPolicy, policies);

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
                                              const activePolicy = getActivePolicy();
                                              const personalDetails = getPersonalDetailsForAccountID(currentUserAccountID) as OnyxTypes.PersonalDetails;

                                              let workspaceIDForReportCreation: string | undefined;

                                              // If the user's default workspace is a paid group workspace with chat enabled, we create a report with it by default
                                              if (activePolicy && activePolicy.isPolicyExpenseChatEnabled && isPaidGroupPolicy(activePolicy)) {
                                                  workspaceIDForReportCreation = activePolicy.id;
                                              } else if (groupPoliciesWithChatEnabled.length === 1) {
                                                  workspaceIDForReportCreation = groupPoliciesWithChatEnabled.at(0)?.id;
                                              }

                                              if (workspaceIDForReportCreation && !shouldRestrictUserBillableActions(workspaceIDForReportCreation) && personalDetails) {
                                                  const createdReportID = createNewReport(personalDetails, workspaceIDForReportCreation);
                                                  Navigation.setNavigationActionToMicrotaskQueue(() => {
                                                      Navigation.navigate(ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: createdReportID, backTo: Navigation.getActiveRoute()}));
                                                  });
                                                  return;
                                              }

                                              // If the user's default workspace is personal and the user has more than one group workspace, which is paid and has chat enabled, or a chosen workspace is past the grace period, we need to redirect them to the workspace selection screen
                                              Navigation.navigate(ROUTES.NEW_REPORT_WORKSPACE_SELECTION);
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
        ? searchResults?.search?.status.split(',').sort().join(',')
        : searchResults?.search?.status.sort().join(',');
    const sortedQueryJSONStatus = Array.isArray(status) ? status.sort().join(',') : status;
    const isDataLoaded = searchResults?.data !== undefined && searchResults?.search?.type === queryJSON?.type && sortedSearchResultStatus === sortedQueryJSONStatus;

    return isDataLoaded;
}

function getStatusOptions(type: SearchDataTypes, groupBy: SearchGroupBy | undefined) {
    switch (type) {
        case CONST.SEARCH.DATA_TYPES.CHAT:
            return getChatStatusOptions();
        case CONST.SEARCH.DATA_TYPES.INVOICE:
            return getInvoiceStatusOptions();
        case CONST.SEARCH.DATA_TYPES.TRIP:
            return getTripStatusOptions();
        case CONST.SEARCH.DATA_TYPES.TASK:
            return getTaskStatusOptions();
        case CONST.SEARCH.DATA_TYPES.EXPENSE:
        default:
            return groupBy === CONST.SEARCH.GROUP_BY.REPORTS ? getExpenseReportedStatusOptions() : getExpenseStatusOptions();
    }
}

function getTypeOptions(policies: OnyxCollection<OnyxTypes.Policy>, currentUserLogin?: string) {
    const typeOptions: Array<SingleSelectItem<SearchDataTypes>> = [
        {text: translateLocal('common.expense'), value: CONST.SEARCH.DATA_TYPES.EXPENSE},
        {text: translateLocal('common.chat'), value: CONST.SEARCH.DATA_TYPES.CHAT},
        {text: translateLocal('common.invoice'), value: CONST.SEARCH.DATA_TYPES.INVOICE},
        {text: translateLocal('common.trip'), value: CONST.SEARCH.DATA_TYPES.TRIP},
        {text: translateLocal('common.task'), value: CONST.SEARCH.DATA_TYPES.TASK},
    ];
    const shouldHideInvoiceOption = !canSendInvoice(policies, currentUserLogin) && !hasInvoiceReports();

    // Remove the invoice option if the user is not allowed to send invoices
    return shouldHideInvoiceOption ? typeOptions.filter((typeOption) => typeOption.value !== CONST.SEARCH.DATA_TYPES.INVOICE) : typeOptions;
}

function getGroupByOptions() {
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
    const defaultPresets = [CONST.SEARCH.DATE_PRESETS.THIS_MONTH, CONST.SEARCH.DATE_PRESETS.LAST_MONTH] as SearchDatePreset[];

    switch (filterKey) {
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.POSTED:
            return [...defaultPresets, ...(hasFeed ? [CONST.SEARCH.DATE_PRESETS.LAST_STATEMENT] : [])];
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPORTED:
            return [...defaultPresets, CONST.SEARCH.DATE_PRESETS.NEVER];
        default:
            return defaultPresets;
    }
}

function getWithdrawalTypeOptions(translate: LocaleContextProps['translate']) {
    return Object.values(CONST.SEARCH.WITHDRAWAL_TYPE).map<SingleSelectItem<SearchWithdrawalType>>((value) => ({text: translate(`search.filters.withdrawalType.${value}`), value}));
}

/**
 * Determines what columns to show based on available data
 * @param isExpenseReportView: true when we are inside an expense report view, false if we're in the Reports page.
 */
function getColumnsToShow(
    currentAccountID: number | undefined,
    data: OnyxTypes.SearchResults['data'] | OnyxTypes.Transaction[],
    isExpenseReportView = false,
    isTaskView = false,
): Record<SearchColumnType, boolean> {
    if (isTaskView) {
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

    const columns: Record<string, boolean> = isExpenseReportView
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

        // Handle From&To columns that are only shown in the Reports page
        // if From or To differ from current user in any transaction, show the columns
        const accountID = (transaction as SearchTransaction).accountID;
        if (accountID !== currentAccountID) {
            columns[CONST.REPORT.TRANSACTION_LIST.COLUMNS.FROM] = true;
        }

        const managerID = (transaction as SearchTransaction).managerID;
        if (managerID && managerID !== currentAccountID && !columns[CONST.REPORT.TRANSACTION_LIST.COLUMNS.TO]) {
            const report = (data as OnyxTypes.SearchResults['data'])[`${ONYXKEYS.COLLECTION.REPORT}${transaction.reportID}`];
            columns[CONST.REPORT.TRANSACTION_LIST.COLUMNS.TO] = !!report && !isOpenReport(report);
        }
    };

    if (Array.isArray(data)) {
        data.forEach(updateColumns);
    } else {
        Object.keys(data).forEach((key) => {
            if (!isTransactionEntry(key)) {
                return;
            }
            updateColumns(data[key]);
        });
    }

    return columns;
}

export {
    getSuggestedSearches,
    getListItem,
    getSections,
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
    getWithdrawalTypeOptions,
    getColumnsToShow,
};
export type {SavedSearchMenuItem, SearchTypeMenuSection, SearchTypeMenuItem, SearchDateModifier, SearchDateModifierLower, SearchKey, ArchivedReportsIDSet};
